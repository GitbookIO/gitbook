import IconStar from '@geist-ui/icons/star';
import { ContentRef, DocumentBlockTable } from '@gitbook/api';
import assertNever from 'assert-never';

import { Checkbox, Link } from '@/components/primitives';
import { getNodeFragmentByName } from '@/lib/document';
import { tcls } from '@/lib/tailwind';
import { filterOutNullable } from '@/lib/typescript';

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
        case 'checkbox':
            return (
                <Checkbox
                    className={tcls('w-5', 'h-5')}
                    checked={value as boolean}
                    disabled={true}
                />
            );
        case 'rating':
            const rating = value as number;

            return (
                <Tag className={tcls('text-primary')}>
                    {value ? (
                        <span
                            role="meter"
                            aria-label={definition.title ?? ''}
                            aria-valuenow={rating}
                            aria-valuemin={1}
                            aria-valuemax={definition.max}
                            className={tcls('inline-flex', 'gap-1')}
                        >
                            {Array.from({ length: rating }).map((_, i) => (
                                <IconStar key={i} className={tcls('size-4')} />
                            ))}
                        </span>
                    ) : null}
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
                    style={['w-full', 'space-y-2', 'lg:space-y-3', 'leading-normal']}
                    context={context}
                    blockStyle={['w-full', 'max-w-[unset]']}
                />
            );
        case 'files':
            const files = await Promise.all(
                (value as string[]).map((fileId) =>
                    context.resolveContentRef({
                        kind: 'file',
                        file: fileId,
                    }),
                ),
            );

            return (
                <Tag className={tcls('text-base')}>
                    {files.filter(filterOutNullable).map((file, index) => (
                        <Link key={index} href={file.href}>
                            {file.text}
                        </Link>
                    ))}
                </Tag>
            );
        case 'content-ref': {
            const resolved = value ? await context.resolveContentRef(value as ContentRef) : null;
            return (
                <Tag className={tcls('text-base')}>
                    {resolved ? <Link href={resolved.href}>{resolved.text}</Link> : null}
                </Tag>
            );
        }
        case 'users': {
            const resolved = await Promise.all(
                (value as string[]).map((userId) =>
                    context.resolveContentRef({
                        kind: 'user',
                        user: userId,
                    }),
                ),
            );

            return (
                <Tag className={tcls('text-base')}>
                    {resolved.filter(filterOutNullable).map((file, index) => (
                        <Link key={index} href={file.href}>
                            {file.text}
                        </Link>
                    ))}
                </Tag>
            );
        }
        case 'select': {
            return (
                <Tag className={tcls()}>
                    <span className={tcls('inline-flex', 'gap-2')}>
                        {(value as string[]).map((selectId) => {
                            const option = definition.options.find(
                                (option) => option.value === selectId,
                            );

                            if (!option) {
                                return null;
                            }

                            return (
                                <span
                                    key={option.value}
                                    className={tcls(
                                        'text-sm',
                                        'rounded',
                                        'py-1',
                                        'px-2',
                                        'bg-primary-100',
                                        'text-primary-800',
                                    )}
                                >
                                    {option.label}
                                </span>
                            );
                        })}
                    </span>
                </Tag>
            );
        }
        default:
            assertNever(definition);
    }
}
