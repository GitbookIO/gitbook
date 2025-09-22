'use client';

import * as zustand from 'zustand';

import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import {
    AIMessageRole,
    type AIStreamResponseToolCallPending,
    type AIToolCallResult,
} from '@gitbook/api';
import type { IconName } from '@gitbook/icons';
import * as React from 'react';
import { useTrackEvent } from '../Insights';
import { integrationsAssistantTools } from '../Integrations';
import { useSearch } from '../Search';
import { type RenderAIMessageOptions, streamAIChatResponse } from './server-actions';
import { useAIMessageContextRef } from './useAIMessageContext';

export type AIChatMessage = {
    role: AIMessageRole;
    content: React.ReactNode;
    query?: string;
};

export type AIChatPendingTool = {
    icon?: IconName;
    label: string;

    /**
     * Confirm the tool call by calling this function.
     */
    confirm: () => Promise<void>;

    /**
     * Tool call result to cancel it.
     */
    cancelToolCall: AIToolCallResult;
};

export type AIChatState = {
    /**
     * If true, the chat is open.
     */
    opened: boolean;

    /**
     * ID of the latest AI response.
     */
    responseId: string | null;

    /**
     * The latest query sent to the AI.
     */
    query: string | null;

    /**
     * The first query sent to the AI. This is appended to the URL when the AI chat is opened.
     */
    initialQuery: string | null;

    /**
     * Messages in the session.
     */
    messages: AIChatMessage[];

    /**
     * Suggestions for follow-up messages.
     */
    followUpSuggestions: string[];

    /**
     * Tools that are pending confirmation to be executed.
     */
    pendingTools: AIChatPendingTool[];

    /**
     * If true, the session is in progress.
     */
    loading: boolean;

    /**
     * Set to true when an error occurred while communicating with the server. When
     * this flag is true, the chat input should be read-only and the UI should
     * display an error alert. Clearing the conversation will reset this flag.
     */
    error: boolean;
};

export type AIChatController = {
    /** Open the dialog */
    open: () => void;
    /** Close the dialog */
    close: () => void;
    /** Post a message to the session */
    postMessage: (input: { message: string }) => void;
    /** Clear the conversation */
    clear: () => void;
};

const AIChatControllerContext = React.createContext<AIChatController | null>(null);

// Global state store for AI chat
const globalState = zustand.create<AIChatState>(() => {
    return {
        opened: false,
        responseId: null,
        messages: [],
        query: null,
        followUpSuggestions: [],
        pendingTools: [],
        loading: false,
        error: false,
        initialQuery: null,
    };
});

/**
 * Get the current state of the AI chat.
 */
export function useAIChatState(): AIChatState {
    const state = zustand.useStore(globalState);
    return state;
}

/**
 * Provide the controller to interact with the AI chat.
 */
