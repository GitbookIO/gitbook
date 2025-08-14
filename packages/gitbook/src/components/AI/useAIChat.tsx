'use client';

import * as zustand from 'zustand';

import { AIMessageRole } from '@gitbook/api';
import * as React from 'react';
import { useTrackEvent } from '../Insights';
import { useSearch } from '../Search';
import { streamAIChatResponse } from './server-actions';
import { useAIMessageContextRef } from './useAIMessageContext';

export type AIChatMessage = {
    role: AIMessageRole;
    content: React.ReactNode;
    query?: string;
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

// Global state store for AI chat
const globalState = zustand.create<{
    state: AIChatState;
    setState: (fn: (state: AIChatState) => Partial<AIChatState>) => void;
}>((set) => {
    return {
        state: {
            opened: false,
            responseId: null,
            messages: [],
            query: null,
            followUpSuggestions: [],
            loading: false,
            error: false,
            initialQuery: null,
        },
        setState: (fn) => set((state) => ({ state: { ...state.state, ...fn(state.state) } })),
    };
});

/**
 * Get the current state of the AI chat.
 */
export function useAIChatState(): AIChatState {
    const state = zustand.useStore(globalState, (state) => state.state);
    return state;
}

/**
 * Get the controller to interact with the AI chat.
 * Integrates with search state to synchronize ?ask= parameter.
 */
export function useAIChatController(): AIChatController {
    const messageContextRef = useAIMessageContextRef();
    const setState = zustand.useStore(globalState, (state) => state.setState);
    const trackEvent = useTrackEvent();
    const [searchState, setSearchState] = useSearch(true);

    // Open AI chat and sync with search state
    const onOpen = React.useCallback(() => {
        const { initialQuery } = globalState.getState().state;
        setState((state) => ({ ...state, opened: true }));

        // Update search state to show ask mode with first message or current ask value
        setSearchState((prev) => ({
            ask: prev?.ask ?? initialQuery ?? '',
            query: prev?.query ?? null,
            global: prev?.global ?? false,
            open: false, // Close search popover when opening chat
        }));
    }, [setState, setSearchState]);

    // Close AI chat and clear ask parameter
    const onClose = React.useCallback(() => {
        setState((state) => ({ ...state, opened: false }));

        // Clear ask parameter but keep other search state
        setSearchState((prev) => ({
            ask: null,
            query: prev?.query ?? null,
            global: prev?.global ?? false,
            open: false,
        }));
    }, [setState, setSearchState]);

    // Post a message to the AI chat
    const onPostMessage = React.useCallback(
        async (input: { message: string }) => {
            const { query, messages } = globalState.getState().state;

            // For first message, update the ask parameter in URL
            if (messages.length === 0) {
                setSearchState((prev) => ({
                    ask: input.message,
                    query: prev?.query ?? null,
                    global: prev?.global ?? false,
                    open: false,
                }));
            }

            if (query === input.message) {
                // Return early if the message is the same as the previous message
                return;
            }

            trackEvent({ type: 'ask_question', query: input.message });

            // Add user message and placeholder for AI response
            setState((state) => {
                return {
                    ...state,
                    messages: [
                        ...state.messages,
                        {
                            role: AIMessageRole.User,
                            content: input.message,
                            query: input.message,
                        },
                        {
                            role: AIMessageRole.Assistant,
                            content: null, // Placeholder for streaming response
                        },
                    ],
                    query: input.message,
                    responseId: null,
                    followUpSuggestions: [],
                    loading: true,
                    error: false,
                };
            });

            try {
                const stream = await streamAIChatResponse({
                    message: input.message,
                    messageContext: messageContextRef.current,
                    previousResponseId: globalState.getState().state.responseId ?? undefined,
                });

                // Process streaming response
                for await (const data of stream) {
                    if (!data) continue;

                    if (globalState.getState().state.query !== input.message) break; // Chat was cleared, stop processing the stream

                    const event = data.event;

                    switch (event.type) {
                        case 'response_finish': {
                            setState((state) => ({
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
                            setState((state) => ({
                                ...state,
                                followUpSuggestions: [
                                    ...state.followUpSuggestions,
                                    ...event.suggestions,
                                ],
                            }));
                            break;
                        }
                    }

                    // Update the assistant message with streamed content
                    setState((state) => ({
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

                setState((state) => ({
                    ...state,
                    loading: false,
                    error: false,
                }));
            } catch {
                setState((state) => ({
                    ...state,
                    loading: false,
                    error: true,
                }));
            }
        },
        [messageContextRef.current, setState, setSearchState, trackEvent]
    );

    // Clear the conversation and reset ask parameter
    const onClear = React.useCallback(() => {
        setState((state) => ({
            opened: state.opened,
            loading: false,
            messages: [],
            query: null,
            followUpSuggestions: [],
            responseId: null,
            error: false,
            initialQuery: null,
        }));

        // Reset ask parameter to empty string (keeps chat open but clears content)
        setSearchState((prev) => ({
            ask: '',
            query: prev?.query ?? null,
            global: prev?.global ?? false,
            open: false,
        }));
    }, [setState, setSearchState]);

    // Auto-trigger AI chat when ?ask= parameter appears in URL (only once)
    React.useEffect(() => {
        const hasNoAsk = searchState?.ask === undefined || searchState?.ask === null;
        const hasQuery = searchState?.query !== null;

        // Don't trigger if we have a regular search query active
        if (hasNoAsk) return;
        if (hasQuery && searchState.open === false) return;

        // Open the chat when ask parameter appears
        onOpen();

        // Auto-post the message if ask has content
        if (searchState?.ask?.trim()) {
            const trimmedAsk = searchState.ask.trim();
            const { loading, initialQuery } = globalState.getState().state;

            // Don't trigger if we're already posting a message
            if (loading) return;

            // Only initialize once per URL ask value
            if (initialQuery === trimmedAsk) return;

            // Wait for messageContextRef to be defined before proceeding
            if (!messageContextRef.current?.location) return;

            // Mark this ask value as processed
            setState((state) => ({ ...state, initialQuery: trimmedAsk }));
            onPostMessage({ message: trimmedAsk });
        }
    }, [
        searchState?.ask,
        searchState?.query,
        searchState?.open,
        messageContextRef,
        onOpen,
        setState,
        onPostMessage,
    ]);

    return React.useMemo(() => {
        return {
            open: onOpen,
            close: onClose,
            clear: onClear,
            postMessage: onPostMessage,
        };
    }, [onOpen, onClose, onClear, onPostMessage]);
}
