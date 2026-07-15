import { GITBOOK_INTEGRATIONS_CONTENT_HOST, GITBOOK_INTEGRATIONS_HOST } from '@/lib/env';
import { tcls } from '@/lib/tailwind';
import type { DocumentBlockIntegration, RenderIntegrationUI } from '@gitbook/api';
import { ContentKit, ContentKitOutput } from '@gitbook/react-contentkit';

import type { BlockProps } from '../Block';
import './contentkit.css';
import type { GitBookLinker } from '@/lib/links';
import {
    ContentKitWithClientContext,
    type WebframeLinkerData,
} from './ContentKitWithClientContext';
import { integrationBlockContainsWebframe } from './adaptive';
import { contentKitServerContext } from './contentkit';
import { fetchSafeIntegrationUI } from './render';
import { renderIntegrationUi } from './server-actions';

export async function IntegrationBlock(props: BlockProps<DocumentBlockIntegration>) {
    const { block, context, style } = props;

    if (!context.contentContext) {
        throw new Error('Expected a content context to render an block');
    }

    if (!context.contentContext.space && !block.meta?.spaceId) {
        throw new Error('integration block requires a spaceId from the context or API');
    }

    const initialInput: RenderIntegrationUI = {
        componentId: block.data.block,
        props: block.data.props,
        action: block.data.action,
        context: {
            type: 'document',
            // When the block originates from a cross-space reusable content, the server adds a spaceId so the integration is
            // looked up in the correct source space.
            spaceId: block.meta?.spaceId ?? context.contentContext.space.id,
            editable: false,
            theme: 'light', // TODO: how to handle this without moving rendering to the client side?
        },
    };

    const dataFetcher = block.meta?.token
        ? context.contentContext.dataFetcher.withToken({ apiToken: block.meta.token })
        : context.contentContext.dataFetcher;

    const initialResponse = await fetchSafeIntegrationUI(
        {
            ...context.contentContext,
            dataFetcher,
        },
        {
            integrationName: block.data.integration,
            request: initialInput,
        }
    );

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

    const containsWebframe = integrationBlockContainsWebframe(initialOutput);
    const canAccessVisitorClaims = initialOutput.canAccessVisitorClaims === true;

    // Any webframe uses the client-context wrapper: it enables navigation to other pages, plus
    // visitor claims when the integration is allowed them.
    const useClientContext = containsWebframe;

    const contentKitProps = {
        renderContext: {
            integrationName: block.data.integration,
        },
        security: {
            // Trust both the integrations host and the (cookieless) content host that
            // serves rendered WebFrames. `ElementWebframe` gates inbound and outbound
            // postMessage on this list, so a WebFrame served from the content host would
            // break (no resize/ready/actions) if the content host weren't trusted.
            // The hosts are identical until a distinct content origin is configured.
            firstPartyDomains: [
                ...new Set([GITBOOK_INTEGRATIONS_HOST, GITBOOK_INTEGRATIONS_CONTENT_HOST]),
            ],
        },
        initialInput,
        initialOutput,
        render: renderIntegrationUi,
    };

    return (
        <div className={tcls(style)}>
            {useClientContext ? (
                <ContentKitWithClientContext
                    {...contentKitProps}
                    canAccessVisitorClaims={canAccessVisitorClaims}
                    linkerData={getWebframeLinkerData(context.contentContext.linker)}
                >
                    <ContentKitOutput output={initialOutput} context={contentKitServerContext} />
                </ContentKitWithClientContext>
            ) : (
                <ContentKit {...contentKitProps}>
                    <ContentKitOutput output={initialOutput} context={contentKitServerContext} />
                </ContentKit>
            )}
        </div>
    );
}

/**
 * Extract the serializable data needed to rebuild the site linker on the client, so webframe
 * navigation resolves paths through the same (tested) linker as the rest of the app.
 */
function getWebframeLinkerData(linker: GitBookLinker): WebframeLinkerData {
    const data: WebframeLinkerData = {
        siteBasePath: linker.siteBasePath,
        spaceBasePath: linker.spaceBasePath,
    };

    // `host`/`protocol` are only used to build absolute URLs, which webframe navigation never does.
    // Carry them along when available so the rebuilt linker is complete (and avoids a dev warning).
    try {
        const url = new URL(linker.toAbsoluteURL('/'));
        data.host = url.host;
        data.protocol = url.protocol;
    } catch {
        // No usable host (e.g. tests): the linker still resolves in-site paths without it.
    }

    return data;
}
