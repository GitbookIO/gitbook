import { DocumentBlockReusableContent } from '@gitbook/api';

import { getDocument } from '@/lib/api';

import { BlockProps } from './Block';
import { UnwrappedBlocks } from './Blocks';

export async function ReusableContent(props: BlockProps<DocumentBlockReusableContent>) {
    const { block, context, ancestorBlocks } = props;

    if (!context.content) {
        throw new Error(`Expected a content context to render a reusable content block`);
    }

    const resolved = await context.resolveContentRef(block.data.ref);
    if (!resolved?.reusableContent?.document) {
        return null;
    }

    const document = await getDocument(context.content.spaceId, resolved.reusableContent.document);

    if (!document) {
        return null;
    }

    return (
        <UnwrappedBlocks
            nodes={document.nodes}
            document={document}
            ancestorBlocks={[...ancestorBlocks, block]}
            context={context}
        />
    );
}
