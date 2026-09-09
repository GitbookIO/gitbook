'use client';

import * as React from 'react';

import type { ContentKitModal } from '@gitbook/api';

import {
    ContentKitClientContext,
    type ContentKitClientContextType,
} from '../../../../react-contentkit/src/context';
import { ElementModal } from '../../../../react-contentkit/src/ElementModal';

const modalElement: ContentKitModal = {
    type: 'modal',
    title: 'Request feature flag access',
    returnValue: {},
    children: [],
};

export function ModalHarnessTrigger() {
    const [enabled, setEnabled] = React.useState(false);
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        setEnabled(window.location.pathname.startsWith('/url/gitbook-dev-tomek.localhost/dev'));
    }, []);

    if (!enabled) {
        return null;
    }

    const clientContext: ContentKitClientContextType = {
        security: { firstPartyDomains: [] },
        state: {},
        setState: () => {},
        update: async () => {},
        dispatchAction: async (action) => {
            console.log('modal harness dispatchAction', action);
            if (action.action === '@ui.modal.close') {
                setOpen(false);
            }
        },
    };

    return (
        <>
            <button
                type="button"
                data-testid="modal-harness-trigger"
                className="fixed bottom-4 right-4 z-50 rounded bg-primary-original px-4 py-2 text-contrast-primary-original shadow-lg"
                onClick={() => setOpen(true)}
            >
                Open modal test
            </button>
            {open ? (
                <ContentKitClientContext.Provider value={clientContext}>
                    <ElementModal element={modalElement} subtitle={null}>
                        <div className="flex flex-col gap-4">
                            <div>
                                <p className="text-lg font-semibold text-tint-strong">
                                    Feature flag 1, Feature flag 2{' '}
                                    <span className="rounded bg-primary-solid px-2 py-1 text-sm text-contrast-primary-solid">
                                        BETA
                                    </span>
                                </p>
                                <p className="text-sm text-tint">Module: sandbox</p>
                            </div>
                            <label className="flex flex-col gap-1 text-sm font-semibold">
                                Full name <span className="text-danger">*</span>
                                <input className="contentkit-textinput" />
                            </label>
                            <label className="flex flex-col gap-1 text-sm font-semibold">
                                Work email <span className="text-danger">*</span>
                                <input className="contentkit-textinput" />
                            </label>
                            <label className="flex flex-col gap-1 text-sm font-semibold">
                                Harness account ID <span className="text-danger">*</span>
                                <input
                                    className="contentkit-textinput"
                                    placeholder="e.g. aBcDefGhIj0123456789_-"
                                />
                            </label>
                            <label className="flex flex-col gap-1 text-sm font-semibold">
                                Use case / additional notes
                                <textarea
                                    className="contentkit-textinput"
                                    placeholder="Describe your use case or any context that would help us prioritise your request."
                                    rows={3}
                                />
                            </label>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="contentkit-button contentkit-button-confirm contentkit-button-style-secondary"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="contentkit-button contentkit-button-confirm contentkit-button-style-primary"
                                    onClick={() => setOpen(false)}
                                >
                                    Request access
                                </button>
                            </div>
                        </div>
                    </ElementModal>
                </ContentKitClientContext.Provider>
            ) : null}
        </>
    );
}
