'use client';

import { ContentKitButton } from '@gitbook/api';

import { ContentKitClientElementProps } from './types';
import classNames from 'classnames';
import { useContentKitClientContext } from './context';
import React from 'react';

export function ElementButton(
    props: ContentKitClientElementProps<ContentKitButton> & {
        icon: React.ReactNode | null;
        trailingIcon: React.ReactNode | null;
    },
) {
    const { element, icon, trailingIcon } = props;
    const clientContext = useContentKitClientContext();

    const [loading, setLoading] = React.useState(false);

    // TODO:
    // - loading
    // - confirm

    return (
        <button
            title={element.tooltip}
            className={classNames(
                'contentkit-button',
                `contentkit-button-style-${element.style ?? 'secondary'}`,
                loading ? 'contentkit-button-loading' : null,
            )}
            onClick={(event) => {
                if (element.disabled || loading) {
                    return;
                }

                event.stopPropagation();

                setLoading(true);
                clientContext.dispatchAction(element.onPress).finally(() => {
                    setLoading(false);
                });
            }}
        >
            {icon}
            {element.label ? (
                <span className="contentkit-button-label">{element.label}</span>
            ) : null}
            {trailingIcon}
        </button>
    );
}
