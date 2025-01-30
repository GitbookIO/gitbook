'use client';

import { DocumentBlockCode } from '@gitbook/api';
import { useEffect, useState } from 'react';

import type { HighlightLine, RichInlineIndexed } from './highlight';
import type { BlockProps } from '../Block';
import './theme.css';
import { ClientCodeBlockRenderer } from './CodeBlockRenderer';
import { plainHighlight } from './plain-highlight';

type ClientBlockProps = Pick<BlockProps<DocumentBlockCode>, 'block' | 'document' | 'style'> & {
    inlines: RichInlineIndexed[];
};

/**
 * Render a code-block client-side.
 */
export function ClientCodeBlock(props: ClientBlockProps) {
    const { block, document, style, inlines } = props;
    const [lines, setLines] = useState<HighlightLine[]>(() => plainHighlight(block));
    useEffect(() => {
        import('./highlight').then(({ highlight }) => highlight(block, inlines).then(setLines));
    }, [block, inlines]);
    return (
        <ClientCodeBlockRenderer block={block} document={document} style={style} lines={lines} />
    );
}
