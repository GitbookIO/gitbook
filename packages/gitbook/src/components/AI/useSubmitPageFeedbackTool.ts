'use client';

import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import {
    type AIToolDefinition,
    PageFeedbackRating,
    type SiteInsightsDisplayContext,
} from '@gitbook/api';
import type { GitBookIntegrationTool } from '@gitbook/browser-types';
import * as React from 'react';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { type InsightsEventPageContext, useTrackEvent } from '../Insights';
import { type PagePointer, useCurrentPage } from '../hooks';

// Matches the comment cap the "Was this helpful?" widget enforces (PageFeedbackForm).
const MAX_COMMENT_LENGTH = 512;

const SubmitPageFeedbackInputSchema = z.object({
    rating: z.enum(['good', 'ok', 'bad']).describe(
        `The user's overall sentiment about the current page: 
- 'good' if it was helpful. Only use it when the user actively expresses positive sentiment.
- 'ok' if it was fine but could be improved. Default to 'ok' for neutral feedback (typos, incoherent or missing content, etc).
- 'bad' if it was unhelpful. Only use it when the user actively expresses negative sentiment.
Infer it from the conversation; if it is unclear, ask the user before submitting.`
    ),
    comment: z
        .string()
        .max(MAX_COMMENT_LENGTH)
        .optional()
        .describe(
            `The user's feedback about the page, in their own words (e.g. what was confusing or missing). Optional — omit it when the user only expressed a rating.`
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

const ratingEmoji: Record<z.infer<typeof SubmitPageFeedbackInputSchema>['rating'], string> = {
    good: '🙁',
    ok: '😐',
    bad: '🙂',
};

/**
 * Build the built-in `submitPageFeedback` tool exposed to the assistant.
 *
 * The tool records the user's feedback about the page they are currently viewing, reusing the same
 * insights pipeline as the "Was this helpful?" widget (a `page_post_feedback` event, plus a
 * `page_post_feedback_comment` event when the user left a comment). Because it acts on the user's
 * behalf, it asks for confirmation before submitting.
 *
 * The events are tracked with an explicit page context so they attribute to the current page even
 * on pathnames whose ambient insights context has no page (e.g. the embed's assistant tab).
 */
export function useSubmitPageFeedbackTool(options: {
    /** Display context recorded with the feedback events (e.g. `site` vs. `embed`). */
    displayContext: SiteInsightsDisplayContext;
}): GitBookIntegrationTool {
    const { displayContext } = options;
    const trackEvent = useTrackEvent();
    const language = useLanguage();
    const currentPage = useCurrentPage();

    // The tool object is memoized once, so read the latest values from a ref at call time.
    const ref = React.useRef<{
        trackEvent: typeof trackEvent;
        language: typeof language;
        currentPage: PagePointer | null;
        displayContext: SiteInsightsDisplayContext;
    }>({ trackEvent, language, currentPage, displayContext });
    React.useEffect(() => {
        ref.current = { trackEvent, language, currentPage, displayContext };
    });

    return React.useMemo<GitBookIntegrationTool>(
        () => ({
            name: 'submitPageFeedback',
            description:
                "Submit the feedback on behalf of the user about the documentation page they are currently viewing. Use this when the user is indicating a sentiment about the page, particularly a negative one, or pointing to incorrect or incoherent information on a page. Proactively suggest to submit feedback for the user to help alleviate frustration or indicate a content gap they've encountered. The user will be asked to confirm before the feedback is recorded. Provide a rating and, when the user gave one, a comment in their own words.",
            confirmation: (input) => {
                const parsed = SubmitPageFeedbackInputSchema.safeParse(input);
                const rating = parsed.success ? parsed.data.rating : undefined;
                const comment = parsed.success ? parsed.data.comment?.trim() : undefined;
                return {
                    icon: 'paper-plane',
                    label: tString(language, 'ai_chat_tools_submit_feedback', ''),
                    context: `${tString(language, 'ai_chat_tools_submit_feedback')}?${rating && comment ? `\n\n"${ratingEmoji[rating] ? ratingEmoji[rating] : ''}${comment ? ` ${comment}` : ''}"` : ''}`,
                };
            },
            inputSchema: zodToJsonSchema(
                SubmitPageFeedbackInputSchema as any
            ) as AIToolDefinition['inputSchema'],
            execute: async (input) => {
                const { trackEvent, language, currentPage, displayContext } = ref.current;
                const { rating, comment } = SubmitPageFeedbackInputSchema.parse(input);

                if (!currentPage) {
                    throw new Error(
                        'No documentation page is currently open to submit feedback for.'
                    );
                }

                const pageFeedbackRating = ratingByInput[rating];
                const pageFeedbackEmoji = ratingEmoji[rating];
                const trimmedComment = comment?.trim() || undefined;

                const pageContext: InsightsEventPageContext = {
                    pageId: currentPage.pageId,
                    displayContext,
                };

                trackEvent(
                    { type: 'page_post_feedback', feedback: { rating: pageFeedbackRating } },
                    pageContext,
                    { immediate: !trimmedComment }
                );

                if (trimmedComment) {
                    trackEvent(
                        {
                            type: 'page_post_feedback_comment',
                            feedback: { rating: pageFeedbackRating, comment: trimmedComment },
                        },
                        pageContext,
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
                        text: `${tString(language, 'ai_chat_tools_submitted_feedback')}${pageFeedbackEmoji ? `: ${pageFeedbackEmoji}` : undefined}${trimmedComment ? ` ${trimmedComment}` : ''}`,
                    },
                };
            },
        }),
        // Rebuild when the locale changes so the confirmation label (read at memo time, not from
        // the ref) stays translated.
        [language]
    );
}
