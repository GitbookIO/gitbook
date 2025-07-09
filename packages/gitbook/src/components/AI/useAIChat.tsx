'use client';

import * as zustand from 'zustand';

import { AIMessageRole } from '@gitbook/api';
import * as React from 'react';
import { useTrackEvent } from '../Insights';
import { streamAIChatResponse } from './server-actions';
import { useAIMessageContextRef } from './useAIMessageContext';

export type AIChatMessage = {
    role: AIMessageRole;
    content: React.ReactNode;
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
    postMessage: (input: {
        /** The message to post to the session. it can be markdown formatted. */
        message: string;
    }) => void;

    /** Clear the conversation */
    clear: () => void;
};

const globalState = zustand.create<{
    state: AIChatState;
    setState: (fn: (state: AIChatState) => Partial<AIChatState>) => void;
}>((set) => {
    return {
        state: {
            opened: false,
            responseId: null,
            messages: [],
            followUpSuggestions: [],
            loading: false,
            error: false,
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
 */
export function useAIChatController(): AIChatController {
    const messageContextRef = useAIMessageContextRef();
    const setState = zustand.useStore(globalState, (state) => state.setState);
    const trackEvent = useTrackEvent();

    return React.useMemo(() => {
        return {
            open: () => setState((state) => ({ ...state, opened: true })),
            close: () => setState((state) => ({ ...state, opened: false })),
            clear: () =>
                setState((state) => ({
                    opened: state.opened,
                    loading: false,
                    messages: [],
                    followUpSuggestions: [],
                    responseId: null,
                    error: false,
                })),
            postMessage: async (input: { message: string }) => {
                trackEvent({ type: 'ask_question', query: input.message });
                setState((state) => {
                    return {
                        ...state,
                        messages: [
                            ...state.messages,
                            {
                                // TODO: how to handle markdown here?
                                // to avoid rendering as plain text
                                role: AIMessageRole.User,
                                content: input.message,
                            },
                            {
                                role: AIMessageRole.Assistant,
                                content: null,
                            },
                        ],
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

                    for await (const data of stream) {
                        if (!data) continue;

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
        };
    }, [messageContextRef, setState, trackEvent]);
}
