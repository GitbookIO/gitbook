'use client';

import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import { type AIToolDefinition, PageFeedbackRating } from '@gitbook/api';
import type { GitBookIntegrationTool } from '@gitbook/browser-types';
import * as React from 'react';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { useTrackEvent } from '../Insights';
import { type PagePointer, useCurrentPage } from '../hooks';

const SubmitPageFeedbackInputSchema = z.object({
    rating: z
        .enum(['good', 'ok', 'bad'])
        .describe(
            "The user's overall sentiment about the current page: 'good' if it was helpful, 'ok' if it was fine but could be improved, 'bad' if it was unhelpful. Infer it from the conversation; if it is unclear, ask the user before submitting."
        ),
    comment: z
        .string()
        .optional()
        .describe(
            "The user's feedback about the page, in their own words (e.g. what was confusing or missing). Optional — omit it when the user only expressed a rating."
        ),
});

const ratingByInput: Record<
    z.infer<typeof SubmitPageFeedbackInputSchema>['rating'],
    PageFeedbackRating
> = {
    good: PageFeedbackRating.Good,
    ok: PageFeedbackRating.Ok,
    bad: PageFeedbackRating.Bad,
};

/**
 * Build the built-in `submitPageFeedback` tool exposed to the assistant.
 *
 * The tool records the user's feedback about the page they are currently viewing, reusing the same
 * insights pipeline as the "Was this helpful?" widget (a `page_post_feedback` event, plus a
 * `page_post_feedback_comment` event when the user left a comment). Because it acts on the user's
 * behalf, it asks for confirmation before submitting.
 */
export function useSubmitPageFeedbackTool(): GitBookIntegrationTool {
    const trackEvent = useTrackEvent();
    const language = useLanguage();
    const currentPage = useCurrentPage();

    // The tool object is memoized once, so read the latest values from a ref at call time.
    const ref = React.useRef<{
        trackEvent: typeof trackEvent;
        language: typeof language;
        currentPage: PagePointer | null;
    }>({ trackEvent, language, currentPage });
    React.useEffect(() => {
        ref.current = { trackEvent, language, currentPage };
    });

    return React.useMemo<GitBookIntegrationTool>(
        () => ({
            name: 'submitPageFeedback',
            description:
                "Submit the feedback on behalf of the user about the documentation page they are currently viewing. You can use this when the user is indicating a sentiment about the page, particularly a negative one. You can proactively suggest to submit feedback for the user to help alleviate frustration or indicate a content gap they've encountered. The user will be asked to confirm before the feedback is recorded. Provide a rating and, when the user gave one, a comment in their own words.",
            confirmation: {
                icon: 'paper-plane',
                label: tString(language, 'ai_chat_tools_submit_feedback'),
            },
            inputSchema: zodToJsonSchema(
                SubmitPageFeedbackInputSchema as any
            ) as AIToolDefinition['inputSchema'],
            execute: async (input) => {
                const { trackEvent, language, currentPage } = ref.current;
                const { rating, comment } = SubmitPageFeedbackInputSchema.parse(input);

                if (!currentPage) {
                    throw new Error(
                        'No documentation page is currently open to submit feedback for.'
                    );
                }

                const pageFeedbackRating = ratingByInput[rating];
                const trimmedComment = comment?.trim() || undefined;

                trackEvent(
                    { type: 'page_post_feedback', feedback: { rating: pageFeedbackRating } },
                    undefined,
                    { immediate: !trimmedComment }
                );

                if (trimmedComment) {
                    trackEvent(
                        {
                            type: 'page_post_feedback_comment',
                            feedback: { rating: pageFeedbackRating, comment: trimmedComment },
                        },
                        undefined,
                        { immediate: true }
                    );
                }

                return {
                    output: {
                        submitted: true,
                        rating,
                        comment: trimmedComment ?? null,
                        pageId: currentPage.pageId,
                    },
                    summary: {
                        icon: 'comment-check',
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
