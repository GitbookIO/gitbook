'use client';

import classNames from 'classnames';
import React from 'react';

import type { ContentKitModal } from '@gitbook/api';
import { Icon } from '@gitbook/icons';

import { useContentKitClientContext } from './context';
import type { ContentKitClientElementProps } from './types';

export function ElementModal(
    props: ContentKitClientElementProps<ContentKitModal> & {
        subtitle: React.ReactNode | null;
        children: React.ReactNode;
    }
) {
    const { element, subtitle, children } = props;
    const clientContext = useContentKitClientContext();

    // TODO:
    // - invalid rendering on close?
    // - submit

    const [opened, setOpened] = React.useState(false);
    React.useEffect(() => {
        setOpened(true);
    }, []);

    const onClose = async () => {
        await clientContext.dispatchAction({
            action: '@ui.modal.close',
            returnValue: element.returnValue || {},
        });
    };

    return (
        <div className={classNames('contentkit-modal-backdrop')} onClick={onClose}>
            <div
                className={classNames(
                    'contentkit-modal',
                    opened ? 'contentkit-modal-opened' : null
                )}
                onClick={(event) => {
                    event.stopPropagation();
                }}
            >
                <div
                    className={classNames(
                        'contentkit-modal-header',
                        'contentkit-modal-header-with-close'
                    )}
                >
                    <div className="contentkit-modal-header-content">
                        {element.title ? (
                            <h1 className={classNames('contentkit-modal-title')}>
                                {element.title}
                            </h1>
                        ) : null}
                        {subtitle ? (
                            <div className="contentkit-modal-subtitle">{subtitle}</div>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        className="contentkit-modal-close"
                        onClick={onClose}
                    >
                        <Icon icon="xmark" className="contentkit-modal-close-icon" />
                    </button>
                </div>
                <div className={classNames('contentkit-modal-body')}>{children}</div>
                <div className="contentkit-modal-footer">
                    <button
                        type="button"
                        className="contentkit-button contentkit-button-confirm contentkit-button-style-secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
