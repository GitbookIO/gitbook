import type { GitBookSiteContext } from '@/lib/context';
import { EmbeddableAIChat } from './EmbeddableAIChat';

/**
 * Reusable page component for the embed assistant page.
 */
export async function EmbeddableAssistantPage(props: {
    context: GitBookSiteContext;
}) {
    const { context } = props;

    return <EmbeddableAIChat trademark={context.customization.trademark.enabled} />;
}
