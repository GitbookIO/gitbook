'use client';

import { tString } from '@/intl/translate';
import type { TranslationLanguage } from '@/intl/translations';
import assertNever from 'assert-never';
import * as React from 'react';

export function ImagesLoadingStatus(props: {
    language: TranslationLanguage;
}) {
    const { language } = props;
    const state = useImagesLoadingState();
    return (
        <p className="text-right text-slate-500 text-xs">
            {(() => {
                switch (state.status) {
                    case 'pending':
                        return null;
                    case 'loading':
                        return tString(
                            language,
                            'pdf_images_loading',
                            `${state.loadedImages}`,
                            `${state.totalImages}`
                        );
                    case 'ready':
                        return tString(language, 'pdf_images_loaded');
                    default:
                        assertNever(state);
                }
            })()}
        </p>
    );
}

/**
 * Keep track of images loading state.
 */
function useImagesLoadingState() {
    const [totalImages, setTotalImages] = React.useState<number | null>(null);
    const [loadedImages, setLoadedImages] = React.useState(0);
    const attachedImages = React.useRef(new WeakSet<HTMLImageElement>());
    const rafRef = React.useRef<number>(0);

    const calculateImageStatus = React.useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(() => {
            const images = Array.from(document.images);
            setTotalImages(images.length);
            setLoadedImages(images.filter((image) => image.complete).length);
        });
    }, []);

    React.useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    const attachListeners = React.useCallback(
        (images: HTMLImageElement[]) => {
            images.forEach((image) => {
                if (image.complete || attachedImages.current.has(image)) {
                    return;
                }

                if (image.loading !== 'eager') {
                    console.warn('An image is not in "eager" mode', image);
                }

                attachedImages.current.add(image);
                image.addEventListener('load', calculateImageStatus);
                image.addEventListener('error', calculateImageStatus);
            });
        },
        [calculateImageStatus]
    );

    React.useEffect(() => {
        calculateImageStatus();
        attachListeners(Array.from(document.images));

        let raf: number;

        const observer = new MutationObserver((mutationsList) => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const newImages: HTMLImageElement[] = [];
                let shouldRecalculate = false;
                for (const mutation of mutationsList) {
                    if (mutation.type !== 'childList') {
                        continue;
                    }
                    if (mutation.removedNodes.length > 0) {
                        // Images may have been removed; recalculate counts.
                        shouldRecalculate = true;
                    }
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof HTMLImageElement) {
                            newImages.push(node);
                            shouldRecalculate = true;
                        } else if (node instanceof HTMLElement) {
                            const nestedImages = Array.from(
                                node.getElementsByTagName('img')
                            ) as HTMLImageElement[];
                            if (nestedImages.length > 0) {
                                newImages.push(...nestedImages);
                                shouldRecalculate = true;
                            }
                        }
                    });
                }
                if (newImages.length > 0) {
                    attachListeners(newImages);
                }
                if (shouldRecalculate) {
                    calculateImageStatus();
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
            Array.from(document.images).forEach((image) => {
                image.removeEventListener('load', calculateImageStatus);
                image.removeEventListener('error', calculateImageStatus);
            });
        };
    }, [attachListeners, calculateImageStatus]);

    if (totalImages === null) {
        return { status: 'pending' } as const;
    }

    return {
        status: totalImages === loadedImages ? 'ready' : 'loading',
        totalImages,
        loadedImages,
    } as const;
}
