import type { DocumentBlockReusableContent } from '@gitbook/api';

import { createLinkerForSpace, resolveContentRef } from '@/lib/references';

import type { GitBookSpaceContext } from '@/lib/context';
import { getDataOrNull } from '@/lib/data';
import { assert } from 'ts-essentials';
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
    if (!reusableContent || !reusableContent.revisionReusableContent.document) {
        return null;
    }

    const document = await getDataOrNull(
        dataFetcher.getDocument({
            spaceId: reusableContent.space.id,
            documentId: reusableContent.revisionReusableContent.document,
        })
    );

    if (!document) {
        return null;
    }

    // Create a new context for reusable content block, including
    // the data fetcher with the token from the block meta and the correct
    // space and revision pointers.
    const reusableContentContext: GitBookSpaceContext | null = await (async () => {
        assert(context.contentContext);

        // References inside reusable content in the same space resolve the same as any other reference.
        if (context.contentContext.space.id === reusableContent.space.id) {
            return context.contentContext;
        }

        // References inside reusable content from a different space need to resolve in the parent space.
        // Create a linker that ensures links are resolved with the correct parent, and are kept absolute.
        const ctx = await createLinkerForSpace(reusableContent.space.id, context.contentContext);

        if (!ctx) {
            // TODO: we should never have to reach this point - it means we couldn't resolve the space context for the reusable content
            // but that should never happen as we've already fetched it at this point.
            // Rather than throw, resolving using app URLs if needed.
            return null;
        }

        return {
            ...context.contentContext,
            ...ctx.spaceContext,
            dataFetcher,
            linker: ctx.linker,
            revision: reusableContent.revision,
            shareKey: undefined,
        };
    })();

    if (!reusableContentContext) {
        return null;
    }

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
