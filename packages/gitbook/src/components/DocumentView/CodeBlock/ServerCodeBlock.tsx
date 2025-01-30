import { DocumentBlockCode } from '@gitbook/api';

import { highlight, RenderedInline } from './highlight';
import type { BlockProps } from '../Block';
import './theme.css';
import { ClientCodeBlockRenderer } from './CodeBlockRenderer';

type ClientBlockProps = Pick<BlockProps<DocumentBlockCode>, 'block' | 'style'> & {
    inlines: RenderedInline[];
};

/**
 * Render a code-block server-side.
 */
export async function ServerCodeBlock(props: ClientBlockProps) {
    const { block, style, inlines } = props;
    const lines = await highlight(block, inlines);
    return <ClientCodeBlockRenderer block={block} style={style} lines={lines} />;
}
