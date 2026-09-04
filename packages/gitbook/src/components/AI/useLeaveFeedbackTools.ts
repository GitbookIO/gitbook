'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { AIToolDefinition, SiteInsightsDisplayContext } from '@gitbook/api';
import type { GitBookIntegrationTool } from '@gitbook/browser-types';

import { type PagePointer, useCurrentPage } from '../hooks';
import { type InsightsEventPageContext, useTrackEvent } from '../Insights';
import { submitAssistantFeedbackToTeam } from './server-actions';
import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import {
    AGENT_FEEDBACK_GOAL_MAX_LENGTH,
    AGENT_FEEDBACK_MAX_LENGTH,
    agentFeedbackDescriptions,
    formatAgentFeedbackPageRef,
} from '@/lib/agentFeedback';

const feedbackInput = z.string().min(1).max(AGENT_FEEDBACK_MAX_LENGTH);
const pageInput = z.string().optional().describe(agentFeedbackDescriptions.pageReference);

const LeaveAgentFeedbackInputSchema = z.object({
    feedback: feedbackInput.describe(agentFeedbackDescriptions.finding),
    goal: z
        .string()
        .max(AGENT_FEEDBACK_GOAL_MAX_LENGTH)
        .optional()
        .describe(agentFeedbackDescriptions.goal),
    page: pageInput,
});

const LeaveUserFeedbackInputSchema = z.object({
    feedback: feedbackInput.describe(
        "The user's feedback about the content, copied verbatim. Never rephrase, summarise, correct, translate or add to their words. Quote only what they said about the documentation, and leave out anything personal or confidential."
    ),
    page: pageInput,
});

type LeaveFeedbackToolOptions = {
    /** Whether the assistant runs in the embeddable, which resolves its own site context. */
    asEmbeddable?: boolean;
    /** Display context recorded with the feedback event (e.g. `site` vs. `embed`). */
    displayContext: SiteInsightsDisplayContext;
};

/** The assistant's own finding, so it submits without confirmation, capped at one per chat. */
export function useLeaveAgentFeedbackTool(
    options: LeaveFeedbackToolOptions & {
        /** Whether a finding was already reported in this conversation, reset when it is cleared. */
        reportedRef: React.RefObject<boolean>;
    }
): GitBookIntegrationTool {
    const { asEmbeddable, displayContext, reportedRef } = options;
    const language = useLanguage();
    const currentPage = useCurrentPage();
    const trackEvent = useTrackEvent();

    // The tool object is memoized once, so read the latest values from a ref at call time.
    const ref = React.useRef({
        language,
        currentPage,
        asEmbeddable,
        displayContext,
        trackEvent,
        reportedRef,
    });
    React.useEffect(() => {
        ref.current = {
            language,
            currentPage,
            asEmbeddable,
            displayContext,
            trackEvent,
            reportedRef,
        };
    });

    return React.useMemo<GitBookIntegrationTool>(
        () => ({
            name: 'leaveAgentFeedback',
            description:
                'Leave feedback as you, the GitBook Assistant, on ways this question could have been answered more easily through content changes or reorganization — a missing explanation, an outdated or contradictory passage, or an answer you had to piece together from several pages. Use it when answering was hard, or when you could not answer at all, so the team can close the gap. Write it for a documentation maintainer who never saw this conversation, and send at most one per conversation. This carries your own observation: use `leaveUserFeedback` to relay what the user said, and `submitPageFeedback` to record their rating of a page. Do not use it to confirm that a page is accurate.',
            inputSchema: zodToJsonSchema(
                LeaveAgentFeedbackInputSchema as any
            ) as AIToolDefinition['inputSchema'],
            execute: async (input) => {
                const { reportedRef, ...tracking } = ref.current;
                const { feedback, goal, page } = LeaveAgentFeedbackInputSchema.parse(input);

                if (reportedRef.current) {
                    throw new Error(
                        'A finding was already reported in this conversation. Do not report another one.'
                    );
                }

                await submitFeedback({ feedback, goal, page, ...tracking });
                reportedRef.current = true;

                return {
                    output: { submitted: true },
                    summary: {
                        icon: 'comment-check',
                        text: tString(tracking.language, 'ai_chat_tools_shared_feedback_with_team'),
                    },
                };
            },
        }),
        // Rebuild when the locale changes so the summary (read at memo time, not from the ref)
        // stays translated.
        [language]
    );
}

