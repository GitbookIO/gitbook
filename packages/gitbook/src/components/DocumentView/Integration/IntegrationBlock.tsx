import { tcls } from '@/lib/tailwind';
import type { DocumentBlockIntegration, RenderIntegrationUI } from '@gitbook/api';
import { ContentKit, ContentKitOutput } from '@gitbook/react-contentkit';
import { GITBOOK_INTEGRATIONS_HOST } from '@v2/lib/env';

import type { BlockProps } from '../Block';
import './contentkit.css';
import { getDataOrNull } from '@v2/lib/data';
import { contentKitServerContext } from './contentkit';
import { renderIntegrationUi } from './server-actions';

export async function IntegrationBlock(props: BlockProps<DocumentBlockIntegration>) {
    const { block, context, style } = props;

    if (!context.contentContext?.space) {
        throw new Error('integration block requires a content.spaceId');
    }

    const { dataFetcher } = context.contentContext;

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

    const initialOutput = await getDataOrNull(
        dataFetcher.renderIntegrationUi({
            integrationName: block.data.integration,
            request: initialInput,
        }),

        // The API can respond with a 400 error if the integration is not installed
        // and 404 if the integration is not found.
        [404, 400]
    );
    if (!initialOutput || initialOutput.type === 'complete') {
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
