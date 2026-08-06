import * as React from 'react';

import type {
    CustomizationThemedCodeTheme,
    DocumentBlockCode,
    SiteCustomizationSettings,
} from '@gitbook/api';

import { getAssetURL } from '@/lib/assets';
import { getNodeFragmentByType } from '@/lib/document';

import type { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { ClientCodeBlock } from './ClientCodeBlock';
import { MermaidCodeBlockLazy } from './MermaidCodeBlockLazy';
import { type RenderedInline, getInlines } from './highlight-tokens';
import { MERMAID_RUNTIME_PATH } from './mermaid-runtime-path';
import { SHIKI_RUNTIME_PATH } from './shiki-runtime-path';

/**
 * Render a code block. Syntax highlighting happens after client-side hydration.
 */
export async function CodeBlock(
    props: BlockProps<DocumentBlockCode> & {
        themeKey?: keyof SiteCustomizationSettings['styling']['codeTheme'];
        themes?: CustomizationThemedCodeTheme;
        embedded?: boolean;
    }
) {
    const {
        block,
        document,
        style,
        context,
        themeKey = 'default',
        themes: providedThemes,
        embedded,
    } = props;
    const inlines = getInlines(block);
    const isMermaid = block.data.syntax?.toLowerCase() === 'mermaid';

    const richInlines: RenderedInline[] = inlines
        // Exclude inline expressions from rendered inline as they are rendered as code text once evaluated
        // and so need to be treated as plain code tokens.
        .filter((inline) => inline.inline.type !== 'expression')
        .map((inline, index) => {
            const body = (() => {
                const fragment = getNodeFragmentByType(inline.inline, 'annotation-body');
                if (!fragment) {
                    return null;
                }
                return (
                    <Blocks
                        key={index}
                        document={document}
                        ancestorBlocks={[]}
                        context={context}
                        nodes={fragment.nodes}
                        style="space-y-4"
                    />
                );
            })();

            return { inline, body };
        });

    // Get code themes from customization
    const themes =
        providedThemes ??
        (context.contentContext && 'customization' in context.contentContext
            ? context.contentContext.customization.styling.codeTheme[themeKey]
            : undefined);

    const variables = context.contentContext
        ? {
              space: context.contentContext?.revision.variables,
              page:
                  'page' in context.contentContext
                      ? context.contentContext.page.variables
                      : undefined,
          }
        : {};

    const clientProps = {
        block,
        style,
        inlines: richInlines,
        inlineExprVariables: variables,
        mode: context.mode,
        themes,
        shikiRuntimeURL: getAssetURL(SHIKI_RUNTIME_PATH),
        embedded,
    };

    return (
        <React.Suspense fallback={null}>
            {isMermaid ? (
                <MermaidCodeBlockLazy
                    {...clientProps}
                    mermaidRuntimeURL={getAssetURL(MERMAID_RUNTIME_PATH)}
                />
            ) : (
                <ClientCodeBlock {...clientProps} />
            )}
        </React.Suspense>
    );
}
