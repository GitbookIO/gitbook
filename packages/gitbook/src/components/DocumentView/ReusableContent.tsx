import type { DocumentBlockReusableContent } from '@gitbook/api';

import { resolveContentRef } from '@/lib/references';

import type { GitBookSpaceContext } from '@v2/lib/context';
import { getDataOrNull } from '@v2/lib/data';
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

    if (!resolved?.reusableContent) {
        return null;
    }

    const reusableContent = resolved.reusableContent.revisionReusableContent;
    if (!reusableContent.document) {
        return null;
    }

    const document = await getDataOrNull(
        dataFetcher.getDocument({
            spaceId: resolved.reusableContent.space.id,
            documentId: reusableContent.document,
        })
    );

    if (!document) {
        return null;
    }

    const reusableContentContext: GitBookSpaceContext = {
        ...context.contentContext,
        dataFetcher,
        space: resolved.reusableContent.space,
        revisionId: resolved.reusableContent.revision,
        pages: [],
        shareKey: undefined,
    };

    return (
        <UnwrappedBlocks
            nodes={document.nodes}
            document={document}
            ancestorBlocks={[...ancestorBlocks, block]}
            context={{
                ...context,
                contentContext: reusableContentContext,
            }}
        />
    );
}
