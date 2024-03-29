import { DocumentBlockSyncedBlock } from '@gitbook/api';

import { getSyncedBlockContent } from '@/lib/api';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export async function BlockSyncedBlock(props: BlockProps<DocumentBlockSyncedBlock>) {
    const { block, ancestorBlocks, context, style } = props;

    const apiToken = block.meta?.apiToken;
    if (!apiToken) {
        return null;
    }

    // We can't resolve th synced block without an organization context.
    if (!context.contentRefContext) {
        return null;
    }

    const result = await getSyncedBlockContent(
        apiToken,
        context.contentRefContext.space.organization,
        block.data.ref.syncedBlock,
    );

    if (!result) {
        return null;
    }

    return (
        <Blocks
            nodes={result.document.nodes}
            document={result.document}
            ancestorBlocks={[...ancestorBlocks, block]}
            context={context}
            style={style}
        />
    );
}
