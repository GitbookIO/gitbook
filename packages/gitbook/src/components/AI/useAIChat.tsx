'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';
import * as zustand from 'zustand';

import {
    AIMessageRole,
    AIMessageStepPhase,
    type AIToolCallResult,
    type SiteInsightsEventAskView,
} from '@gitbook/api';

import { useTrackEvent } from '../Insights';
import { type UpdateSearchState, useSetSearchState } from '../Search';
import { addRecentSearchQuery } from '../Search/recent-queries';
import type { AnyAIControl } from './controls';
import { setIntercomLauncherHidden } from './intercom';
import { type AIChatReference, serializeReferences } from './references';
import type { RenderAIMessageOptions } from './server-actions';
import { useAIMessageContextRef } from './useAIMessageContext';
import type { ResponseToRate } from './useSubmitAssistantFeedbackTool';
import { useCurrentContent } from '@/components/hooks';

const noopSetSearchState: UpdateSearchState = () => Promise.resolve(new URLSearchParams());

export type AIChatMessage = {
    role: AIMessageRole;
    content: React.ReactNode;
    query?: string;
    references?: AIChatReference[];
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

export type AskAITrigger = NonNullable<SiteInsightsEventAskView['trigger']>;

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
     * If true, the assistant is actively producing its answer — from the moment a
     * message is sent until the `response_finish` event. It is cleared at that point
     * (even though follow-up suggestions may still trickle in) so the input can be
     * re-enabled. Drives the local "are we still answering" UI: the disabled input,
     * the loading shim, and the thinking/exploring/working status.
     */
    responding: boolean;

    /**
     * If true, the turn is still in progress overall: from the moment a message is
     * sent until the stream fully completes, including the follow-up suggestion
     * phase.
     *
     * Unlike `responding` — which clears on `response_finish` — this stays true
     * until the response is truly settled. It is the global busyness indicator,
     * surfaced as `aria-busy` on the chat so that assistive tech (and visual tests)
     * can wait for a complete, stable response.
     */
    loading: boolean;

    /**
     * Set to true when an error occurred while communicating with the server. When
     * this flag is true, the chat input should be read-only and the UI should
     * display an error alert. Clearing the conversation will reset this flag.
     */
    error: boolean;

    /**
     * References staged on the next user message.
     */
    references: AIChatReference[];

    /**
     * Draft text to pre-fill the chat input with, without sending it. The chat input consumes
     * this value (seeding its editable content) and then clears it back to an empty string.
     */
    draft: string;

    /**
     * Follow-ups the visitor submitted while a previous turn was still streaming. They are held
     * here and sent automatically, one at a time in submission order, as each answer finishes
     * (see the flush in `streamResponse`), so submitting mid-stream isn't lost. Empty when
     * nothing is queued.
     */
    queuedMessages: string[];
};

export type AIChatEvent =
    | { type: 'open' }
    | { type: 'postMessage'; message: string }
    | { type: 'clear' }
    | { type: 'close' }
    | { type: 'focus' };

type AIChatEventData<T extends AIChatEvent['type']> = Omit<
    Extract<AIChatEvent, { type: T }>,
    'type'
>;

type AIChatEventListener = (input?: Omit<AIChatEvent, 'type'>) => void;

export type AIChatController = {
    /** Open the dialog */
    open: (trigger?: AskAITrigger) => void;
    /** Close the dialog */
    close: () => void;
    /** Post a message to the session */
    postMessage: (input: { message: string }) => void;
    /** Clear the conversation */
    clear: () => void;
    /** Stage a reference on the next message */
    addReference: (ref: AIChatReference) => string;
    /** Remove a staged reference */
    removeReference: (id: string) => void;
    /** Clear all staged references */
    clearReferences: () => void;
    /** Focus the chat input */
    focus: () => void;
    /** Pre-fill the chat input with draft text, without sending it. */
    setDraft: (draft: string) => void;
    /** Remove a follow-up queued to send after the current answer finishes, by its queue index. */
    cancelQueuedMessage: (index: number) => void;
    /** Register an event listener */
    on: <T extends AIChatEvent['type']>(
        event: T,
        listener: (input?: AIChatEventData<T>) => void
    ) => () => void;
};

export type StreamAIChatInput = {
    /** Text message to send to the AI backend */
    message?: string;
    /** User-typed prompt; compared against state.query to abort stale streams */
    userQuery?: string;
    /** Tool call to send to the AI backend */
    toolCall?: AIToolCallResult;
};

export type StreamAIChatResponse = (input: StreamAIChatInput) => Promise<void>;

