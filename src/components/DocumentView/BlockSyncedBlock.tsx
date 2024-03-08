import { DocumentBlockSyncedBlock } from '@gitbook/api';

import { getSyncedBlock } from '@/lib/api';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export async function BlockSyncedBlock(props: BlockProps<DocumentBlockSyncedBlock>) {
    const { block, ancestorBlocks, context, style } = props;

    const apiToken = block.meta?.apiToken;
    if (!apiToken) {
        return null;
    }

    const result = await getSyncedBlock(
        apiToken,
        block.data.ref.organization,
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
