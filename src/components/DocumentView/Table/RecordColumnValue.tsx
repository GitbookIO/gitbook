import { DocumentBlockTable, DocumentTableViewCards } from '@gitbook/api';

import { getNodeFragmentByName } from '@/lib/document';
import { ClassValue, tcls } from '@/lib/tailwind';

import { TableRecordKV, TableViewProps } from './Table';
import { BlockProps } from '../Block';
import { Blocks } from '../Blocks';

/**
 * Render the value for a column in a record.
 */
export async function RecordColumnValue<Tag extends React.ElementType = 'div'>(
    props: BlockProps<DocumentBlockTable> & {
        tag?: Tag;
        record: TableRecordKV;
        column: string;
        columnStyle?: ClassValue;
    },
) {
    const { tag: Tag = 'div', block, record, column, columnStyle, context } = props;

    const definition = block.data.definition[column];
    const value = record[1].values[column];

    if (!definition) {
        return null;
    }

    switch (definition.type) {
        case 'number':
            return <Tag className={tcls('text-base', columnStyle)}>{`${value}`}</Tag>;
        case 'text':
            // @ts-ignore
            const fragment = getNodeFragmentByName(block, value);
            if (!fragment) {
                return <Tag className={tcls([columnStyle, 'w-full'])}>{''}</Tag>;
            }

            return (
                <Blocks
                    tag={Tag}
                    ancestorBlocks={[]}
                    nodes={fragment.nodes}
                    style={[columnStyle, 'w-full', 'space-y-2', 'lg:space-y-3']}
                    context={context}
                    blockStyle={['w-full']}
                />
            );
        default:
            return null;
    }
}
