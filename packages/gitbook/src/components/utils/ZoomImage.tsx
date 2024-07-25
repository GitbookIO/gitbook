'use client';

import IconMinimize from '@geist-ui/icons/minimize';
import classNames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

import { tcls } from '@/lib/tailwind';

import styles from './ZoomImage.module.css';

/**
 * Replacement for an <img> tag that allows zooming.
 * The implementation uses the experimental View Transition API in Chrome for a smooth transition.
 */
export function ZoomImage(
    props: React.ComponentPropsWithoutRef<'img'> & {
        src: string;
    },
) {
    const { src, alt, width } = props;

    const imgRef = React.useRef<HTMLImageElement>(null);
    const [zoomable, setZoomable] = React.useState(false);
    const [active, setActive] = React.useState(false);
    const [opened, setOpened] = React.useState(false);
    const [placeholderRect, setPlaceholderRect] = React.useState<DOMRect | null>(null);

    // Only allow zooming when image will not actually be larger and on mobile
    React.useEffect(() => {
        if (isTouchDevice()) {
            return;
        }

        const imageWidth = typeof width === 'number' ? width : 0;
        let viewWidth = 0;

        const mediaQueryList = window.matchMedia('(min-width: 768px)');
        const resizeObserver =
            typeof ResizeObserver !== 'undefined'
                ? new ResizeObserver((entries) => {
                      const imgEntry = entries[0];

                      // Since the image is removed from the DOM when the modal is opened,
                      // We only care when the size is defined.
                      if (imgEntry && imgEntry.contentRect.width !== 0) {
                          viewWidth = entries[0]?.contentRect.width;
                          setPlaceholderRect(entries[0].contentRect);
                          onChange();
                      }
                  })
                : null;

        const onChange = () => {
            if (!mediaQueryList.matches) {
                // Don't allow zooming on mobile
                setZoomable(false);
            } else if (resizeObserver && imageWidth && viewWidth && imageWidth <= viewWidth) {
                // Image can't be zoomed if it's already rendered as it's largest size
                setZoomable(false);
            } else {
                setZoomable(true);
            }
        };

        mediaQueryList.addEventListener('change', onChange);
        if (imgRef.current) {
            resizeObserver?.observe(imgRef.current);
        }

        if (!resizeObserver) {
            // When resizeObserver is available, it'll take care of calling the changelog as soon as the element is observed
            onChange();
        }

        return () => {
            resizeObserver?.disconnect();
            mediaQueryList.removeEventListener('change', onChange);
        };
    }, [imgRef, width]);

    // Preload the image that will be displayed in the modal
    if (zoomable) {
        ReactDOM.preload(src, {
            as: 'image',
        });
    }
    const preloadImage = React.useCallback(
        (onLoad?: () => void) => {
            const image = new Image();
            image.src = src;

            image.onload = () => {
                onLoad?.();
            };
        },
        [src],
    );

    // When closing the modal, animate the transition back to the original image
    const onClose = React.useCallback(() => {
        startViewTransition(
            () => {
                setOpened(false);
            },
            () => {
                setActive(false);
            },
        );
    }, []);

    return (
        <>
            {opened ? (
                <>
                    {placeholderRect ? (
                        // Placeholder to keep the layout stable when the image is removed from the DOM
                        <span
                            style={{
                                display: 'block',
                                width: placeholderRect.width,
                                height: placeholderRect.height,
                            }}
                        />
                    ) : null}

                    {ReactDOM.createPortal(
                        <ZoomImageModal
                            src={src}
                            crossOrigin={props.crossOrigin}
                            alt={alt ?? ''}
                            onClose={onClose}
                        />,
                        document.body,
                    )}
                </>
            ) : (
                // When zooming, remove the image from the DOM to let the browser animates it with View Transition.
                <img
                    ref={imgRef}
                    {...props}
                    alt={alt ?? ''}
                    onMouseEnter={() => {
                        if (zoomable) {
                            preloadImage();
                        }
                    }}
                    onClick={() => {
                        if (!zoomable) {
                            return;
                        }

                        // Preload the image before opening the modal to ensure the animation is smooth
                        preloadImage(() => {
                            const change = () => {
                                setOpened(true);
                            };

                            ReactDOM.flushSync(() => setActive(true));
                            startViewTransition(change);
                        });
                    }}
                    className={classNames(
                        props.className,
                        zoomable ? styles.zoomImg : null,
                        active ? styles.zoomImageActive : null,
                    )}
                />
            )}
        </>
    );
}

function ZoomImageModal(props: {
    src: string;
    alt: string;
    crossOrigin: React.ComponentPropsWithoutRef<'img'>['crossOrigin'];
    onClose: () => void;
}) {
    const { src, alt, crossOrigin, onClose } = props;

    const buttonRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    React.useEffect(() => {
        buttonRef.current?.focus();
    }, []);

    return (
        <div
            className={classNames(
                styles.zoomModal,
                tcls(
                    'fixed',
                    'inset-0',
                    'z-50',
                    'flex',
                    'items-center',
                    'justify-center',
                    'bg-light',
                    'dark:bg-dark',
                    'p-8',
                ),
            )}
            onClick={onClose}
        >
            <img
                src={src}
                alt={alt}
                crossOrigin={crossOrigin}
                className={tcls(
                    'max-w-full',
                    'max-h-full',
                    'object-contain',
                    'bg-light',
                    'dark:bg-dark',
                )}
            />

            <button
                ref={buttonRef}
                className={tcls(
                    'absolute',
                    'top-5',
                    'right-5',
                    'flex',
                    'flex-row',
                    'items-center',
                    'justify-center',
                    'text-sm',
                    'text-dark/6',
                    'dark:text-light/5',
                    'hover:text-primary',
                    'p-4',
                    'dark:text-light/5',
                    'rounded-full',
                    'bg-white',
                    'dark:bg-dark/3',
                    'shadow-sm',
                    'hover:shadow-md',
                    'border-slate-300',
                    'dark:border-dark/2',
                    'border',
                )}
                onClick={onClose}
            >
                <IconMinimize />
            </button>
        </div>
    );
}

function startViewTransition(callback: () => void, onEnd?: () => void) {
    // @ts-ignore
    if (document.startViewTransition) {
        // @ts-ignore
        const transition = document.startViewTransition(() => {
            ReactDOM.flushSync(() => callback());
        });
        transition.finished.then(() => {
            if (onEnd) {
                onEnd();
            }
        });
    } else {
        callback();
        onEnd?.();
    }
}

function isTouchDevice(): boolean {
    return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
    );
}
