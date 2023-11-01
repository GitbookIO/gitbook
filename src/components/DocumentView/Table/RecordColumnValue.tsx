import { DocumentBlockTable, DocumentTableViewCards } from '@gitbook/api';
import { TableRecordKV, TableViewProps } from './Table';
import { BlockProps } from '../Block';
import { ClassValue, tcls } from '@/lib/tailwind';
import { getNodeFragmentByName } from '@/lib/document';
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
            return (
                <Blocks
                    tag={Tag}
                    ancestorBlocks={[]}
                    nodes={fragment.nodes}
                    style={[columnStyle, 'w-full']}
                    context={context}
                    blockStyle={['w-full', 'mt-3']}
                />
            );
        default:
            return null;
    }
}
