import { GITBOOK_INTEGRATIONS_HOST } from '@/lib/env';
import { tcls } from '@/lib/tailwind';
import type { DocumentBlockIntegration, RenderIntegrationUI } from '@gitbook/api';
import { ContentKit, ContentKitOutput } from '@gitbook/react-contentkit';

import type { BlockProps } from '../Block';
import './contentkit.css';
import { contentKitServerContext } from './contentkit';
import { fetchSafeIntegrationUI } from './render';
import { renderIntegrationUi } from './server-actions';

export async function IntegrationBlock(props: BlockProps<DocumentBlockIntegration>) {
    const { block, context, style } = props;

    if (!context.contentContext?.space) {
        throw new Error('integration block requires a content.spaceId');
    }

    const initialInput: RenderIntegrationUI = {
        componentId: block.data.block,
        props: block.data.props,
        action: block.data.action,
        context: {
            type: 'document',
            spaceId: context.contentContext?.space.id,
            editable: false,
            theme: 'light', // TODO: how to handle this without moving rendering to the client side?
        },
    };

    const initialResponse = await fetchSafeIntegrationUI(context.contentContext, {
        integrationName: block.data.integration,
        request: initialInput,
    });

    if (initialResponse.error) {
        if (initialResponse.error.code === 404) {
            return null;
        }

        return (
            <div className={tcls(style)}>
                <pre>
                    Unexpected error with integration {block.data.integration}:{' '}
                    {initialResponse.error.message}
                </pre>
            </div>
        );
    }
    const initialOutput = initialResponse.data;
    if (initialOutput.type === 'complete') {
        return null;
    }

    return (
        <div className={tcls(style)}>
            <ContentKit
                renderContext={{
                    integrationName: block.data.integration,
                }}
                security={{ firstPartyDomains: [GITBOOK_INTEGRATIONS_HOST] }}
                initialInput={initialInput}
                initialOutput={initialOutput}
                render={renderIntegrationUi}
            >
                <ContentKitOutput output={initialOutput} context={contentKitServerContext} />
            </ContentKit>
        </div>
    );
}
