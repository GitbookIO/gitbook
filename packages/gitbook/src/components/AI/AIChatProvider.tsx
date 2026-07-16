'use client';

import { useCurrentContent } from '@/components/hooks';
import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import {
    AIMessageRole,
    type AIStreamResponseToolCallPending,
    type AIToolCallResult,
} from '@gitbook/api';
import assertNever from 'assert-never';
import * as React from 'react';
import { getInsightsSession, useTrackEvent } from '../Insights';
import { useSetSearchState } from '../Search';
import { addRecentSearchQuery } from '../Search/recent-queries';
import type { AIChatReference } from './references';
import { serializeReferences } from './references';
import { type RenderAIMessageOptions, streamAIChatResponse } from './server-actions';
import {
    AIChatControllerContext,
    type AIChatEvent,
    getDefaultAIChatMessageActivity,
    globalAIChatState as globalState,
    updateAIChatMessageActivity,
} from './useAIChat';
import { useAIMessageContextRef } from './useAIMessageContext';
import { useNavigateToPageTool } from './useNavigateToPageTool';

type AIChatEventListener = (input?: Omit<AIChatEvent, 'type'>) => void;

type AIChatEventData<T extends AIChatEvent['type']> = Omit<
    Extract<AIChatEvent, { type: T }>,
    'type'
>;

