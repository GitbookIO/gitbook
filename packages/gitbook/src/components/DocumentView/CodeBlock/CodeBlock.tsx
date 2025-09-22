import * as React from 'react';

import type { DocumentBlockCode } from '@gitbook/api';

import { getNodeFragmentByType } from '@/lib/document';

import type { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { ClientCodeBlock } from './ClientCodeBlock';
import { CodeBlockRenderer } from './CodeBlockRenderer';
import { type RenderedInline, getInlines, highlight } from './highlight';

/**
 * Render a code block, can be client-side or server-side.
 */
export async function CodeBlock(props: BlockProps<DocumentBlockCode>) {
    const { block, document, style, isEstimatedOffscreen, context } = props;
    const inlines = getInlines(block);

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

    if (!isEstimatedOffscreen && !hasInlineExpression) {
        // In v2, we render the code block server-side
        const lines = await highlight(block, richInlines);
        return <CodeBlockRenderer block={block} style={style} lines={lines} />;
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

    return (
        <React.Suspense fallback={null}>
            <ClientCodeBlock
                block={block}
                style={style}
                inlines={richInlines}
                inlineExprVariables={variables}
            />
        </React.Suspense>
    );
}
