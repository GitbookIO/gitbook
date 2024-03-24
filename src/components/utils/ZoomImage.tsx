'use client';

import IconX from '@geist-ui/icons/x';
import classNames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

import { tcls } from '@/lib/tailwind';

import styles from './ZoomImage.module.css';

/**
 * Replacement for an <img> tag that allows zooming.
 */
export function ZoomImage(
    props: React.ComponentPropsWithoutRef<'img'> & {
        src: string;
    },
) {
    const { ...rest } = props;

    const [active, setActive] = React.useState(false);
    const [opened, setOpened] = React.useState(false);

    const onClose = React.useCallback(() => {
        startViewTransition(
            () => {
                setOpened(false);
            },
            () => {
                setActive(false);
            },
        );
    }, [setOpened]);

    return (
        <>
            {opened ? (
                ReactDOM.createPortal(
                    <ZoomImageModal src={rest.src} alt={rest.alt ?? ''} onClose={onClose} />,
                    document.body,
                )
            ) : (
                <img
                    {...rest}
                    onClick={() => {
                        const image = new Image();
                        image.src = rest.src;

                        image.onload = () => {
                            const change = () => {
                                setOpened(true);
                            };

                            setActive(true);
                            startViewTransition(change);
                        };
                    }}
                    className={classNames(
                        rest.className,
                        styles.zoomImg,
                        active ? styles.zoomImageActive : null,
                    )}
                />
            )}
        </>
    );
}

function ZoomImageModal(props: { src: string; alt: string; onClose: () => void }) {
    const { src, alt, onClose } = props;

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

    return (
        <div className={styles.zoomModal} onClick={onClose}>
            <img
                src={src}
                alt={alt}
                className={tcls(
                    'max-w-full',
                    'max-h-full',
                    'object-contain',
                    'bg-light',
                    'dark:bg-dark',
                )}
                onClick={(event) => {
                    event.stopPropagation();
                }}
            />

            <button
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
                <IconX />
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
