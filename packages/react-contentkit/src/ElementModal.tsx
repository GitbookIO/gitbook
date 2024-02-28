'use client';

import { ContentKitModal } from '@gitbook/api';

import { ContentKitClientElementProps } from './types';
import classNames from 'classnames';
import { useContentKitClientContext } from './context';
import React from 'react';

export function ElementModal(
    props: ContentKitClientElementProps<ContentKitModal> & {
        subtitle: React.ReactNode | null;
        children: React.ReactNode;
    },
) {
    const { element, subtitle, children } = props;
    const clientContext = useContentKitClientContext();

    // TODO:
    // - close button
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
                    opened ? 'contentkit-modal-opened' : null,
                )}
                onClick={(event) => {
                    event.stopPropagation();
                }}
            >
                <div className={classNames('contentkit-modal-header')}>
                    {element.title ? (
                        <h1 className={classNames('contentkit-modal-title')}>{element.title}</h1>
                    ) : null}
                    {subtitle ? <div className="contentkit-modal-subtitle">{subtitle}</div> : null}
                </div>
                <div className={classNames('contentkit-modal-body')}>{children}</div>
            </div>
        </div>
    );
}
