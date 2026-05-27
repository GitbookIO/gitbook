'use client';

import { useTheme } from 'next-themes';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useHasBeenInViewport } from '@/components/hooks/useHasBeenInViewport';
import { Loading } from '@/components/primitives/Loading';
import { tcls } from '@/lib/tailwind';
import Panzoom from '@panzoom/panzoom';
import type { RenderResult } from 'mermaid';
import { FocusScope, usePreventScroll } from 'react-aria';
import { type ClientBlockProps, ClientCodeBlock } from './ClientCodeBlock';
import { MermaidPanZoomControls } from './MermaidPanZoomControls';
import { getPlainCodeBlock } from './highlight';

/** Duration of the fullscreen dialog enter/exit animation, must match `animate-blur-in/out`. */
const DIALOG_ANIMATION_MS = 200;

/**
 * Used to render a Mermaid diagram from a CodeBlock.
 */
export function MermaidCodeBlock(props: ClientBlockProps) {
    const { block, mode, style } = props;
    const source = getPlainCodeBlock(block);
    const rootRef = useRef<HTMLDivElement>(null);
    const movableRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const diagramRef = useRef<HTMLDivElement>(null);
    const [panZoom, setPanZoom] = useState<ReturnType<typeof Panzoom> | null>(null);
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    // `isFullscreen` is the open intent; `isExiting` keeps the dialog mounted while it
    // animates closed. `isPresent` is true whenever the diagram lives in the dialog.
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const isPresent = isFullscreen || isExiting;
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

    // Lock the page scroll while the dialog is on screen (handles scrollbar width and iOS).
    usePreventScroll({ isDisabled: !isPresent });

    const openFullscreen = useCallback(() => {
        // Reserve the inline slot's current height before the diagram is detached, so the
        // page layout does not jump. Measured here while still inline and un-restyled.
        const root = rootRef.current;
        if (root) {
            root.style.minHeight = `${root.offsetHeight}px`;
        }
        setIsExiting(false);
        setIsFullscreen(true);
        // Re-center the diagram for the larger view.
        panZoom?.reset();
    }, [panZoom]);

    const closeFullscreen = useCallback(() => {
        setIsFullscreen(false);
        setIsExiting(true);
    }, []);

    // Keep the dialog mounted until the exit animation finishes, then unmount it.
    useEffect(() => {
        if (!isExiting) {
            return;
        }

        const timer = window.setTimeout(() => {
            setIsExiting(false);
            panZoom?.reset();
        }, DIALOG_ANIMATION_MS);
        return () => window.clearTimeout(timer);
    }, [isExiting, panZoom]);

    // Allow Escape to close the dialog.
    useEffect(() => {
        if (!isFullscreen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeFullscreen();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isFullscreen, closeFullscreen]);

    // Move the live diagram into the fullscreen dialog (and back) without re-rendering it,
    // so panzoom and the rendered SVG are preserved. Done in the panel's ref callback so it
    // happens during commit, before FocusScope reads focus. The inline slot's reserved
    // height (set in openFullscreen) is cleared once the diagram returns to it.
    const setPanel = useCallback((panel: HTMLDivElement | null) => {
        panelRef.current = panel;
        const root = rootRef.current;
        const movable = movableRef.current;
        if (!root || !movable) {
            return;
        }

        if (panel) {
            panel.appendChild(movable);
        } else {
            root.appendChild(movable);
            root.style.minHeight = '';
        }
    }, []);

    if (error) {
        return <ClientCodeBlock {...props} />;
    }

    // The live diagram subtree. It is reparented between the inline slot and the
    // fullscreen dialog, so its markup must not depend on where it currently lives.
    const diagram = (
        <div
            ref={movableRef}
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
                        isPresent ? 'h-full [&_svg]:max-h-full' : null
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
            {/* Inline slot: keeps the diagram in the document flow until it goes fullscreen. */}
            <div ref={rootRef} className={tcls('relative', style)} contentEditable={false}>
                {diagram}
            </div>
            {isPresent
                ? createPortal(
                      <FocusScope contain restoreFocus>
                          {/* Backdrop: dims and blurs the page, closes on click. */}
                          {/* biome-ignore lint/a11y/useKeyWithClickEvents: a global Escape handler closes the dialog. */}
                          <div
                              aria-hidden="true"
                              className={tcls(
                                  'fixed inset-0 z-40 bg-tint-base/3 backdrop-blur-md dark:bg-tint-base/6',
                                  isFullscreen ? 'animate-fade-in' : 'animate-fade-out'
                              )}
                              onClick={closeFullscreen}
                          />
                          {/* Centered panel. The padding area lets clicks fall through to the backdrop. */}
                          <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-5 lg:p-8">
                              <div
                                  ref={setPanel}
                                  role="dialog"
                                  aria-modal="true"
                                  aria-label="Mermaid diagram"
                                  className={tcls(
                                      'pointer-events-auto relative flex h-full w-full max-w-[110rem] flex-col overflow-hidden rounded-2xl border border-tint-subtle bg-tint-base shadow-2xl',
                                      isFullscreen ? 'animate-blur-in' : 'animate-blur-out'
                                  )}
                              />
                          </div>
                      </FocusScope>,
                      document.body
                  )
                : null}
        </>
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
        mermaidLoadPromise = Promise.all([import('mermaid'), import('@mermaid-js/mermaid-zenuml')])
            .then(async ([{ default: mermaid }, { default: zenuml }]) => {
                await mermaid.registerExternalDiagrams([zenuml]);
                return { mermaid };
            })
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
