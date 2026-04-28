'use client';

import { useTheme } from 'next-themes';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { useHasBeenInViewport } from '@/components/hooks/useHasBeenInViewport';
import { Loading } from '@/components/primitives/Loading';
import { tcls } from '@/lib/tailwind';
import Panzoom from '@panzoom/panzoom';
import type { RenderResult } from 'mermaid';
import { type ClientBlockProps, ClientCodeBlock } from './ClientCodeBlock';
import { MermaidPanZoomControls } from './MermaidPanZoomControls';
import { getPlainCodeBlock } from './highlight';

/**
 * Used to render a Mermaid diagram from a CodeBlock.
 */
export function MermaidCodeBlock(props: ClientBlockProps) {
    const { block, mode, style } = props;
    const source = getPlainCodeBlock(block);
    const rootRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const diagramRef = useRef<HTMLDivElement>(null);
    const [panZoom, setPanZoom] = useState<ReturnType<typeof Panzoom> | null>(null);
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { resolvedTheme } = useTheme();
    const darkMode = resolvedTheme === 'dark';
    const id = useSafeId();
    const hasBeenInViewport = useHasBeenInViewport(rootRef, { rootMargin: '800px' });
    const shouldRender = mode === 'print' || hasBeenInViewport;

    useEffect(() => {
        if (!shouldRender) {
            return;
        }

        const container = diagramRef.current;
        const wrapper = wrapperRef.current;
        if (!container || !wrapper) {
            return;
        }

        let cancelled = false;
        let cleanupPanZoom: (() => void) | undefined;
        setError(false);
        setIsLoading(true);
        setPanZoom(null);
        container.innerHTML = '';

        const cancelScheduledRender = scheduleMermaidWork(() => {
            enqueueMermaidRender(async () => {
                if (cancelled) {
                    return null;
                }

                return renderMermaidDiagram({
                    source,
                    id,
                    darkMode,
                });
            })
                .then((result) => {
                    if (!result || cancelled) {
                        return;
                    }

                    container.innerHTML = result.svg;
                    if (container.querySelector('svg')) {
                        result.bindFunctions?.(container);
                    }

                    cleanupPanZoom = initPanzoom({
                        container,
                        wrapper,
                        onInit: setPanZoom,
                    });
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
        });

        return () => {
            cancelled = true;
            cancelScheduledRender();
            cleanupPanZoom?.();
            setPanZoom(null);
        };
    }, [source, id, darkMode, shouldRender]);

    if (error) {
        return <ClientCodeBlock {...props} />;
    }

    return (
        <div ref={rootRef} className={tcls('relative', style)} contentEditable={false}>
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
    source: string;
    id: string;
    darkMode: boolean;
}): Promise<RenderResult> {
    const { source, id, darkMode } = args;
    const { mermaid } = await loadMermaid();

    mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        darkMode,
        theme: darkMode ? 'dark' : undefined,
    });

    const renderContainer = createMermaidRenderContainer();

    try {
        return await mermaid.render(`mermaid-diagram-${id}`, source, renderContainer);
    } finally {
        renderContainer.remove();
    }
}

/**
 * Mermaid measures labels while rendering, so the temporary render target must be
 * connected to the document. Keep it fixed and contained so those layout reads do
 * not walk the visible document flow.
 */
function createMermaidRenderContainer() {
    const container = document.createElement('div');

    container.setAttribute('aria-hidden', 'true');
    Object.assign(container.style, {
        contain: 'strict',
        height: '100vh',
        isolation: 'isolate',
        left: '0',
        overflow: 'hidden',
        pointerEvents: 'none',
        position: 'fixed',
        top: '0',
        visibility: 'hidden',
        width: '100vw',
        zIndex: '-1',
    });

    document.body.appendChild(container);

    return container;
}

let mermaidLoadPromise: Promise<{
    mermaid: typeof import('mermaid')['default'];
}> | null = null;

async function loadMermaid() {
    if (!mermaidLoadPromise) {
        mermaidLoadPromise = Promise.all([
            import('mermaid'),
            import('@mermaid-js/mermaid-zenuml'),
        ]).then(async ([{ default: mermaid }, { default: zenuml }]) => {
            await mermaid.registerExternalDiagrams([zenuml]);
            return { mermaid };
        });
    }

    return mermaidLoadPromise;
}

let mermaidRenderQueue = Promise.resolve();

function enqueueMermaidRender<T>(task: () => Promise<T>) {
    const result = mermaidRenderQueue.then(task, task);
    mermaidRenderQueue = result.catch(() => {}).then(waitForNextFrame);

    return result;
}

function waitForNextFrame() {
    return new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
    });
}

function scheduleMermaidWork(callback: () => void) {
    const win = window as WindowWithIdleCallback;
    let cancelled = false;

    if (win.requestIdleCallback && win.cancelIdleCallback) {
        const handle = win.requestIdleCallback(
            () => {
                if (!cancelled) {
                    callback();
                }
            },
            { timeout: 1500 }
        );

        return () => {
            cancelled = true;
            win.cancelIdleCallback?.(handle);
        };
    }

    const handle = window.setTimeout(() => {
        if (!cancelled) {
            callback();
        }
    });

    return () => {
        cancelled = true;
        window.clearTimeout(handle);
    };
}

type WindowWithIdleCallback = Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
};

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
