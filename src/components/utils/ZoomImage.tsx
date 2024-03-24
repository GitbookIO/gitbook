'use client';

import classNames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

import styles from './ZoomImage.module.css';

import './ZoomImage.css';

/**
 * Replacement for an <img> tag that allows zooming.
 */
export function ZoomImage(props: React.ComponentPropsWithoutRef<'img'>) {
    const { ...rest } = props;

    const imgRef = React.useRef<HTMLImageElement>(null);
    const [opened, setOpened] = React.useState(false);

    return (
        <>
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
                        if (img) {
                            // @ts-ignore
                            img.style.viewTransitionName = '';
                        }
                        change();
                    });
                }}
                className={classNames(rest.className, styles.zoomImg)}
            />
            {opened
                ? ReactDOM.createPortal(
                      <div className={styles.zoomModal}>
                          <img src={rest.src} />
                      </div>,
                      document.body,
                  )
                : null}
        </>
    );
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
