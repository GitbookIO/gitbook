import { DocumentBlockReusableContent } from '@gitbook/api';

import { getReusableContentDocument } from '@/lib/api';

import { BlockProps } from './Block';
import { UnwrappedBlocks } from './Blocks';

export async function ReusableContent(props: BlockProps<DocumentBlockReusableContent>) {
    const { block, context, ancestorBlocks } = props;

    if (!context.content) {
        return null;
    }

    const document = await getReusableContentDocument(
        context.content.spaceId,
        context.content.revisionId,
        block.data.ref.reusableContent,
    );

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