/** Speaks for the reader, so it confirms first, showing the exact text about to be sent. */
export function useLeaveUserFeedbackTool(
    options: LeaveFeedbackToolOptions
): GitBookIntegrationTool {
    const { asEmbeddable, displayContext } = options;
    const language = useLanguage();
    const currentPage = useCurrentPage();
    const trackEvent = useTrackEvent();

    // The tool object is memoized once, so read the latest values from a ref at call time.
    const ref = React.useRef({ language, currentPage, asEmbeddable, displayContext, trackEvent });
    React.useEffect(() => {
        ref.current = { language, currentPage, asEmbeddable, displayContext, trackEvent };
    });

    return React.useMemo<GitBookIntegrationTool>(
        () => ({
            name: 'leaveUserFeedback',
            description:
                "Leave feedback on behalf of the user about the documentation, so the team can act on it. Use it when the user reports that something in the content is wrong, missing, outdated or confusing, or asks you to pass a message to the documentation team. Do not modify their feedback in any way: copy their own words. The user will be asked to confirm before it is sent. This carries the user's words: use `leaveAgentFeedback` for your own findings about the content, and `submitPageFeedback` to record their rating of a page.",
            confirmation: (input) => {
                const parsed = LeaveUserFeedbackInputSchema.safeParse(input);
                const feedback = parsed.success ? parsed.data.feedback.trim() : undefined;
                return {
                    icon: 'paper-plane',
                    label: tString(language, 'ai_chat_tools_submit_feedback'),
                    context: feedback ? `"${feedback}"` : undefined,
                };
            },
            inputSchema: zodToJsonSchema(
                LeaveUserFeedbackInputSchema as any
            ) as AIToolDefinition['inputSchema'],
            execute: async (input) => {
                const tracking = ref.current;
                const { feedback, page } = LeaveUserFeedbackInputSchema.parse(input);

                await submitFeedback({ feedback, page, ...tracking });

                return {
                    output: { submitted: true },
                    summary: {
                        icon: 'comment-check',
                        text: tString(tracking.language, 'ai_chat_tools_submitted_feedback'),
                    },
                };
            },
        }),
        // Rebuild when the locale changes so the confirmation label (read at memo time, not from
        // the ref) stays translated.
        [language]
    );
}

async function submitFeedback(input: {
    feedback: string;
    goal?: string;
    page?: string;
    currentPage: PagePointer | null;
    asEmbeddable?: boolean;
    displayContext: SiteInsightsDisplayContext;
    trackEvent: ReturnType<typeof useTrackEvent>;
}): Promise<void> {
    const page =
        input.page?.trim() ||
        (input.currentPage ? formatAgentFeedbackPageRef(input.currentPage) : null);

    if (!page) {
        throw new Error('No documentation page is currently open to leave feedback about.');
    }

    const result = await submitAssistantFeedbackToTeam({
        feedback: input.feedback,
        goal: input.goal,
        page,
        asEmbeddable: input.asEmbeddable,
    });

    if (!result.submitted) {
        throw new Error(result.error);
    }

    // Attribute to the page the reader is on, since the insights location only lets us override
    // the page — its space and revision come from the ambient context.
    const pageContext: InsightsEventPageContext = {
        pageId: input.currentPage?.pageId ?? null,
        displayContext: input.displayContext,
    };
    input.trackEvent({ type: 'agent_feedback' }, pageContext, { immediate: true });
}
