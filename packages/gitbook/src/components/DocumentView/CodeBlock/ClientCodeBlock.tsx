'use client';

import type { DocumentBlockCode } from '@gitbook/api';
import { useEffect, useState } from 'react';

import type { HighlightLine, RenderedInline } from './highlight';
import type { BlockProps } from '../Block';
import { ClientCodeBlockRenderer } from './CodeBlockRenderer';
import { plainHighlight } from './plain-highlight';

type ClientBlockProps = Pick<BlockProps<DocumentBlockCode>, 'block' | 'style'> & {
    inlines: RenderedInline[];
};

/**
 * Render a code-block client-side by calling a server actions to highlight the code.
 * It allows us to defer some load to avoid blocking the rendering of the whole page with block highlighting.
 */
export function ClientCodeBlock(props: ClientBlockProps) {
    const { block, style, inlines } = props;
    const [lines, setLines] = useState<HighlightLine[]>(() => plainHighlight(block, []));
    useEffect(() => {
        import('./highlight').then(({ highlight }) => highlight(block, inlines).then(setLines));
    }, [block, inlines]);
    return <ClientCodeBlockRenderer block={block} style={style} lines={lines} />;
}
