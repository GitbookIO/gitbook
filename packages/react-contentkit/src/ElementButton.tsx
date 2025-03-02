'use client';

import type { ContentKitButton } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import React from 'react';

import classNames from 'classnames';
import { useContentKitClientContext } from './context';
import type { ContentKitClientElementProps } from './types';

export function ElementButton(
    props: ContentKitClientElementProps<ContentKitButton> & {
        icon: React.ReactNode | null;
        trailingIcon: React.ReactNode | null;
    }
) {
    const { element, icon, trailingIcon } = props;
    const clientContext = useContentKitClientContext();

    const [loading, setLoading] = React.useState(false);

    // TODO:
    // - confirm dialog

    return (
        <button
            title={element.tooltip}
            className={classNames(
                'contentkit-button',
                `contentkit-button-style-${element.style ?? 'secondary'}`
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
            {loading ? (
                <Icon icon="spinner" className="contentkit-button-loading" />
            ) : (
                <>
                    {icon}
                    {element.label ? (
                        <span className="contentkit-button-label">{element.label}</span>
                    ) : null}
                    {trailingIcon}
                </>
            )}
        </button>
    );
}
