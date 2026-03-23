'use client';

import { useTheme } from 'next-themes';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { Loading } from '@/components/primitives/Loading';
import { tcls } from '@/lib/tailwind';
import Panzoom from '@panzoom/panzoom';
import { type ClientBlockProps, ClientCodeBlock } from './ClientCodeBlock';
import { MermaidPanZoomControls } from './MermaidPanZoomControls';
import { getPlainCodeBlock } from './highlight';

/**
 * Used to render a Mermaid diagram from a CodeBlock.
 */
export function MermaidCodeBlock(props: ClientBlockProps) {
    const { block, style } = props;
    const source = getPlainCodeBlock(block);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const diagramRef = useRef<HTMLDivElement>(null);
    const [panZoom, setPanZoom] = useState<ReturnType<typeof Panzoom> | null>(null);
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { resolvedTheme } = useTheme();
    const darkMode = resolvedTheme === 'dark';
    const id = useSafeId();

    useEffect(() => {
        const container = diagramRef.current;
        const wrapper = wrapperRef.current;
        if (!container || !wrapper) {
            return;
        }

        let cancelled = false;
        let cleanupPanZoom: (() => void) | undefined;
        setError(false);
        setIsLoading(true);

        renderMermaidDiagram({
            container,
            source,
            id,
            darkMode,
        })
            .then(() => {
                if (!cancelled) {
                    cleanupPanZoom = initPanzoom({
                        container,
                        wrapper,
                        onInit: setPanZoom,
                    });
                }
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
            cleanupPanZoom?.();
            setPanZoom(null);
        };
    }, [source, id, darkMode]);

    if (error) {
        return <ClientCodeBlock {...props} />;
    }

    return (
        <div className={tcls('relative', style)} contentEditable={false}>
            <div
                ref={wrapperRef}
                className={
                    isLoading
                        ? 'invisible absolute inset-x-0 overflow-hidden'
                        : 'cursor-grab overflow-hidden active:cursor-grabbing'
                }
            >
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
            {!isLoading && panZoom ? <MermaidPanZoomControls panZoom={panZoom} /> : null}
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

/**
 * Initialize panzoom on the diagram container.
 */
function initPanzoom(args: {
    container: HTMLElement;
    wrapper: HTMLElement;
    onInit: (instance: ReturnType<typeof Panzoom> | null) => void;
}): () => void {
    const { container, wrapper, onInit } = args;

    const instance = Panzoom(container, {
        maxScale: 5,
        minScale: 0.5,
        contain: 'outside',
        cursor: 'grab',
        panOnlyWhenZoomed: true,
    });

    onInit(instance);

    wrapper.addEventListener('wheel', instance.zoomWithWheel, { passive: false });

    return () => {
        wrapper.removeEventListener('wheel', instance.zoomWithWheel);
        instance.destroy();
        onInit(null);
    };
}

function useSafeId() {
    const rawId = useId();
    return useMemo(() => rawId.replace(/[^a-zA-Z0-9]/g, ''), [rawId]);
}
