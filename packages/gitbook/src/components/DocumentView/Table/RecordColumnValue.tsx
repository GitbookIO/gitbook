import {
    type ContentRef,
    type ContentRefUser,
    type DocumentBlockTable,
    SiteInsightsLinkPosition,
} from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import assertNever from 'assert-never';

import { Checkbox } from '@/components/primitives';
import { StyledLink } from '@/components/primitives';
import { Image } from '@/components/utils';
import { getNodeFragmentByName } from '@/lib/document';
import { getSimplifiedContentType } from '@/lib/files';
import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';
import { filterOutNullable } from '@/lib/typescript';

import type { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { FileIcon } from '../FileIcon';
import type { TableRecordKV } from './Table';
import { type VerticalAlignment, getColumnAlignment } from './utils';

/**
 * Render the value for a column in a record.
 */
export async function RecordColumnValue<Tag extends React.ElementType = 'div'>(
    props: BlockProps<DocumentBlockTable> & {
        tag?: Tag;
        ariaLabelledBy?: string;
        record: TableRecordKV;
        column: string;
        verticalAlignment?: VerticalAlignment;
    }
) {
    const {
        tag: Tag = 'div',
        ariaLabelledBy,
        block,
        document,
        record,
        column,
        context,
        verticalAlignment = 'center',
    } = props;

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
                    aria-labelledby={ariaLabelledBy}
                />
            );
        case 'rating': {
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
                                        className={tcls('size-[15px]', 'text-primary/5')}
                                    />
                                ))}
                            </span>
                            <span
                                role="meter"
                                aria-label={ariaLabelledBy ? undefined : (definition.title ?? '')}
                                aria-labelledby={ariaLabelledBy}
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
        }
        case 'number':
            return (
                <Tag
                    className={tcls('text-base', 'tabular-nums', 'tracking-tighter')}
                    aria-labelledby={ariaLabelledBy}
                >{`${value}`}</Tag>
            );
        case 'text': {
            // @ts-ignore
            const fragment = getNodeFragmentByName(block, value);
            if (!fragment) {
                return <Tag className={tcls(['w-full', verticalAlignment])}>{''}</Tag>;
            }

            const alignment = getColumnAlignment(definition);

            return (
                <Blocks
                    tag={Tag}
                    document={document}
                    ancestorBlocks={[]}
                    nodes={fragment.nodes}
                    style={[
                        'blocks',
                        'w-full',
                        'space-y-2',
                        'lg:space-y-3',
                        'leading-normal',
                        verticalAlignment,
                        alignment === 'right' ? 'text-right' : null,
                        alignment === 'center' ? 'text-center' : null,
                    ]}
                    context={context}
                    blockStyle={['w-full', 'max-w-[unset]']}
                    wrapperProps={{
                        'aria-labelledby': ariaLabelledBy,
                    }}
                />
            );
        }
        case 'files': {
            const files = await Promise.all(
                (value as string[]).map((fileId) =>
                    context.contentContext
                        ? resolveContentRef(
                              {
                                  kind: 'file',
                                  file: fileId,
                              },
                              context.contentContext
                          )
                        : null
                )
            );

            return (
                <Tag className={tcls('text-base')} aria-labelledby={ariaLabelledBy}>
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
                                insights={
                                    ref.file
                                        ? {
                                              type: 'link_click',
                                              link: {
                                                  target: {
                                                      kind: 'file',
                                                      file: ref.file.id,
                                                  },
                                                  position: SiteInsightsLinkPosition.Content,
                                              },
                                          }
                                        : undefined
                                }
                            >
                                {contentType === 'image' ? (
                                    <Image
                                        style={['max-h-[1lh]', 'h-[1lh]']}
                                        alt={ref.text}
                                        sizes={[{ width: 24 }]}
                                        resize={context.contentContext?.imageResizer}
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
        }
        case 'content-ref': {
            const contentRef = value ? (value as ContentRef) : null;
            const resolved =
                contentRef && context.contentContext
                    ? await resolveContentRef(contentRef, context.contentContext, {
                          resolveAnchorText: true,
                          iconStyle: ['mr-2', 'text-tint-subtle'],
                      })
                    : null;
            return (
                <Tag
                    className={tcls('text-base', 'text-balance', 'flex', 'items-center')}
                    aria-labelledby={ariaLabelledBy}
                >
                    {resolved?.icon ?? null}
                    {resolved ? (
                        <StyledLink
                            href={resolved.href}
                            insights={
                                contentRef
                                    ? {
                                          type: 'link_click',
                                          link: {
                                              target: contentRef,
                                              position: SiteInsightsLinkPosition.Content,
                                          },
                                      }
                                    : undefined
                            }
                        >
                            {resolved.text}
                        </StyledLink>
                    ) : null}
                </Tag>
            );
        }
        case 'users': {
            const resolved = await Promise.all(
                (value as string[]).map(async (userId) => {
                    const contentRef: ContentRefUser = {
                        kind: 'user',
                        user: userId,
                    };
                    const resolved = context.contentContext
                        ? await resolveContentRef(contentRef, context.contentContext)
                        : null;
                    if (!resolved) {
                        return null;
                    }

                    return [contentRef, resolved] as const;
                })
            );

            return (
                <Tag className={tcls('text-base')} aria-labelledby={ariaLabelledBy}>
                    {resolved.filter(filterOutNullable).map(([contentRef, resolved], index) => (
                        <StyledLink
                            key={index}
                            href={resolved.href}
                            insights={{
                                type: 'link_click',
                                link: {
                                    target: contentRef,
                                    position: SiteInsightsLinkPosition.Content,
                                },
                            }}
                        >
                            {resolved.text}
                        </StyledLink>
                    ))}
                </Tag>
            );
        }
        case 'select': {
            return (
                <Tag aria-labelledby={ariaLabelledBy}>
                    <span className={tcls('inline-flex', 'gap-2', 'flex-wrap')}>
                        {(value as string[]).map((selectId) => {
                            const option = definition.options.find(
                                (option) => option.value === selectId
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
                                        'bg-primary',
                                        'text-primary-strong'
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
