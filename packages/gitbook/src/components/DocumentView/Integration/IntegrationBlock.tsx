import {
    Edit,
    Github,
    Gitlab,
    Maximize,
    X,
    Mail,
    Settings,
    Search,
    Delete,
    Star,
    AlertTriangle,
    Link,
    Eye,
    Lock,
} from '@geist-ui/icons';
import { ContentKitContext, DocumentBlockIntegration } from '@gitbook/api';
import { ContentKit, ContentKitOutput, ContentKitServerContext } from '@gitbook/react-contentkit';

import { ignoreAPIError, renderIntegrationUi } from '@/lib/api';
import { parseMarkdown } from '@/lib/markdown';
import { tcls } from '@/lib/tailwind';


import type { BlockProps } from '../Block';
import './contentkit.css';
import { PlainCodeBlock } from '../CodeBlock';

const outputContext: ContentKitServerContext = {
    icons: {
        maximize: Maximize,
        edit: Edit,
        github: Github,
        gitlab: Gitlab,
        close: X,
        email: Mail,
        settings: Settings,
        search: Search,
        delete: Delete,
        star: Star,
        warning: AlertTriangle,
        link: Link,
        'link-external': Link,
        eye: Eye,
        lock: Lock,
    },
    codeBlock: (props) => {
        return <PlainCodeBlock code={props.code} syntax={props.syntax} />;
    },
    markdown: async ({ className, markdown }) => {
        const parsed = await parseMarkdown(markdown);
        return <div className={className} dangerouslySetInnerHTML={{ __html: parsed }} />;
    },
};

export async function IntegrationBlock(props: BlockProps<DocumentBlockIntegration>) {
    const { block, context, style } = props;

    if (!context.content?.spaceId) {
        throw new Error('integration block requires a content.spaceId');
    }

    const contentKitContext: ContentKitContext = {
        type: 'document',
        spaceId: context.content.spaceId,
        editable: false,
        theme: 'light', // TODO: how to handle this without moving rendering to the client side?
    };

    const initialInput = {
        componentId: block.data.block,
        props: block.data.props,
        action: block.data.action,
        context: contentKitContext,
    };

    const initialOutput = await ignoreAPIError(
        renderIntegrationUi(block.data.integration, initialInput),
        true,
    );
    if (!initialOutput) {
        return null;
    }

    return (
        <div className={tcls(style)}>
            <ContentKit
                security={{ firstPartyDomains: ['integrations.gitbook.com'] }}
                initialInput={initialInput}
                initialOutput={initialOutput}
                render={async (request) => {
                    'use server';

                    const output = await renderIntegrationUi(block.data.integration, request);

                    return {
                        children: <ContentKitOutput output={output} context={outputContext} />,
                        output: output,
                    };
                }}
            >
                <ContentKitOutput output={initialOutput} context={outputContext} />
            </ContentKit>
        </div>
    );
}
