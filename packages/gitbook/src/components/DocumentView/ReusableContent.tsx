import type { DocumentBlockReusableContent } from '@gitbook/api';

import { getDataOrNull } from '@/lib/data';
import { resolveContentRefInDocument } from '@/lib/references';
import type { BlockProps } from './Block';
import { UnwrappedBlocks } from './Blocks';

// TODO-DEREF: Remove this once we have rolled out the new reusable content deref in the API.
export async function ReusableContent(props: BlockProps<DocumentBlockReusableContent>) {
    const { document, block, context, ancestorBlocks } = props;

    console.error('Reusable content should be handled at the API level, this should not be called');

    if (!context.contentContext) {
        throw new Error('Expected a content context to render a reusable content block');
    }

    const dataFetcher = block.meta?.token
        ? context.contentContext.dataFetcher.withToken({ apiToken: block.meta.token })
        : context.contentContext.dataFetcher;

    const resolved = await resolveContentRefInDocument(document, block.data.ref, {
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

    const reusableContentDocument = await getDataOrNull(
        dataFetcher.getRevisionReusableContentDocument({
            spaceId: reusableContent.context.space.id,
            revisionId: reusableContent.context.revisionId,
            reusableContentId: reusableContent.revisionReusableContent.id,
        })
    );

    if (!reusableContentDocument) {
        return null;
    }

    return (
        <UnwrappedBlocks
            nodes={reusableContentDocument.nodes}
            document={reusableContentDocument}
            ancestorBlocks={[...ancestorBlocks, block]}
            context={{
                ...context,
                contentContext: reusableContent.context,
            }}
        />
    );
}
