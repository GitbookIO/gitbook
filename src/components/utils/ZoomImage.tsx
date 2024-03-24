'use client';

import classNames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

import IconX from '@geist-ui/icons/x';

import styles from './ZoomImage.module.css';

import { tcls } from '@/lib/tailwind';

/**
 * Replacement for an <img> tag that allows zooming.
 */
export function ZoomImage(props: React.ComponentPropsWithoutRef<'img'> & {
    src: string;
}) {
    const { ...rest } = props;

    const imgRef = React.useRef<HTMLImageElement>(null);
    const [opened, setOpened] = React.useState(false);

    const onClose = React.useCallback(() => {
        setOpened(false);
    }, [setOpened]);

    return (
        <>
            
            {opened
                ? ReactDOM.createPortal(
                      <ZoomImageModal src={rest.src} alt={rest.alt ?? ''} onClose={onClose} />,
                      document.body,
                  )
                : (
                    <img
                ref={imgRef}
                {...rest}
                onClick={() => {
                    const change = () => {
                        setOpened(true);
                    };

                    const img = imgRef.current;
                    if (img) {
                        // @ts-ignore
                        img.style.viewTransitionName = 'zoom-image';
                    }
                    startViewTransition(() => {
                        // if (img) {
                        //     // @ts-ignore
                        //     img.style.viewTransitionName = '';
                        // }
                        ReactDOM.flushSync(() => change());
                    });
                }}
                className={classNames(rest.className, styles.zoomImg, opened ? styles.zoomImageActive : null)}
            />
                )}
        </>
    );
}

function ZoomImageModal(props: {
    src: string;
    alt: string;
    onClose: () => void;
}) {
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
            <img src={src} alt={alt} className={tcls('max-w-full', 'max-h-full', 'object-contain', 'bg-light', 'dark:bg-dark')} onClick={(event) => {
                event.stopPropagation();
            }} />

            <button className={tcls(
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
            )} onClick={onClose}>
                <IconX />
            </button>
        </div>
    )
}

function startViewTransition(callback: () => void) {
    // @ts-ignore
    if (document.startViewTransition) {
        // @ts-ignore
        document.startViewTransition(callback);
    } else {
        callback();
    }
}
