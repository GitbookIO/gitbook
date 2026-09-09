'use client';

import * as React from 'react';

import {
    ContentKitClientContext,
    type ContentKitClientContextType,
} from '../../../../../react-contentkit/src/context';
import { ElementModal } from '../../../../../react-contentkit/src/ElementModal';

export default function ModalHarnessPage() {
    const [open, setOpen] = React.useState(true);

    const clientContext: ContentKitClientContextType = {
        security: { firstPartyDomains: [] },
        state: {},
        setState: () => {},
        update: async () => {},
        dispatchAction: async (action) => {
            console.log('dispatchAction', action);
            if (action.action === '@ui.modal.close') setOpen(false);
        },
    };

    if (!open) {
        return <button onClick={() => setOpen(true)}>Reopen modal</button>;
    }

    return (
        <ContentKitClientContext.Provider value={clientContext}>
            <ElementModal
                element={{ type: 'modal', title: 'Test modal', returnValue: {} } as any}
                subtitle="Subtitle text"
            >
                <p>Modal body content for visual testing.</p>
            </ElementModal>
        </ContentKitClientContext.Provider>
    );
}
