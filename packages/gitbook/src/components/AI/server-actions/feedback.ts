'use server';

import { AgentFeedbackSource } from '@gitbook/api';

import type { AgentFeedbackResult } from '@/lib/agentFeedback';
import { submitAgentFeedback } from '@/lib/agentFeedback/server';
import { fetchServerActionSiteContext, getServerActionBaseContext } from '@/lib/server-actions';
import { traceErrorOnly } from '@/lib/tracing';

/**
 * Record a finding about the site's content, submitted by the assistant while helping a reader.
 */
export async function submitAssistantFeedbackToTeam(input: {
    feedback: string;
    goal?: string;
    /** Page the finding is about, as a URL on the site or a `/spaces/…/pages/…` ref. */
    page: string;
    asEmbeddable?: boolean;
}): Promise<AgentFeedbackResult> {
    return traceErrorOnly('AI.submitAssistantFeedbackToTeam', async () => {
        const baseContext = await getServerActionBaseContext({
            isEmbeddable: input.asEmbeddable,
        });
        const context = await fetchServerActionSiteContext(baseContext);

        return submitAgentFeedback(context, {
            feedback: input.feedback,
            goal: input.goal,
            page: input.page,
            source: AgentFeedbackSource.Assistant,
        });
    });
}
