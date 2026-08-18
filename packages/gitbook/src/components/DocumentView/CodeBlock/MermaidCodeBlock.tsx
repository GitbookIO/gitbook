'use client';

import { Dialog } from '@base-ui/react/dialog';
import Panzoom from '@panzoom/panzoom';
import type { RenderResult } from 'mermaid';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { type ClientBlockProps, ClientCodeBlock } from './ClientCodeBlock';
import { getPlainCodeBlock } from './highlight-tokens';
import { MermaidPanZoomControls } from './MermaidPanZoomControls';
import { useHasBeenInViewport } from '@/components/hooks/useHasBeenInViewport';
import { Loading } from '@/components/primitives/Loading';
import { tcls } from '@/lib/tailwind';

/**
 * Used to render a Mermaid diagram from a CodeBlock.
 */
export function MermaidCodeBlock(
    props: ClientBlockProps & {
        mermaidRuntimeURL: string;
    }
) {
    const { block, mode, style, mermaidRuntimeURL } = props;
    const source = getPlainCodeBlock(block);
    const rootRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const diagramRef = useRef<HTMLDivElement>(null);
    // A stable container that holds the diagram subtree. We portal the diagram into it and
    // only ever move this plain node between the inline slot and the dialog — never the
    // React-managed subtree itself — so React stays in control and panzoom/SVG are preserved.
    const diagramHostRef = useRef<HTMLDivElement | null>(null);
    if (diagramHostRef.current === null && typeof document !== 'undefined') {
        const host = document.createElement('div');
        // `display: contents` so the host adds no box of its own (the diagram becomes a
        // direct flex child of the dialog panel and can fill it).
        host.style.display = 'contents';
        diagramHostRef.current = host;
    }
    const [panZoom, setPanZoom] = useState<ReturnType<typeof Panzoom> | null>(null);
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    // `isPresent` stays true through the closing animation, until the panel hands the host back.
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPresent, setIsPresent] = useState(false);
    // Read by the wheel handler (registered once in `initPanzoom`) so it always knows
    // whether the diagram is currently in the fullscreen dialog.
    const isPresentRef = useRef(isPresent);
    isPresentRef.current = isPresent;
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
                    mermaidRuntimeURL,
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
                        isFullscreenRef: isPresentRef,
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
    }, [source, id, darkMode, mermaidRuntimeURL, shouldRender]);

    const openFullscreen = useCallback(() => {
        // Reserve the inline slot's current height before the diagram is detached, so the
        // page layout does not jump. Measured here while still inline and un-restyled.
        const root = rootRef.current;
        if (root) {
            root.style.minHeight = `${root.offsetHeight}px`;
        }
        setIsPresent(true);
        setIsFullscreen(true);
        // Re-center the diagram for the larger view.
        panZoom?.reset();
    }, [panZoom]);

    const closeFullscreen = useCallback(() => {
        setIsFullscreen(false);
    }, []);

    // Keep the diagram host in the inline slot on mount (and whenever it isn't in the dialog).
    useLayoutEffect(() => {
        const host = diagramHostRef.current;
        const root = rootRef.current;
        if (host && root && !host.parentNode) {
            root.appendChild(host);
        }
    }, []);

    // Move the diagram host into the dialog panel (and back) as the panel mounts/unmounts.
    // The inline slot's reserved height (set in openFullscreen) is cleared on return.
    const setPanel = useCallback((panel: HTMLDivElement | null) => {
        panelRef.current = panel;
        const host = diagramHostRef.current;
        const root = rootRef.current;
        if (!host) {
            return;
        }

        if (panel) {
            panel.appendChild(host);
        } else if (root) {
            root.appendChild(host);
            root.style.minHeight = '';
            setIsPresent(false);
        }
    }, []);

    if (error) {
        return <ClientCodeBlock {...props} />;
    }

    // The live diagram subtree. It is portaled into a stable host that moves between the
    // inline slot and the dialog, so its markup must not depend on where it currently lives.
    const diagram = (
        <div
            className={tcls(
                'group/mermaid relative',
                isPresent ? 'flex h-full w-full flex-col' : null
            )}
        >
            <div
                ref={wrapperRef}
                className={tcls(
                    isLoading
                        ? 'invisible absolute inset-x-0 overflow-hidden'
                        : 'cursor-grab overflow-hidden active:cursor-grabbing',
                    isPresent && !isLoading ? 'flex-1' : null
                )}
            >
                <div
                    ref={diagramRef}
                    className={tcls(
                        'overflow-auto p-2 [&_svg]:h-auto [&_svg]:max-w-full',
                        isPresent
                            ? 'flex h-full items-center justify-center [&_svg]:max-h-full'
                            : null
                    )}
                />
            </div>
            {isLoading ? (
                <div className="flex h-24 items-center justify-center text-tint">
                    <Loading className="h-8 w-8" />
                </div>
            ) : null}
            {!isLoading && panZoom ? (
                <MermaidPanZoomControls
                    panZoom={panZoom}
                    isFullscreen={isPresent}
                    onToggleFullscreen={isFullscreen ? closeFullscreen : openFullscreen}
                />
            ) : null}
        </div>
    );

    return (
        <>
            {/* Inline slot: hosts the diagram in the document flow until it goes fullscreen. */}
            <div ref={rootRef} className={tcls('relative', style)} contentEditable={false} />
            {diagramHostRef.current ? createPortal(diagram, diagramHostRef.current) : null}
            <Dialog.Root
                open={isFullscreen}
                onOpenChange={(open) => !open && closeFullscreen()}
                onOpenChangeComplete={(open) => !open && panZoom?.reset()}
            >
                <Dialog.Portal>
                    <Dialog.Backdrop className="data-closed:animate-fade-out data-open:animate-fade-in fixed inset-0 z-40 bg-tint-base/3 backdrop-blur-md dark:bg-tint-base/6" />
                    <Dialog.Popup
                        aria-label="Mermaid diagram"
                        render={<div ref={setPanel} />}
                        className="outline-hidden data-closed:animate-blur-out data-open:animate-blur-in fixed inset-3 z-40 mx-auto flex max-w-[110rem] flex-col overflow-hidden rounded-2xl border border-tint-subtle bg-tint-base shadow-2xl sm:inset-5 lg:inset-8"
                    />
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}

