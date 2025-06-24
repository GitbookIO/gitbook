'use client';

import * as zustand from 'zustand';

import { AIMessageRole } from '@gitbook/api';
import type * as React from 'react';
import { streamAIChatFollowUpResponses, streamAIChatResponse } from './server-actions';

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
    controller: AIChatController;
}>((set, get) => {
    /**
     * Refresh the follow-up suggestions.
     */
    const fetchFollowUpSuggestions = async (previousResponseId: string) => {
        const stream = await streamAIChatFollowUpResponses({
            previousResponseId,
        });

        for await (const suggestions of stream) {
            set((state) => ({ state: { ...state.state, followUpSuggestions: suggestions } }));
        }
    };

    return {
        state: {
            opened: false,
            responseId: null,
            messages: [],
            followUpSuggestions: [],
            loading: false,
        },
        controller: {
            open: () => set((state) => ({ state: { ...state.state, opened: true } })),
            close: () => set((state) => ({ state: { ...state.state, opened: false } })),
            clear: () =>
                set(() => ({
                    state: {
                        opened: false,
                        loading: false,
                        messages: [],
                        followUpSuggestions: [],
                        responseId: null,
                    },
                })),
            postMessage: async (input: { message: string }) => {
                set((previous) => {
                    return {
                        ...previous,
                        state: {
                            ...previous.state,
                            messages: [
                                ...previous.state.messages,
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
                        },
                    };
                });

                const stream = await streamAIChatResponse({
                    message: input.message,
                    previousResponseId: get().state.responseId ?? undefined,
                });

                for await (const data of stream) {
                    if (!data) continue;

                    const event = data.event;
                    if (event.type === 'response_finish') {
                        set((state) => ({
                            state: { ...state.state, responseId: event.responseId },
                        }));

                        fetchFollowUpSuggestions(event.responseId);
                    }

                    set((previous) => ({
                        ...previous,
                        state: {
                            ...previous.state,
                            messages: [
                                ...previous.state.messages.slice(0, -1),
                                {
                                    role: AIMessageRole.Assistant,
                                    content: data.content,
                                },
                            ],
                        },
                    }));
                }

                set((previous) => ({
                    ...previous,
                    state: {
                        ...previous.state,
                        loading: false,
                    },
                }));
            },
        },
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
    const controller = zustand.useStore(globalState, (state) => state.controller);
    return controller;
}
