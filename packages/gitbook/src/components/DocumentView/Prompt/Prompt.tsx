import {
    CustomizationPageActionType,
    type DocumentBlockCode,
    type DocumentBlockPrompt,
    type SiteCustomizationSettings,
} from '@gitbook/api';
import { validateIconName } from '@gitbook/icons/icons';
import type { BlockProps } from '../Block';
import { CodeBlock } from '../CodeBlock';
import { getPlainCodeBlock } from '../CodeBlock/highlight';
import { PromptClient } from './PromptClient';

const PROMPT_COLLAPSED_LINE_COUNT = 10;

export function Prompt(props: BlockProps<DocumentBlockPrompt>) {
    const { block, document, ancestorBlocks, context, isEstimatedOffscreen } = props;
    const contentIcon =
        block.data.icon && validateIconName(block.data.icon) ? block.data.icon : null;
    const prompt = getPromptText(block);
    const defaultExpanded = block.data.defaultExpanded ?? 'hidden';

    const promptContent = block.nodes.map((node, index) => (
        <CodeBlock
            key={node.key ?? index}
            block={getPromptCodeBlock(node, { defaultExpanded })}
            document={document}
            ancestorBlocks={[...ancestorBlocks, block]}
            context={context}
            isEstimatedOffscreen={isEstimatedOffscreen}
            embedded
        />
    ));

    return (
        <PromptClient
            {...block.data}
            contentIcon={contentIcon}
            defaultExpanded={defaultExpanded}
            openInAIProviders={getOpenInAIProviders(props)}
            prompt={prompt}
        >
            {promptContent}
        </PromptClient>
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

function getPromptCodeBlock(
    block: DocumentBlockCode,
    options: { defaultExpanded: 'hidden' | 'partial' | 'full' }
): DocumentBlockCode {
    const isPartiallyExpanded = options.defaultExpanded === 'partial';

    return {
        ...block,
        data: {
            ...block.data,
            syntax: block.data.syntax ?? 'markdown',
            expandable: isPartiallyExpanded,
            collapsedLineCount: isPartiallyExpanded ? PROMPT_COLLAPSED_LINE_COUNT : undefined,
            lineNumbers: false,
            overflow: 'wrap',
        },
    };
}