// The assistant's tools and controls pull in zod (~270KB chunk); load them on demand so the
// provider itself stays light and the chunk is only fetched on AI-enabled sites.
function importAITooling() {
    return Promise.all([import('./tools'), import('./controls/ConfirmControl')]);
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
    const { siteSpaceId } = useCurrentContent();
    const language = useLanguage();

    // Built-in tools exposed to the assistant (e.g. navigating to a page). The tool has a stable
    // identity, so it can be referenced directly from the streaming callback.
    const navigateToPageTool = useNavigateToPageTool();

    // Warm the tools/controls chunk in the background so the first message doesn't pay its
    // download latency. Only runs on AI-enabled sites since the provider is gated.
    React.useEffect(() => {
        void importAITooling();
    }, []);

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

    // Lets `streamResponse` flush a queued follow-up via `onPostMessage`, which is defined later.
    const postMessageRef = React.useRef<((input: { message: string }) => void) | null>(null);

    // Stream a message with the AI backend
    const streamResponse = React.useCallback(
        async (input: {
            /** Text message to send to the AI backend */
            message?: string;
            /** User-typed prompt; compared against state.query to abort stale streams */
            userQuery?: string;
            /** Tool call to send to the AI backend */
            toolCall?: AIToolCallResult;
        }) => {
            globalState.setState((state) => {
                return {
                    ...state,
                    followUpSuggestions: [],
                    control: null,
                    responding: true,
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

            // A stream becomes stale once a newer turn (or a clear) has replaced its
            // query. Because `responding` clears on `response_finish` — before follow-up
            // suggestions finish streaming — the user can start a new turn while this one
            // is still wrapping up. A stale stream must not mutate the shared
            // loading/responding state, which now belongs to the active turn; otherwise
            // it would make the UI look idle mid-response. (`userQuery` is only set for
            // user-initiated turns, not tool-call continuations.)
            const isSuperseded = () =>
                !!input.userQuery && globalState.getState().query !== input.userQuery;

            // Execute a tool call
            const executeToolCall = async (event: AIStreamResponseToolCallPending) => {
                const [{ getTools }] = await importAITooling();
                const tools = getTools([navigateToPageTool]);
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
                const [{ getTools }, { ConfirmControlDef, ConfirmControlOutputSchema }] =
                    await importAITooling();
                const tools = getTools([navigateToPageTool]);
                const stream = await streamAIChatResponse({
                    message: input.message,
                    toolCall: input.toolCall,
                    messageContext: messageContextRef.current,
                    previousResponseId: globalState.getState().responseId ?? undefined,
                    session: await getInsightsSession(),
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

                    if (isSuperseded()) {
                        // Chat was cleared or a newer turn started; stop processing.
                        break;
                    }

                    const event = data.event;

                    switch (event.type) {
                        case 'response_finish': {
                            globalState.setState((state) => ({
                                ...state,
                                responseId: event.response.id ?? null,
                                // Mark as not responding when the response is finished
                                // Even if the stream might continue as we receive 'response_followup_suggestion'
                                responding: false,
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

                // If a newer turn replaced this one while we were finishing (e.g.
                // streaming follow-up suggestions after `response_finish`), abandon this
                // stale stream without executing leftover tools or clearing the shared
                // loading/responding state, which now belongs to the active turn.
                if (isSuperseded()) {
                    return;
                }

                // Execute the tool call if it doesn't require confirmation.
                // When a tool call (or control) keeps the turn going, `loading`
                // stays true: either the recursive `streamResponse` will clear it
                // when its stream settles, or it is cleared below once the loop ends
                // (e.g. while waiting on a user confirmation control).
                if (toolToExecute) {
                    await executeToolCall(toolToExecute);
                } else {
                    globalState.setState((state) => ({
                        ...state,
                        responding: false,
                        loading: false,
                        error: false,
                    }));

                    // Turn settled: send the next queued follow-up (oldest first). Held back while a
                    // control is pending, since posting would throw; it flushes after that resolves.
                    const { queuedMessages, control: activeControl } = globalState.getState();
                    const [next, ...rest] = queuedMessages;
                    if (next !== undefined && !activeControl) {
                        globalState.setState((state) => ({ ...state, queuedMessages: rest }));
                        postMessageRef.current?.({ message: next });
                    }
                }
            } catch (error) {
                console.error('Error streaming AI response', error);
                // Don't surface a stale stream's error onto the active turn.
                if (!isSuperseded()) {
                    globalState.setState((state) => ({
                        ...state,
                        responding: false,
                        loading: false,
                        error: true,
                    }));
                }
            }
        },
        [
            messageContextRef.current,
            renderMessageOptions?.withLinkPreviews,
            renderMessageOptions?.withToolCalls,
            renderMessageOptions?.asEmbeddable,
            language,
            navigateToPageTool,
        ]
    );

    // Post a message to the AI chat
    const onPostMessage = React.useCallback(
        async (input: { message: string }) => {
            const { query, messages, control, references, responding } = globalState.getState();

            if (control) {
                throw new Error("We can't post a message when a control is active");
            }

            // Still streaming: queue this follow-up instead of dropping it (flushed in order in `streamResponse`).
            if (responding) {
                globalState.setState((state) => ({
                    ...state,
                    queuedMessages: [...state.queuedMessages, input.message],
                }));
                return;
            }

            const wireMessage = `${serializeReferences(references)}${input.message}`;

            // For first message, update the ask parameter in URL
            if (messages.length === 0) {
                if (siteSpaceId) {
                    addRecentSearchQuery(siteSpaceId, input.message, 'ask');
                }

                setSearchState((prev) => ({
                    ask: input.message,
                    query: prev?.query ?? null,
                    scope: prev?.scope ?? 'default',
                    open: false,
                }));
            }

            notify(eventsRef.current.get('postMessage'), { message: input.message });

            if (query === input.message && references.length === 0) {
                // Return early if the message is the same as the previous message
                // (unless new references are staged, which change the payload)
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
                            references,
                        },
                    ],
                    query: input.message,
                    followUpSuggestions: [],
                    responding: true,
                    error: false,
                    initialQuery: state.initialQuery ?? input.message,
                    references: [],
                };
            });

            streamResponse({ message: wireMessage, userQuery: input.message });
        },
        [setSearchState, siteSpaceId, trackEvent, streamResponse]
    );

    // Keep the ref current so `streamResponse` can flush a queued follow-up via the latest callback.
    postMessageRef.current = onPostMessage;

    // Remove a follow-up queued while the assistant is still answering (the × on the affordance).
    const onCancelQueuedMessage = React.useCallback((index: number) => {
        globalState.setState((state) =>
            index < 0 || index >= state.queuedMessages.length
                ? state
                : {
                      ...state,
                      queuedMessages: state.queuedMessages.filter((_, i) => i !== index),
                  }
        );
    }, []);

    // Clear the conversation and reset ask parameter
    const onClear = React.useCallback(() => {
        globalState.setState((state) => ({
            opened: state.opened,
            responding: false,
            loading: false,
            messages: [],
            query: null,
            followUpSuggestions: [],
            control: null,
            responseId: null,
            error: false,
            initialQuery: null,
            references: [],
            queuedMessages: [],
        }));

        // Reset ask parameter to empty string (keeps chat open but clears content)
        setSearchState((prev) => ({
            ask: '',
            query: prev?.query ?? null,
            scope: prev?.scope ?? 'default',
            open: false,
        }));
    }, [setSearchState]);

    const onAddReference = React.useCallback((ref: AIChatReference) => {
        globalState.setState((state) => {
            if (state.references.some((existingRef) => existingRef.id === ref.id)) {
                return state;
            }
            return {
                ...state,
                references: [...state.references, ref],
            };
        });
        return ref.id;
    }, []);

    const onRemoveReference = React.useCallback((id: string) => {
        globalState.setState((state) => {
            if (!state.references.some((ref) => ref.id === id)) {
                return state;
            }
            return {
                ...state,
                references: state.references.filter((ref) => ref.id !== id),
            };
        });
    }, []);

    const onClearReferences = React.useCallback(() => {
        globalState.setState((state) => {
            if (state.references.length === 0) {
                return state;
            }
            return { ...state, references: [] };
        });
    }, []);

    const onFocus = React.useCallback(() => {
        notify(eventsRef.current.get('focus'), {});
    }, []);

    const onSetDraft = React.useCallback((draft: string) => {
        globalState.setState({ draft });
    }, []);

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
            addReference: onAddReference,
            removeReference: onRemoveReference,
            clearReferences: onClearReferences,
            focus: onFocus,
            setDraft: onSetDraft,
            cancelQueuedMessage: onCancelQueuedMessage,
            on: onEvent,
        };
    }, [
        onOpen,
        onClose,
        onClear,
        onPostMessage,
        onAddReference,
        onRemoveReference,
        onClearReferences,
        onFocus,
        onSetDraft,
        onCancelQueuedMessage,
        onEvent,
    ]);

    return (
        <AIChatControllerContext.Provider value={controller}>
            {children}
        </AIChatControllerContext.Provider>
    );
}
