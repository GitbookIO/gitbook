import { EmbeddableAIChat } from './EmbeddableAIChat';
import { EmbeddableNavigateEvent } from './EmbeddableIframeAPI';

type EmbeddableAssistantPageProps = {
    baseURL: string;
    siteTitle: string;
};

/**
 * Reusable page component for the embed assistant page.
 */
export async function EmbeddableAssistantPage(props: EmbeddableAssistantPageProps) {
    return (
        <>
            <EmbeddableNavigateEvent tab="assistant" />
            <EmbeddableAIChat baseURL={props.baseURL} siteTitle={props.siteTitle} />
        </>
    );
}
