'use client';

import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import type { AIToolDefinition, SiteInsightsDisplayContext } from '@gitbook/api';
import type { GitBookIntegrationTool } from '@gitbook/browser-types';
import * as React from 'react';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { type InsightsEventPageContext, useTrackEvent } from '../Insights';
import { type PagePointer, useCurrentPage } from '../hooks';

/** The assistant response the user is reacting to, which the tool rates. */
export type ResponseToRate = {
    responseId: string | null;
    query: string | null;
};

const SubmitAssistantFeedbackInputSchema = z.object({
    rating: z.enum(['good', 'bad']).describe(
        `How the user rated your previous response:
- 'good' when they express it helped or that they are satisfied.
- 'bad' when they indicate it was wrong, unhelpful, incomplete, or otherwise problematic.`
    ),
});

/**
 * Build the built-in `submitAssistantFeedback` tool exposed to the assistant.
 *
 * The tool records the user's rating of the assistant's own previous response, reusing the same
 * `ask_rate_response` insights signal as the thumbs up/down control shown under each answer. It
 * rates the response the user is reacting to — read from a snapshot taken before the current
 * (reaction) turn started, since by tool-execution time the store already holds this turn's
 * response and query. Because it acts on the user's behalf, it asks for confirmation first.
 */
export function useSubmitAssistantFeedbackTool(options: {
    /** Display context recorded with the rating event (e.g. `site` vs. `embed`). */
    displayContext: SiteInsightsDisplayContext;
    /** Read the previous response to rate, resolved at tool-execution time. */
    getResponseToRate: () => ResponseToRate;
}): GitBookIntegrationTool {
    const { displayContext, getResponseToRate } = options;
    const trackEvent = useTrackEvent();
    const language = useLanguage();
    const currentPage = useCurrentPage();

    // The tool object is memoized once, so read the latest values from a ref at call time.
    const ref = React.useRef<{
        trackEvent: typeof trackEvent;
        language: typeof language;
        currentPage: PagePointer | null;
        displayContext: SiteInsightsDisplayContext;
        getResponseToRate: () => ResponseToRate;
    }>({ trackEvent, language, currentPage, displayContext, getResponseToRate });
    React.useEffect(() => {
        ref.current = { trackEvent, language, currentPage, displayContext, getResponseToRate };
    });

    return React.useMemo<GitBookIntegrationTool>(
        () => ({
            name: 'submitAssistantFeedback',
            description:
                "Record the user's rating of your own previous response, reusing the same signal as the thumbs up/down control shown under each answer. Use this when the user reacts to how you answered — telling you it was wrong, unhelpful, or incomplete (rate 'bad'), or that it helped (rate 'good'). This is about your response, not the page's content — use submitPageFeedback for feedback about the documentation page itself. Only use it when the user clearly expresses such a sentiment, not for every follow-up or minor correction. The user will be asked to confirm before the rating is recorded.",
            confirmation: (input) => {
                const parsed = SubmitAssistantFeedbackInputSchema.safeParse(input);
                const rating = parsed.success ? parsed.data.rating : undefined;
                return {
                    icon: rating === 'good' ? 'thumbs-up' : 'thumbs-down',
                    label: tString(language, 'ai_chat_tools_submit_feedback'),
                    context: tString(
                        language,
                        'ai_chat_tools_submit_assistant_feedback',
                        (rating === 'good'
                            ? tString(language, 'was_this_helpful_positive_label')
                            : tString(language, 'was_this_helpful_negative_label')
                        ).toLocaleLowerCase()
                    ),
                };
            },
            inputSchema: zodToJsonSchema(
                SubmitAssistantFeedbackInputSchema as any
            ) as AIToolDefinition['inputSchema'],
            execute: async (input) => {
                const { trackEvent, language, currentPage, displayContext, getResponseToRate } =
                    ref.current;
                const { rating } = SubmitAssistantFeedbackInputSchema.parse(input);

                const { responseId, query } = getResponseToRate();
                if (!responseId || !query) {
                    throw new Error('There is no previous response to rate.');
                }

                // Attribute to the current page with an explicit context so the event still flushes
                // on pathnames whose ambient insights context has no page (e.g. the embed's
                // assistant tab), matching the submit-page-feedback tool.
                const pageContext: InsightsEventPageContext = {
                    pageId: currentPage?.pageId ?? null,
                    displayContext,
                };

                trackEvent(
                    {
                        type: 'ask_rate_response',
                        query,
                        responseId,
                        rating: rating === 'good' ? 1 : -1,
                    },
                    pageContext,
                    { immediate: true }
                );

                return {
                    output: { submitted: true, rating, responseId },
                    summary: {
                        icon: rating === 'good' ? 'thumbs-up' : 'thumbs-down',
                        text: tString(language, 'ai_chat_tools_submitted_feedback'),
                    },
                };
            },
        }),
        // Rebuild when the locale changes so the confirmation label (read at memo time, not from
        // the ref) stays translated.
        [language]
    );
}
