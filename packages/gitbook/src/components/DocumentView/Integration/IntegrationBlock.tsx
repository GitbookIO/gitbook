import { ContentKitContext, DocumentBlockIntegration } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import { ContentKit, ContentKitOutput, ContentKitServerContext } from '@gitbook/react-contentkit';

import { ignoreAPIError, renderIntegrationUi } from '@/lib/api';
import { INTEGRATIONS_HOST } from '@/lib/csp';
import { parseMarkdown } from '@/lib/markdown';
import { tcls } from '@/lib/tailwind';

import type { BlockProps } from '../Block';
import './contentkit.css';
import { PlainCodeBlock } from '../CodeBlock';

const outputContext: ContentKitServerContext = {
    icons: {
        maximize: (props) => <Icon icon="maximize" {...props} />,
        edit: (props) => <Icon icon="edit" {...props} />,
        github: (props) => <Icon icon="github" {...props} />,
        gitlab: (props) => <Icon icon="gitlab" {...props} />,
        close: (props) => <Icon icon="x" {...props} />,
        email: (props) => <Icon icon="envelope" {...props} />,
        settings: (props) => <Icon icon="gear" {...props} />,
        search: (props) => <Icon icon="magnifying-glass" {...props} />,
        delete: (props) => <Icon icon="trash" {...props} />,
        star: (props) => <Icon icon="star" {...props} />,
        warning: (props) => <Icon icon="triangle-exclamation" {...props} />,
        link: (props) => <Icon icon="link" {...props} />,
        'link-external': (props) => <Icon icon="arrow-up-right-from-square" {...props} />,
        eye: (props) => <Icon icon="eye" {...props} />,
        lock: (props) => <Icon icon="lock" {...props} />,
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
    if (!initialOutput || initialOutput.type === 'complete') {
        return null;
    }

    return (
        <div className={tcls(style)}>
            <ContentKit
                security={{ firstPartyDomains: [INTEGRATIONS_HOST] }}
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
