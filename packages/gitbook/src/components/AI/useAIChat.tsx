'use client';

import * as zustand from 'zustand';

import { AIMessageRole, AIMessageStepPhase, type AIStreamResponse } from '@gitbook/api';
import * as React from 'react';
import type { AnyAIControl } from './controls';
import type { AIChatReference } from './references';

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

export type AIChatController = {
    /** Open the dialog */
    open: () => void;
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

export const AIChatControllerContext = React.createContext<AIChatController | null>(null);

// Global state store for AI chat
export const globalAIChatState = zustand.create<AIChatState>(() => {
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
    const state = zustand.useStore(globalAIChatState);
    return state;
}

/**
 * Inert controller returned when no AIChatProvider is mounted (AI chat disabled for the site).
 * Lets always-mounted consumers (search, page actions, …) call the hook unconditionally without
 * pulling the chat runtime into their bundle or throwing at render time.
 */
const NOOP_AI_CHAT_CONTROLLER: AIChatController = {
    open: () => {},
    close: () => {},
    postMessage: () => {},
    clear: () => {},
    addReference: (ref) => ref.id,
    removeReference: () => {},
    clearReferences: () => {},
    focus: () => {},
    setDraft: () => {},
    cancelQueuedMessage: () => {},
    on: () => () => {},
};

/**
 * Get the controller to interact with the AI chat.
 * Integrates with search state to synchronize ?ask= parameter.
 */
export function useAIChatController(): AIChatController {
    const controller = React.useContext(AIChatControllerContext);
    return controller ?? NOOP_AI_CHAT_CONTROLLER;
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

export function updateAIChatMessageActivity(
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

export function getDefaultAIChatMessageActivity(): AIChatMessageActivity {
    return {
        currentPhase: undefined,
        toolCount: 0,
        hasCommentary: false,
        hasFinalAnswer: false,
    };
}