async function renderMermaidDiagram(args: {
    source: string;
    id: string;
    darkMode: boolean;
    mermaidRuntimeURL: string;
}): Promise<RenderResult> {
    const { source, id, darkMode, mermaidRuntimeURL } = args;
    const { mermaid } = await loadMermaid(mermaidRuntimeURL);

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
    mermaid: (typeof import('mermaid'))['default'];
}> | null = null;

async function loadMermaid(runtimeURL: string) {
    if (!mermaidLoadPromise) {
        mermaidLoadPromise = import(/* webpackIgnore: true */ runtimeURL)
            .then(
                async (runtime: {
                    loadMermaid: () => Promise<(typeof import('mermaid'))['default']>;
                }) => {
                    return { mermaid: await runtime.loadMermaid() };
                }
            )
            .catch((error) => {
                mermaidLoadPromise = null;
                throw error;
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
    isFullscreenRef: { current: boolean };
    onInit: (instance: ReturnType<typeof Panzoom> | null) => void;
}): () => void {
    const { container, wrapper, isFullscreenRef, onInit } = args;

    const instance = Panzoom(container, {
        maxScale: 5,
        minScale: 0.5,
        cursor: 'grab',
        panOnlyWhenZoomed: true,
    });

    onInit(instance);

    // Inline, the wheel must scroll the page — only zoom when the user holds Ctrl/Cmd, so
    // scrolling past a diagram isn't hijacked (mirrors the modifier-to-zoom behavior of
    // embedded maps; trackpad pinch also arrives as a Ctrl+wheel event). In the fullscreen
    // dialog the page scroll is locked, so the wheel always zooms.
    const onWheel = (event: WheelEvent) => {
        if (!isFullscreenRef.current && !event.ctrlKey && !event.metaKey) {
            return;
        }
        instance.zoomWithWheel(event);
    };

    wrapper.addEventListener('wheel', onWheel, { passive: false });

    return () => {
        wrapper.removeEventListener('wheel', onWheel);
        instance.destroy();
        onInit(null);
    };
}

function useSafeId() {
    const rawId = useId();
    return useMemo(() => rawId.replace(/[^a-zA-Z0-9]/g, ''), [rawId]);
}
