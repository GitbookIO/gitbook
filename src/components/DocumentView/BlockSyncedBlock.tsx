import { DocumentBlockSyncedBlock } from '@gitbook/api';

import { getSyncedBlock } from '@/lib/api';
import { resolveContentRefWithFiles } from '@/lib/references';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export async function BlockSyncedBlock(props: BlockProps<DocumentBlockSyncedBlock>) {
    const { block, ancestorBlocks, context, style } = props;

    const apiToken = block.meta?.apiToken;
    if (!apiToken) {
        return null;
    }

    const syncedBlock = await getSyncedBlock(
        apiToken,
        block.data.ref.organization,
        block.data.ref.syncedBlock,
    );

    if (!syncedBlock) {
        return null;
    }

    return (
        <Blocks
            nodes={syncedBlock.document.nodes}
            document={syncedBlock.document}
            ancestorBlocks={[...ancestorBlocks, block]}
            context={{
                ...context,
                resolveContentRef: async (ref, options) => {
                    if (!syncedBlock?.files) {
                        return context.resolveContentRef(ref, options);
                    }
                    const result = resolveContentRefWithFiles(syncedBlock.files, ref);
                    if (result !== undefined) {
                        return result;
                    }
                    return context.resolveContentRef(ref, options);
                },
            }}
            style={style}
        />
    );
}
