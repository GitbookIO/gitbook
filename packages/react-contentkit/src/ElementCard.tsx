'use client';

import React from 'react';
import classNames from 'classnames';

import { ContentKitClientElementProps } from './types';
import { ContentKitCard } from '@gitbook/api';
import { useContentKitClientContext } from './context';

/**
 * Interactive card element.
 */
export function ElementCard(
    props: React.PropsWithChildren<
        ContentKitClientElementProps<ContentKitCard> & {
            icon: React.ReactNode | null;
            hint: React.ReactNode | null;
            buttons: React.ReactNode[];
        }
    >,
) {
    const { element, children, icon, hint, buttons } = props;
    const clientContext = useContentKitClientContext();

    return (
        <div
            className={classNames(
                'contentkit-card',
                element.onPress ? 'contentkit-card-pressable' : null,
            )}
            onClick={() => {
                if (element.onPress) {
                    clientContext.dispatchAction(element.onPress);
                }
            }}
        >
            {element.title ? (
                <div className={classNames('contentkit-card-header')}>
                    {icon ? <div className={classNames('contentkit-card-icon')}>{icon}</div> : null}
                    <div className={classNames('contentkit-card-header-content')}>
                        <div className={classNames('contentkit-card-title')}>{element.title}</div>
                        {hint ? (
                            <div className={classNames('contentkit-card-hint')}>{hint}</div>
                        ) : null}
                    </div>
                    {buttons && buttons.length > 0 ? (
                        <div className={classNames('contentkit-card-buttons')}>{buttons}</div>
                    ) : null}
                </div>
            ) : null}

            {children ? <div className={classNames('contentkit-card-body')}>{children}</div> : null}
        </div>
    );
}
