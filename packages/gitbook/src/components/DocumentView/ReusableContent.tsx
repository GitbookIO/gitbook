import type { DocumentBlockReusableContent } from '@gitbook/api';

import { resolveContentRef } from '@/lib/references';

import { getDataOrNull } from '@v2/lib/data';
import type { BlockProps } from './Block';
import { UnwrappedBlocks } from './Blocks';

export async function ReusableContent(props: BlockProps<DocumentBlockReusableContent>) {
    const { block, context, ancestorBlocks } = props;

    if (!context.contentContext) {
        throw new Error('Expected a content context to render a reusable content block');
    }

    const resolved = await resolveContentRef(block.data.ref, context.contentContext);
    if (!resolved?.reusableContent?.document) {
        return null;
    }

    const document = await getDataOrNull(
        context.contentContext.dataFetcher.getDocument({
            spaceId: context.contentContext.space.id,
            documentId: resolved.reusableContent.document,
        })
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
