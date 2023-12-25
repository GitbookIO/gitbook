import { DocumentBlockTable } from '@gitbook/api';

import { Checkbox } from '@/components/primitives';
import { getNodeFragmentByName } from '@/lib/document';
import { tcls } from '@/lib/tailwind';

import { TableRecordKV } from './Table';
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
    },
) {
    const { tag: Tag = 'div', block, document, record, column, context } = props;

    const definition = block.data.definition[column];
    const value = record[1].values[column];

    if (!definition) {
        return null;
    }

    switch (definition.type) {
        /*         case 'content-ref':
            // @ts-ignore
            const target = await resolveContentRef(value, context);
            if (!target) {
                return <Tag className={tcls(['w-full'])}>{''}</Tag>;
            }
            return (
                <Link
                    className={tcls(
                        'whitespace-nowrap',
                        'text-sm',
                        'text-primary-400',
                        'hover:text-primary-500',
                    )}
                    href={target.href}
                >
                    {target.text}
                </Link>
            ); */
        case 'checkbox':
            return (
                <Checkbox
                    className={tcls('w-5', 'h-5')}
                    checked={value as boolean}
                    disabled={true}
                />
            );
        case 'rating':
            return (
                <Tag className={tcls('text-base', 'tabular-nums', 'tracking-tighter')}>
                    {`${value}`}
                </Tag>
            );
        case 'number':
            return (
                <Tag
                    className={tcls('text-base', 'tabular-nums', 'tracking-tighter')}
                >{`${value}`}</Tag>
            );
        case 'text':
            // @ts-ignore
            const fragment = getNodeFragmentByName(block, value);
            if (!fragment) {
                return <Tag className={tcls(['w-full'])}>{''}</Tag>;
            }

            return (
                <Blocks
                    tag={Tag}
                    document={document}
                    ancestorBlocks={[]}
                    nodes={fragment.nodes}
                    style={['w-full', 'space-y-2', 'lg:space-y-3']}
                    context={context}
                    blockStyle={['w-full', 'max-w-[unset]']}
                />
            );
        default:
            return null;
    }
}
