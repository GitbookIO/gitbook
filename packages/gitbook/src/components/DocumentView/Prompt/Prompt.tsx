import { tcls } from '@/lib/tailwind';
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
        <div
            className={tcls(
                'relative flex w-full flex-col overflow-hidden',
                'border border-tint-subtle bg-tint-subtle theme-bold-tint:bg-tint-base theme-muted:bg-tint-base text-tint-strong contrast-more:border-tint contrast-more:bg-tint-base',
                'circular-corners:rounded-2xl rounded-corners:rounded-xl straight-corners:rounded-xs',
                'depth-subtle:shadow-xs'
            )}
        >
            <PromptClient
                contentIcon={contentIcon}
                description={block.data.description}
                prompt={getPromptText(block)}
                openInAIProviders={getOpenInAIProviders(props)}
            />
        </div>
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
    // Use the configured `items` list when the API provides it, and fall back to the deprecated
    // `externalAI` flag otherwise (legacy mode).
    return pageActions.items
        ? pageActions.items.includes(CustomizationPageActionType.ExternalAi)
        : pageActions.externalAI;
}

function getPromptText(block: DocumentBlockPrompt): string {
    return (block.nodes ?? []).map((node) => getPlainCodeBlock(node)).join('\n');
}
