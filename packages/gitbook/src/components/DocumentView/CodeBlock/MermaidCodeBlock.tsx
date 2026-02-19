'use client';

import { useTheme } from 'next-themes';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { Loading } from '@/components/primitives/Loading';
import { tcls } from '@/lib/tailwind';
import { type ClientBlockProps, ClientCodeBlock } from './ClientCodeBlock';
import { getPlainCodeBlock } from './highlight';

/**
 * Used to render a Mermaid diagram from a CodeBlock.
 */
export function MermaidCodeBlock(props: ClientBlockProps) {
    const { block, style } = props;
    const source = getPlainCodeBlock(block);
    const diagramRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { resolvedTheme } = useTheme();
    const darkMode = resolvedTheme === 'dark';
    const id = useSafeId();

    useEffect(() => {
        const container = diagramRef.current;
        if (!container) {
            return;
        }

        let cancelled = false;
        setError(false);
        setIsLoading(true);

        renderMermaidDiagram({
            container,
            source,
            id,
            darkMode,
        })
            .catch(() => {
                if (!cancelled) {
                    setError(true);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [source, id, darkMode]);

    if (error) {
        return <ClientCodeBlock {...props} />;
    }

    return (
        <div className={tcls('relative', style)} contentEditable={false}>
            <div className={isLoading ? 'invisible absolute inset-x-0' : undefined}>
                <div
                    ref={diagramRef}
                    className="overflow-auto p-2 [&_svg]:h-auto [&_svg]:max-w-full"
                />
            </div>
            {isLoading ? (
                <div className="flex h-24 items-center justify-center text-tint">
                    <Loading className="h-8 w-8" />
                </div>
            ) : null}
        </div>
    );
}

async function renderMermaidDiagram(args: {
    container: HTMLElement;
    source: string;
    id: string;
    darkMode: boolean;
}) {
    const { container, source, id, darkMode } = args;
    const [{ default: mermaid }, { default: zenuml }] = await Promise.all([
        import('mermaid'),
        import('@mermaid-js/mermaid-zenuml'),
    ]);

    await mermaid.registerExternalDiagrams([zenuml]);

    mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        darkMode,
        theme: darkMode ? 'dark' : undefined,
    });

    const { svg, bindFunctions } = await mermaid.render(`mermaid-diagram-${id}`, source, container);
    container.innerHTML = svg;
    bindFunctions?.(container);
}

function useSafeId() {
    const rawId = useId();
    return useMemo(() => rawId.replace(/[^a-zA-Z0-9]/g, ''), [rawId]);
}
