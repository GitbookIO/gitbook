import { DocumentBlockCode } from '@gitbook/api';

import { highlight, RenderedInline } from './highlight';
import type { BlockProps } from '../Block';
import './theme.css';
import { ClientCodeBlockRenderer } from './CodeBlockRenderer';

type ClientBlockProps = Pick<BlockProps<DocumentBlockCode>, 'block' | 'document' | 'style'> & {
    inlines: RenderedInline[];
};

/**
 * Render a code-block server-side.
 */
export async function ServerCodeBlock(props: ClientBlockProps) {
    const { block, document, style, inlines } = props;
    const lines = await highlight(block, inlines);
    return (
        <ClientCodeBlockRenderer block={block} document={document} style={style} lines={lines} />
    );
}
