'use client';

import * as zustand from 'zustand';

import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import {
    AIMessageRole,
    AIMessageStepPhase,
    type AIStreamResponse,
    type AIStreamResponseToolCallPending,
    type AIToolCallResult,
} from '@gitbook/api';
import assertNever from 'assert-never';
import * as React from 'react';
import { getVisitor, useTrackEvent } from '../Insights';
import { getSession } from '../Insights/sessions';
import { useSetSearchState } from '../Search';
import type { AnyAIControl } from './controls';
import { ConfirmControlDef, ConfirmControlOutputSchema } from './controls/ConfirmControl';
import { type RenderAIMessageOptions, streamAIChatResponse } from './server-actions';
import { getTools } from './tools';
import { useAIMessageContextRef } from './useAIMessageContext';

export type AIChatMessage = {
    role: AIMessageRole;
    content: React.ReactNode;
    query?: string;
    activity?: AIChatMessageActivity;
};

export type AIChatMessageActivity = {
    currentPhase?: AIMessageStepPhase;
    toolCount: number;
    hasCommentary: boolean;
    hasFinalAnswer: boolean;
};

export type AIChatStatus =
    | 'default'
    | 'thinking'
    | 'exploring'
    | 'working'
    | 'done'
    | 'error'
    | 'confirm';

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
     * Control to be displayed to the user.
     */
    control: AnyAIControl | null;

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

export type AIChatEvent =
    | { type: 'open' }
    | { type: 'postMessage'; message: string }
    | { type: 'clear' }
    | { type: 'close' };

type AIChatEventData<T extends AIChatEvent['type']> = Omit<
    Extract<AIChatEvent, { type: T }>,
    'type'
>;

type AIChatEventListener = (input?: Omit<AIChatEvent, 'type'>) => void;

