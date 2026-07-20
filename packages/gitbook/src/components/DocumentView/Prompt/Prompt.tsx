import {
    CustomizationPageActionType,
    type DocumentBlockPrompt,
    type SiteCustomizationSettings,
} from '@gitbook/api';
import { validateIconName } from '@gitbook/icons/icons';
import type { BlockProps } from '../Block';
import { getPlainCodeBlock } from '../CodeBlock/highlight';
import { PromptClient } from './PromptClient';

export function Prompt(props: BlockProps<DocumentBlockPrompt>) {
    const { block } = props;
    const contentIcon =
        block.data.icon && validateIconName(block.data.icon) ? block.data.icon : null;

    return (
        <PromptClient
            contentIcon={contentIcon}
            description={block.data.description}
            prompt={getPromptText(block)}
            openInAIProviders={getOpenInAIProviders(props)}
        />
    );
}

function getOpenInAIProviders(props: BlockProps<DocumentBlockPrompt>): boolean {
    const { block, context } = props;
    const { openInAIProviders } = block.data;

    if (openInAIProviders !== undefined) {
        return openInAIProviders;
    }

    const contentContext = context.contentContext;
    if (contentContext && 'customization' in contentContext) {
        const { pageActions } = contentContext.customization;
        return isExternalAIPageActionEnabled(pageActions);
    }

    return false;
}

function isExternalAIPageActionEnabled(
    pageActions: SiteCustomizationSettings['pageActions']
): boolean {
    return pageActions.items.includes(CustomizationPageActionType.ExternalAi);
}

function getPromptText(block: DocumentBlockPrompt): string {
    return (block.nodes ?? []).map((node) => getPlainCodeBlock(node)).join('\n');
}
