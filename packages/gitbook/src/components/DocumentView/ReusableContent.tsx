import type { DocumentBlockReusableContent } from '@gitbook/api';

import { getDataOrNull } from '@/lib/data';
import { resolveContentRef } from '@/lib/references';
import type { BlockProps } from './Block';
import { UnwrappedBlocks } from './Blocks';

export async function ReusableContent(props: BlockProps<DocumentBlockReusableContent>) {
    const { block, context, ancestorBlocks } = props;

    if (!context.contentContext) {
        throw new Error('Expected a content context to render a reusable content block');
    }

    const dataFetcher = block.meta?.token
        ? context.contentContext.dataFetcher.withToken({ apiToken: block.meta.token })
        : context.contentContext.dataFetcher;

    const resolved = await resolveContentRef(block.data.ref, {
        ...context.contentContext,
        dataFetcher,
    });

    if (!resolved) {
        return null;
    }

    const { reusableContent } = resolved;
    if (!reusableContent) {
        return null;
    }

    const document = await getDataOrNull(
        dataFetcher.getRevisionReusableContentDocument({
            spaceId: reusableContent.context.space.id,
            revisionId: reusableContent.context.revisionId,
            reusableContentId: reusableContent.revisionReusableContent.id,
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
            context={{
                ...context,
                contentContext: reusableContent.context,
            }}
        />
    );
}
