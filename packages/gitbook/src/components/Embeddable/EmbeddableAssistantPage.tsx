import { EmbeddableAIChat } from './EmbeddableAIChat';

type EmbeddableAssistantPageProps = {
    baseURL: string;
    siteTitle: string;
};

/**
 * Reusable page component for the embed assistant page.
 */
export async function EmbeddableAssistantPage(props: EmbeddableAssistantPageProps) {
    return <EmbeddableAIChat baseURL={props.baseURL} siteTitle={props.siteTitle} />;
}
