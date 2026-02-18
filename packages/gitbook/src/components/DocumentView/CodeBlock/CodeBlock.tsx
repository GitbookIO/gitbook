import * as React from 'react';

import type {
    CustomizationThemedCodeTheme,
    DocumentBlockCode,
    SiteCustomizationSettings,
} from '@gitbook/api';

import { getNodeFragmentByType } from '@/lib/document';

import type { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { ClientCodeBlock } from './ClientCodeBlock';
import { CodeBlockRenderer } from './CodeBlockRenderer';
import { MermaidCodeBlock } from './MermaidCodeBlock';
import { type RenderedInline, getInlines, highlight } from './highlight';

/**
 * Render a code block, can be client-side or server-side.
 */
export async function CodeBlock(
    props: BlockProps<DocumentBlockCode> & {
        themeKey?: keyof SiteCustomizationSettings['styling']['codeTheme'];
        themes?: CustomizationThemedCodeTheme;
    }
) {
    const {
        block,
        document,
        style,
        isEstimatedOffscreen,
        context,
        themeKey = 'default',
        themes: providedThemes,
    } = props;
    const inlines = getInlines(block);
    const isMermaid = block.data.syntax?.toLowerCase() === 'mermaid';

    let hasInlineExpression = false;

    const richInlines: RenderedInline[] = inlines
        // Exclude inline expressions from rendered inline as they are rendered as code text once evaluated
        // and so need to be treated as plain code tokens.
        .filter((inline) => {
            if (inline.inline.type === 'expression') {
                hasInlineExpression = true;
                return false;
            }
            return true;
        })
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

    if (!isMermaid && !isEstimatedOffscreen && !hasInlineExpression && !block.data.expandable) {
        // In v2, we render the code block server-side
        const theme = await highlight(block, richInlines, {
            themes: themes,
        });
        return <CodeBlockRenderer block={block} style={style} theme={theme} />;
    }

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
    };

    return (
        <React.Suspense fallback={null}>
            {isMermaid ? (
                <MermaidCodeBlock {...clientProps} />
            ) : (
                <ClientCodeBlock {...clientProps} />
            )}
        </React.Suspense>
    );
}