const AIChatEngine = dynamic(() => import('./AIChatEngine').then((mod) => mod.AIChatEngine), {
    ssr: false,
});

// Module-level like `globalState`, so a remounted provider still sends what was queued.
const pendingStreams: StreamAIChatInput[] = [];

const AIChatControllerContext = React.createContext<AIChatController | null>(null);

// Global state store for AI chat
export const globalState = zustand.create<AIChatState>(() => {
    return {
        opened: false,
        responseId: null,
        messages: [],
        query: null,
        followUpSuggestions: [],
        control: null,
        responding: false,
        loading: false,
        error: false,
        initialQuery: null,
        references: [],
        draft: '',
        queuedMessages: [],
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
    /** Whether page feedback is enabled for the site (gates the submit-feedback tool). */
    withPageFeedback?: boolean;
    children: React.ReactNode;
}) {
    const { renderMessageOptions, withPageFeedback = false, children } = props;

    const messageContextRef = useAIMessageContextRef();
    const trackEvent = useTrackEvent();
    const setSearchStateInURL = useSetSearchState();
    const { siteSpaceId } = useCurrentContent();

    // The embed keeps its state in its own routes, not in URL search params.
    const setSearchState = renderMessageOptions?.asEmbeddable
        ? noopSetSearchState
        : setSearchStateInURL;

    // The assistant response the user is reacting to. Snapshotted when a new user turn begins
    // (before it overwrites the store's responseId/query), so the self-feedback tool rates that
    // previous response rather than the one this reaction turn produces.
    const responseToRateRef = React.useRef<ResponseToRate>({ responseId: null, query: null });

    // Findings reported to the site's team are capped at one per conversation, so the assistant
    // cannot flood the inbox over a long chat.
    const reportedAgentFeedbackRef = React.useRef(false);

    // Streaming, tools and their schemas load on first use to keep them out of the initial bundle.
    const [engineRequested, setEngineRequested] = React.useState(() => pendingStreams.length > 0);
    const engineRef = React.useRef<StreamAIChatResponse | null>(null);
    const streamResponse = React.useCallback((input: StreamAIChatInput) => {
        if (engineRef.current) {
            void engineRef.current(input);
            return;
        }
        pendingStreams.push(input);
        setEngineRequested(true);
    }, []);

    // Event listeners storage
    const eventsRef = React.useRef<Map<AIChatEvent['type'], AIChatEventListener[]>>(new Map());

    // Open AI chat and sync with search state
    const onOpen = React.useCallback(
        (trigger?: AskAITrigger) => {
            setIntercomLauncherHidden(true);
            setEngineRequested(true);
            if (!renderMessageOptions?.asEmbeddable) {
                trackEvent({ type: 'ask_view', trigger });
            }

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
        },
        [setSearchState, trackEvent, renderMessageOptions?.asEmbeddable]
    );

    // Close AI chat and clear ask parameter
    const onClose = React.useCallback(() => {
        setIntercomLauncherHidden(false);

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

    // Post a message to the AI chat
    const onPostMessage = React.useCallback(
        async (input: { message: string }) => {
            const { query, messages, control, references, responding, opened } =
                globalState.getState();

            // Still streaming, or waiting on a control (e.g. a tool confirmation): queue this
            // follow-up instead of dropping it (flushed in order in `streamResponse`).
            if (responding || control) {
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

            if (query === input.message && references.length === 0 && !opened) {
                globalState.setState((state) => ({
                    ...state,
                    opened: true,
                }));
                return;
            }

            // Snapshot the response the user is reacting to before this turn overwrites the store's
            // query/responseId, so the self-feedback tool rates the previous answer. `query` and
            // `responseId` here still describe the last completed turn.
            const { responseId: previousResponseId } = globalState.getState();
            if (previousResponseId) {
                responseToRateRef.current = { responseId: previousResponseId, query };
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
        responseToRateRef.current = { responseId: null, query: null };
        reportedAgentFeedbackRef.current = false;
        pendingStreams.length = 0;
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
            {engineRequested ? (
                <AIChatEngine
                    renderMessageOptions={renderMessageOptions}
                    withPageFeedback={withPageFeedback}
                    messageContextRef={messageContextRef}
                    responseToRateRef={responseToRateRef}
                    reportedAgentFeedbackRef={reportedAgentFeedbackRef}
                    postMessageRef={postMessageRef}
                    engineRef={engineRef}
                    pendingStreams={pendingStreams}
                />
            ) : null}
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

    if (chat.responding) {
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
