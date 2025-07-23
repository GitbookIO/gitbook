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
    const [confirm, setConfirm] = React.useState<boolean>(false);

    const wrapLoading = React.useCallback(async <T,>(fn: Promise<T> | (() => Promise<T>)) => {
        setLoading(true);
        try {
            return fn instanceof Promise ? await fn : await fn();
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <>
            <button
                type="button"
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
                    event.preventDefault();

                    if (element.confirm && !confirm) {
                        setConfirm(true);
                        return;
                    }

                    wrapLoading(async () => await clientContext.dispatchAction(element.onPress));
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
            {element.confirm && confirm ? (
                <ConfirmDialog
                    open={confirm}
                    {...element.confirm}
                    onConfirm={() => {
                        setConfirm(false);
                        wrapLoading(
                            async () => await clientContext.dispatchAction(element.onPress)
                        );
                    }}
                    onCancel={() => setConfirm(false)}
                />
            ) : null}
        </>
    );
}

function ConfirmDialog({ open, onCancel, onConfirm, style, title, text, confirm }: any) {
    return (
        <div className="contentkit-modal-backdrop" onClick={onCancel}>
            <div
                className={classNames(
                    'contentkit-modal contentkit-modal-confirm',
                    open ? 'contentkit-modal-opened' : null
                )}
                onClick={(event) => {
                    event.stopPropagation();
                }}
            >
                <div className="contentkit-modal-header">
                    {title ? <h1 className="contentkit-modal-title">{title}</h1> : null}
                    {text ? <div className="contentkit-modal-subtitle">{text}</div> : null}
                </div>
                <div className="contentkit-modal-footer">
                    <button
                        type="button"
                        className="contentkit-button contentkit-button-confirm contentkit-button-style-secondary"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={classNames(
                            'contentkit-button contentkit-button-confirm',
                            `contentkit-button-style-${style ?? 'primary'}`
                        )}
                        onClick={onConfirm}
                    >
                        {confirm ?? 'OK'}
                    </button>
                </div>
            </div>
        </div>
    );
}