export function AIChatProvider(props: {
    renderMessageOptions?: RenderAIMessageOptions;
    children: React.ReactNode;
}) {
    const { renderMessageOptions, children } = props;

    const messageContextRef = useAIMessageContextRef();
    const trackEvent = useTrackEvent();
    const [, setSearchState] = useSearch();
    const language = useLanguage();

    // Open AI chat and sync with search state
    const onOpen = React.useCallback(() => {
        const { initialQuery } = globalState.getState();
        globalState.setState((state) => ({ ...state, opened: true }));

        // Update search state to show ask mode with first message or current ask value
        setSearchState((prev) => ({
            ask: prev?.ask ?? initialQuery ?? '',
            query: prev?.query ?? null,
            scope: prev?.scope ?? 'default',
            open: false, // Close search popover when opening chat
        }));
    }, [setSearchState]);

    // Close AI chat and clear ask parameter
    const onClose = React.useCallback(() => {
        globalState.setState((state) => ({ ...state, opened: false }));

        // Clear ask parameter but keep other search state
        setSearchState((prev) => ({
            ask: null,
            query: prev?.query ?? null,
            scope: prev?.scope ?? 'default',
            open: false,
        }));
    }, [setSearchState]);

    // Stream a message with the AI backend
    const streamResponse = React.useCallback(
        async (input: {
            /** Text message to send to the AI backend */
            message?: string;
            /** Tool call to send to the AI backend */
            toolCall?: AIToolCallResult;
        }) => {
            globalState.setState((state) => {
                return {
                    ...state,
                    followUpSuggestions: [],
                    pendingTools: [],
                    loading: true,
                    error: false,
                    messages: [
                        ...state.messages,
                        {
                            role: AIMessageRole.Assistant,
                            content: null, // Placeholder for streaming response
                        },
                    ],
                };
            });

            // Execute a tool call
            const executeToolCall = async (event: AIStreamResponseToolCallPending) => {
                const integrationTools = integrationsAssistantTools.getState().tools;
                const toolDef = integrationTools.find((tool) => tool.name === event.toolCall.tool);

                if (!toolDef) {
                    throw new Error(`Tool ${event.toolCall.tool} not found`);
                }

                try {
                    const result = await toolDef.execute(event.toolCall.input);
                    streamResponse({
                        toolCall: {
                            tool: event.toolCall.tool,
                            toolCallId: event.toolCallId,
                            output: result.output,
                            summary: result.summary,
                        },
                    });
                } catch (error) {
                    streamResponse({
                        toolCall: {
                            tool: event.toolCall.tool,
                            toolCallId: event.toolCallId,
                            output: {
                                error: error instanceof Error ? error.message : 'Unknown error',
                            },
                            summary: {
                                icon: 'bomb',
                                text: 'An error occurred while executing the tool',
                            },
                        },
                    });
                }
            };

            let toolToExecute: AIStreamResponseToolCallPending | null = null;
            try {
                const integrationTools = integrationsAssistantTools.getState().tools;
                const stream = await streamAIChatResponse({
                    message: input.message,
                    toolCall: input.toolCall,
                    messageContext: messageContextRef.current,
                    previousResponseId: globalState.getState().responseId ?? undefined,
                    tools: integrationTools.map((tool) => ({
                        name: tool.name,
                        description: tool.description,
                        inputSchema: tool.inputSchema,
                    })),
                    options: {
                        withLinkPreviews: renderMessageOptions?.withLinkPreviews ?? true,
                        withToolCalls: renderMessageOptions?.withToolCalls ?? true,
                        asEmbeddable: renderMessageOptions?.asEmbeddable ?? false,
                    },
                });

                // Process streaming response
                for await (const data of stream) {
                    if (!data) continue;

                    if (input.message && globalState.getState().query !== input.message) {
                        // Chat was cleared, stop processing the stream
                        break;
                    }

                    const event = data.event;

                    switch (event.type) {
                        case 'response_finish': {
                            globalState.setState((state) => ({
                                ...state,
                                responseId: event.responseId,
                                // Mark as not loading when the response is finished
                                // Even if the stream might continue as we receive 'response_followup_suggestion'
                                loading: false,
                                error: false,
                            }));
                            break;
                        }
                        case 'response_followup_suggestion': {
                            globalState.setState((state) => ({
                                ...state,
                                followUpSuggestions: [
                                    ...state.followUpSuggestions,
                                    ...event.suggestions,
                                ],
                            }));
                            break;
                        }
                        case 'response_tool_call_pending': {
                            const toolDef = integrationTools.find(
                                (tool) => tool.name === event.toolCall.tool
                            );
                            if (!toolDef) {
                                throw new Error(`Tool ${event.toolCall.tool} not found`);
                            }

                            const confirmation = toolDef.confirmation;
                            if (confirmation) {
                                globalState.setState((state) => ({
                                    ...state,
                                    pendingTools: [
                                        ...state.pendingTools,
                                        {
                                            icon: confirmation.icon,
                                            label: confirmation.label,
                                            cancelToolCall: {
                                                tool: event.toolCall.tool,
                                                toolCallId: event.toolCallId,
                                                output: {
                                                    cancelled: 'User did not confirm the tool call',
                                                },
                                                summary: {
                                                    icon: 'forward',
                                                    text: tString(
                                                        language,
                                                        'tool_call_skipped',
                                                        confirmation.label
                                                    ),
                                                },
                                            },
                                            confirm: async () => {
                                                await executeToolCall(event);
                                            },
                                        },
                                    ],
                                }));
                            } else {
                                toolToExecute = event;
                            }
                            break;
                        }
                    }

                    // Update the assistant message with streamed content
                    globalState.setState((state) => ({
                        ...state,
                        messages: [
                            ...state.messages.slice(0, -1),
                            {
                                role: AIMessageRole.Assistant,
                                content: data.content,
                            },
                        ],
                    }));
                }

                // Execute the tool call if it doesn't require confirmation
                if (toolToExecute) {
                    await executeToolCall(toolToExecute);
                }

                globalState.setState((state) => ({
                    ...state,
                    loading: false,
                    error: false,
                }));
            } catch (error) {
                console.error('Error streaming AI response', error);
                globalState.setState((state) => ({
                    ...state,
                    loading: false,
                    error: true,
                }));
            }
        },
        [
            messageContextRef.current,
            renderMessageOptions?.withLinkPreviews,
            renderMessageOptions?.withToolCalls,
            renderMessageOptions?.asEmbeddable,
            language,
        ]
    );

    // Post a message to the AI chat
    const onPostMessage = React.useCallback(
        async (input: { message: string }) => {
            const { query, messages, pendingTools } = globalState.getState();

            // For first message, update the ask parameter in URL
            if (messages.length === 0) {
                setSearchState((prev) => ({
                    ask: input.message,
                    query: prev?.query ?? null,
                    scope: prev?.scope ?? 'default',
                    open: false,
                }));
            }

            if (query === input.message) {
                // Return early if the message is the same as the previous message
                return;
            }

            trackEvent({ type: 'ask_question', query: input.message });

            // Add user message and placeholder for AI response
            globalState.setState((state) => {
                return {
                    ...state,
                    messages: [
                        ...state.messages,
                        {
                            role: AIMessageRole.User,
                            content: input.message,
                            query: input.message,
                        },
                    ],
                    query: input.message,
                    followUpSuggestions: [],
                    loading: true,
                    error: false,
                    initialQuery: state.initialQuery ?? input.message,
                };
            });

            const pendingTool = pendingTools[0];
            streamResponse({
                message: input.message,
                // If we had a pending tool call, we need to send it as being cancelled
                // otherwise the AI will fail to process the message
                ...(pendingTool ? { toolCall: pendingTool.cancelToolCall } : {}),
            });
        },
        [setSearchState, trackEvent, streamResponse]
    );

    // Clear the conversation and reset ask parameter
    const onClear = React.useCallback(() => {
        globalState.setState((state) => ({
            opened: state.opened,
            loading: false,
            messages: [],
            query: null,
            followUpSuggestions: [],
            pendingTools: [],
            responseId: null,
            error: false,
            initialQuery: null,
        }));

        // Reset ask parameter to empty string (keeps chat open but clears content)
        setSearchState((prev) => ({
            ask: '',
            query: prev?.query ?? null,
            scope: prev?.scope ?? 'default',
            open: false,
        }));
    }, [setSearchState]);

    const controller = React.useMemo(() => {
        return {
            open: onOpen,
            close: onClose,
            clear: onClear,
            postMessage: onPostMessage,
        };
    }, [onOpen, onClose, onClear, onPostMessage]);

    return (
        <AIChatControllerContext.Provider value={controller}>
            {children}
        </AIChatControllerContext.Provider>
    );
}

/**
 * Get the controller to interact with the AI chat.
 * Integrates with search state to synchronize ?ask= parameter.
 */
export function useAIChatController(): AIChatController {
    const controller = React.useContext(AIChatControllerContext);
    if (!controller) {
        throw new Error('useAIChatController must be used within an AIChatProvider');
    }
    return controller;
}
