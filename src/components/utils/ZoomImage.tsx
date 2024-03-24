'use client';

import classNames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

import styles from './ZoomImage.module.css';

import './ZoomImage.css';

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
            <img
                ref={imgRef}
                {...rest}
                onClick={() => {
                    const change = () => {
                        setOpened(true);
                    };

                    // const img = imgRef.current;
                    // if (img) {
                    //     // @ts-ignore
                    //     img.style.viewTransitionName = 'zoom-image';
                    // }
                    startViewTransition(() => {
                        // if (img) {
                        //     // @ts-ignore
                        //     img.style.viewTransitionName = '';
                        // }
                        change();
                    });
                }}
                className={classNames(rest.className, styles.zoomImg)}
            />
            {opened
                ? ReactDOM.createPortal(
                      <ZoomImageModal src={rest.src} alt={rest.alt ?? ''} onClose={onClose} />,
                      document.body,
                  )
                : null}
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
            <img src={src} alt={alt} className={styles.zoomModalImg} onClick={(event) => {
                event.stopPropagation();
            }} />
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
