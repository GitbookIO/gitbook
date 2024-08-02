import { ContentRef, DocumentBlockTable } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import assertNever from 'assert-never';

import { Checkbox, Emoji } from '@/components/primitives';
import { StyledLink } from '@/components/primitives';
import { Image } from '@/components/utils';
import { getNodeFragmentByName } from '@/lib/document';
import { getSimplifiedContentType } from '@/lib/files';
import { tcls } from '@/lib/tailwind';
import { filterOutNullable } from '@/lib/typescript';

import { TableRecordKV } from './Table';
import { getColumnAlignment } from './utils';
import { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { FileIcon } from '../FileIcon';

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
            const max = definition.max;

            return (
                <Tag className={tcls('inline-grid')}>
                    {value ? (
                        <>
                            <span className={tcls('inline-flex', 'grid-area-1-1', 'gap-0.5')}>
                                {Array.from({ length: max }).map((_, i) => (
                                    <Icon
                                        key={i}
                                        icon="star"
                                        className={tcls(
                                            'size-[15px]',
                                            'text-primary-700/5',
                                            'dark:text-primary-300/5',
                                        )}
                                    />
                                ))}
                            </span>
                            <span
                                role="meter"
                                aria-label={definition.title ?? ''}
                                aria-valuenow={rating}
                                aria-valuemin={1}
                                aria-valuemax={definition.max}
                                className={tcls('inline-flex', 'grid-area-1-1', 'gap-0.5')}
                            >
                                {Array.from({ length: rating }).map((_, i) => (
                                    <Icon
                                        key={i}
                                        icon="star"
                                        className={tcls('size-[15px]', 'text-primary')}
                                    />
                                ))}
                            </span>
                        </>
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

            const alignment = getColumnAlignment(definition);

            return (
                <Blocks
                    tag={Tag}
                    document={document}
                    ancestorBlocks={[]}
                    nodes={fragment.nodes}
                    style={[
                        'w-full',
                        'space-y-2',
                        'lg:space-y-3',
                        'leading-normal',
                        alignment === 'right' ? 'text-right' : null,
                        alignment === 'center' ? 'text-center' : null,
                    ]}
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
                    {files.filter(filterOutNullable).map((ref, index) => {
                        const contentType = ref.file
                            ? getSimplifiedContentType(ref.file.contentType)
                            : null;

                        return (
                            <StyledLink
                                key={index}
                                href={ref.href}
                                target="_blank"
                                style={['flex', 'flex-row', 'items-center', 'gap-2']}
                            >
                                {contentType === 'image' ? (
                                    <Image
                                        style={['max-h-[1lh]', 'h-[1lh]']}
                                        alt={ref.text}
                                        sizes={[{ width: 24 }]}
                                        sources={{
                                            light: {
                                                src: ref.href,
                                                size: {
                                                    width: 24,
                                                    height: 24,
                                                },
                                            },
                                        }}
                                        priority="lazy"
                                    />
                                ) : (
                                    <FileIcon
                                        contentType={contentType}
                                        className={tcls('size-4')}
                                    />
                                )}
                                {ref.text}
                            </StyledLink>
                        );
                    })}
                </Tag>
            );
        case 'content-ref': {
            const resolved = value
                ? await context.resolveContentRef(value as ContentRef, {
                      resolveAnchorText: true,
                  })
                : null;
            return (
                <Tag className={tcls('text-base', 'text-balance')}>
                    {resolved && resolved.emoji ? (
                        <Emoji code={resolved.emoji} style={['mr-2']} />
                    ) : null}
                    {resolved ? (
                        <StyledLink href={resolved.href}>{resolved.text}</StyledLink>
                    ) : null}
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
                        <StyledLink key={index} href={file.href}>
                            {file.text}
                        </StyledLink>
                    ))}
                </Tag>
            );
        }
        case 'select': {
            return (
                <Tag className={tcls()}>
                    <span className={tcls('inline-flex', 'gap-2', 'flex-wrap')}>
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
                                        'whitespace-pre',
                                        'rounded',
                                        'py-1',
                                        'px-2',
                                        'bg-primary-300/4',
                                        'text-primary-800',
                                        'dark:bg-primary-400/3',
                                        'dark:text-primary-200',
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