export type AIChatController = {
    /** Open the dialog */
    open: () => void;
    /** Close the dialog */
    close: () => void;
    /** Post a message to the session */
    postMessage: (input: { message: string }) => void;
    /** Clear the conversation */
    clear: () => void;
    /** Register an event listener */
    on: <T extends AIChatEvent['type']>(
        event: T,
        listener: (input?: AIChatEventData<T>) => void
    ) => () => void;
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
        control: null,
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

function notify(
    listeners: AIChatEventListener[] | undefined,
    input: Omit<AIChatEvent, 'type'>
): void {
    if (!listeners) return;
    // Defer event listeners to next tick so React can process state updates first
    setTimeout(() => {
        listeners.forEach((listener) => listener(input));
    }, 0);
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
    const setSearchState = useSetSearchState();
    const language = useLanguage();

    // Event listeners storage
    const eventsRef = React.useRef<Map<AIChatEvent['type'], AIChatEventListener[]>>(new Map());

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

        notify(eventsRef.current.get('open'), {});
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

        notify(eventsRef.current.get('close'), {});
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
                    control: null,
                    loading: true,
                    error: false,
                    messages: [
                        ...state.messages,
                        {
                            role: AIMessageRole.Assistant,
                            content: null, // Placeholder for streaming response
                            activity: getDefaultAIChatMessageActivity(),
                        },
                    ],
                };
            });

            // Execute a tool call
            const executeToolCall = async (event: AIStreamResponseToolCallPending) => {
                const tools = getTools();
                const toolDef = tools.find((tool) => tool.name === event.toolCall.tool);

                if (!toolDef || !('execute' in toolDef)) {
                    throw new Error(`Tool ${event.toolCall.tool} not found`);
                }

                try {
                    const result = await toolDef.execute(event.toolCall.input);
                    await streamResponse({
                        toolCall: {
                            tool: event.toolCall.tool,
                            toolCallId: event.toolCallId,
                            output: result.output,
                            summary: result.summary,
                        },
                    });
                } catch (error) {
                    await streamResponse({
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
                const tools = getTools();
                const stream = await streamAIChatResponse({
                    message: input.message,
                    toolCall: input.toolCall,
                    messageContext: messageContextRef.current,
                    previousResponseId: globalState.getState().responseId ?? undefined,
                    session: {
                        sessionId: getSession().id,
                        visitorId: (await getVisitor()).deviceId,
                    },
                    tools: tools.map((tool) => ({
                        name: tool.name,
                        description: tool.description,
                        // Issue with the schema generated by Zod and Next.js serialization.
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
                                responseId: event.response.id ?? null,
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
                            const toolDef = tools.find((tool) => tool.name === event.toolCall.tool);
                            if (!toolDef) {
                                throw new Error(`Tool ${event.toolCall.tool} not found`);
                            }

                            if ('createControl' in toolDef) {
                                globalState.setState((state) => ({
                                    ...state,
                                    control: toolDef.createControl({
                                        context: {
                                            toolCall: event.toolCall,
                                            toolCallId: event.toolCallId,
                                        },
                                        input: event.toolCall.input as any,
                                        language,
                                        send: async (result) => {
                                            await streamResponse({
                                                toolCall: {
                                                    tool: event.toolCall.tool,
                                                    toolCallId: event.toolCallId,
                                                    output: result.output,
                                                    summary: result.summary,
                                                },
                                            });
                                        },
                                    }),
                                }));
                                break;
                            }

                            const confirmation = 'confirmation' in toolDef && toolDef.confirmation;
                            if (confirmation) {
                                globalState.setState((state) => ({
                                    ...state,
                                    control: ConfirmControlDef.createControl({
                                        context: {
                                            toolCall: event.toolCall,
                                            toolCallId: event.toolCallId,
                                        },
                                        input: {
                                            label: confirmation.label,
                                            icon: confirmation.icon,
                                        },
                                        language,
                                        send: async (result) => {
                                            const output = ConfirmControlOutputSchema.parse(
                                                result.output
                                            );
                                            switch (output.result) {
                                                case 'cancelled': {
                                                    await streamResponse({
                                                        toolCall: {
                                                            tool: event.toolCall.tool,
                                                            toolCallId: event.toolCallId,
                                                            output: { cancelled: true },
                                                            summary: {
                                                                icon: 'forward',
                                                                text: tString(
                                                                    language,
                                                                    'tool_call_skipped',
                                                                    confirmation.label
                                                                ),
                                                            },
                                                        },
                                                    });
                                                    break;
                                                }
                                                case 'confirmed':
                                                    await executeToolCall(event);
                                                    break;
                                                default:
                                                    assertNever(output.result);
                                            }
                                        },
                                    }),
                                }));
                                break;
                            }

                            toolToExecute = event;
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
                                activity: updateAIChatMessageActivity(
                                    state.messages[state.messages.length - 1]?.activity ??
                                        getDefaultAIChatMessageActivity(),
                                    event
                                ),
                            },
                        ],
                    }));
                }

                // Execute the tool call if it doesn't require confirmation
                if (toolToExecute) {
                    await executeToolCall(toolToExecute);
                } else {
                    globalState.setState((state) => ({
                        ...state,
                        loading: false,
                        error: false,
                    }));
                }
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
            const { query, messages, control } = globalState.getState();

            if (control) {
                throw new Error("We can't post a message when a control is active");
            }

            // For first message, update the ask parameter in URL
            if (messages.length === 0) {
                setSearchState((prev) => ({
                    ask: input.message,
                    query: prev?.query ?? null,
                    scope: prev?.scope ?? 'default',
                    open: false,
                }));
            }

            notify(eventsRef.current.get('postMessage'), { message: input.message });

            if (query === input.message) {
                // Return early if the message is the same as the previous message
                globalState.setState((state) => ({
                    ...state,
                    opened: true,
                }));
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

            streamResponse({ message: input.message });
        },
        [setSearchState, trackEvent, streamResponse, language]
    );

    // Clear the conversation and reset ask parameter
    const onClear = React.useCallback(() => {
        globalState.setState((state) => ({
            opened: state.opened,
            loading: false,
            messages: [],
            query: null,
            followUpSuggestions: [],
            control: null,
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

    const onEvent = React.useCallback(
        <T extends AIChatEvent['type']>(
            event: T,
            listener: (input?: AIChatEventData<T>) => void
        ) => {
            const listeners = eventsRef.current.get(event) || [];
            listeners.push(listener as AIChatEventListener);
            eventsRef.current.set(event, listeners);
            return () => {
                const currentListeners = eventsRef.current.get(event) || [];
                eventsRef.current.set(
                    event,
                    currentListeners.filter((l) => l !== listener)
                );
            };
        },
        []
    );

    const controller = React.useMemo(() => {
        return {
            open: onOpen,
            close: onClose,
            clear: onClear,
            postMessage: onPostMessage,
            on: onEvent,
        };
    }, [onOpen, onClose, onClear, onPostMessage, onEvent]);

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

export function getAIChatStatus(chat: AIChatState): AIChatStatus {
    if (chat.error) {
        return 'error';
    }

    if (chat.control) {
        return 'confirm';
    }

    if (chat.loading) {
        const latestMessage = getLatestAssistantMessage(chat.messages);
        const phase = latestMessage?.activity?.currentPhase;
        switch (phase) {
            case AIMessageStepPhase.Commentary:
                return 'exploring';
            case AIMessageStepPhase.FinalAnswer:
                return 'working';
            default:
                return 'thinking';
        }
    }

    if (chat.messages.length > 0) {
        return 'done';
    }

    return 'default';
}

function getLatestAssistantMessage(messages: AIChatMessage[]) {
    for (let index = messages.length - 1; index >= 0; index--) {
        const message = messages[index];
        if (message?.role === AIMessageRole.Assistant) {
            return message;
        }
    }

    return null;
}

function updateAIChatMessageActivity(
    activity: AIChatMessageActivity,
    event: AIStreamResponse
): AIChatMessageActivity {
    switch (event.type) {
        case 'response_step_start': {
            return {
                ...activity,
                currentPhase: event.phase,
                hasCommentary:
                    activity.hasCommentary || event.phase === AIMessageStepPhase.Commentary,
                hasFinalAnswer:
                    activity.hasFinalAnswer || event.phase === AIMessageStepPhase.FinalAnswer,
            };
        }
        case 'response_tool_call': {
            return {
                ...activity,
                toolCount: activity.toolCount + 1,
            };
        }
        default:
            return activity;
    }
}

function getDefaultAIChatMessageActivity(): AIChatMessageActivity {
    return {
        currentPhase: undefined,
        toolCount: 0,
        hasCommentary: false,
        hasFinalAnswer: false,
    };
}
