'use client';

import React from 'react';

import type { ContentKitRenderOutputElement, RequestRenderIntegrationUI } from '@gitbook/api';
import { ContentKit, type ContentKitSecurity } from '@gitbook/react-contentkit/client';

import { Button, type ButtonProps } from '../primitives';
import { renderIntegrationUi } from './Integration/server-actions';

/**
 * Button that hands the click to an integration: the integration renders its component in modal
 * mode and decides what the reader sees. This is how an integration reaches places an integration
 * block cannot go, such as a table cell.
 */
export function IntegrationActionButton(props: {
    integration: string;
    block: string;
    spaceId: string;
    security: ContentKitSecurity;
    buttonProps: ButtonProps;
}) {
    const { integration, block, spaceId, security, buttonProps } = props;

    const [loading, setLoading] = React.useState(false);
    const [modal, setModal] = React.useState<null | {
        input: RequestRenderIntegrationUI;
        output: ContentKitRenderOutputElement;
        children: React.ReactNode;
    }>(null);

    const renderContext = React.useMemo(() => ({ integrationName: integration }), [integration]);

    const onClick = async () => {
        setLoading(true);
        try {
            const input: RequestRenderIntegrationUI = {
                componentId: block,
                props: {},
                context: {
                    type: 'document',
                    spaceId,
                    editable: false,
                    theme: 'light', // Same limitation as the integration block: rendering is server-side.
                },
            };

            const result = await renderIntegrationUi({ renderContext, request: input });
            // Anything but a modal has no place to go here: a `block` would render loose next to
            // the button, and a `complete` means the integration handled the click on its own.
            if (result.output?.type === 'element' && result.output.element.type === 'modal') {
                setModal({ input, output: result.output, children: result.children });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button {...buttonProps} disabled={loading} onClick={onClick} />
            {modal ? (
                <ContentKit
                    renderContext={renderContext}
                    security={security}
                    initialInput={modal.input}
                    initialOutput={modal.output}
                    render={renderIntegrationUi}
                    onAction={(action) => {
                        if (action.action === '@ui.modal.close') {
                            setModal(null);
                        }
                    }}
                    onComplete={() => setModal(null)}
                >
                    {modal.children}
                </ContentKit>
            ) : null}
        </>
    );
}
