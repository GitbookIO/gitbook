import {
    type ContentRef,
    type ContentRefUser,
    type DocumentBlockTable,
    SiteInsightsLinkPosition,
} from '@gitbook/api';
import { Icon, IconStyle } from '@gitbook/icons';
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
import {
    type VerticalAlignment,
    getColumnAlignment,
    isContentRef,
    isDocumentTableImageRecord,
    isStringArray,
} from './utils';

const alignmentMap: Record<'text-left' | 'text-center' | 'text-right', string> = {
    'text-left': '**:text-left text-left',
    'text-center': '**:text-center text-center',
    'text-right': '**:text-right text-right',
};

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

    // Because definition and value depends on column, we have to check typing in each case at runtime.
    // Validation should have been done at the API level, but we can't know typing based on `definition.type`.
    // OpenAPI types cannot really handle discriminated unions based on a dynamic key.
    switch (definition.type) {
        case 'checkbox': {
            if (value === null || typeof value !== 'boolean') {
                return null;
            }
            return (
                <Checkbox
                    className={tcls('w-5', 'h-5')}
                    checked={value}
                    disabled={true}
                    aria-labelledby={ariaLabelledBy}
                />
            );
        }
        case 'rating': {
            if (typeof value !== 'number') {
                return null;
            }
            const rating = value;
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
                                        iconStyle={IconStyle.SharpSolid}
                                        className={tcls('size-[15px]', 'text-primary')}
                                    />
                                ))}
                            </span>
                        </>
                    ) : null}
                </Tag>
            );
        }
        case 'number': {
            if (typeof value !== 'number') {
                return null;
            }
            return (
                <Tag
                    className={tcls('text-base', 'tabular-nums', 'tracking-tighter')}
                    aria-labelledby={ariaLabelledBy}
                >{`${value}`}</Tag>
            );
        }
        case 'text': {
            if (typeof value !== 'string') {
                return null;
            }
            const fragment = getNodeFragmentByName(block, value);
            if (!fragment) {
                return <Tag className={tcls(['w-full', verticalAlignment])}>{''}</Tag>;
            }

            const horizontalAlignment = getColumnAlignment(definition);
            const horizontalClasses = alignmentMap[horizontalAlignment];

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
                        horizontalClasses,
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
            if (!isStringArray(value)) {
                return null;
            }
            const files = await Promise.all(
                value.map((fileId) =>
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
                                className="flex flex-row items-center gap-2"
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
                                        style={['max-h-lh', 'h-lh']}
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
            if (value === null || !isContentRef(value)) {
                return null;
            }
            const resolved =
                value && context.contentContext
                    ? await resolveContentRef(value, context.contentContext, {
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
                                value
                                    ? {
                                          type: 'link_click',
                                          link: {
                                              target: value,
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
            if (!isStringArray(value)) {
                return null;
            }
            const resolved = await Promise.all(
                value.map(async (userId) => {
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
            if (!isStringArray(value)) {
                return null;
            }
            return (
                <Tag aria-labelledby={ariaLabelledBy}>
                    <span className={tcls('inline-flex', 'gap-2', 'flex-wrap')}>
                        {value.map((selectId) => {
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
                                        'rounded-sm',
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
        case 'image': {
            if (!isDocumentTableImageRecord(value)) {
                return null;
            }

            const image = context.contentContext
                ? await resolveContentRef(
                      'ref' in value ? value.ref : value,
                      context.contentContext
                  )
                : null;

            if (!image) {
                return null;
            }

            return (
                <Tag className={tcls('text-base')} aria-labelledby={ariaLabelledBy}>
                    <StyledLink
                        href={image.href}
                        className="flex flex-row items-center gap-2"
                        insights={
                            image.file
                                ? {
                                      type: 'link_click',
                                      link: {
                                          target: value as ContentRef,
                                          position: SiteInsightsLinkPosition.Content,
                                      },
                                  }
                                : undefined
                        }
                    >
                        <Image
                            style={['max-h-lh', 'h-lh']}
                            alt={image.text}
                            sizes={[{ width: 24 }]}
                            resize={context.contentContext?.imageResizer}
                            sources={{
                                light: {
                                    src: image.href,
                                    size: image.file?.dimensions,
                                },
                            }}
                            priority="lazy"
                        />
                        {image.text}
                    </StyledLink>
                </Tag>
            );
        }
        default:
            assertNever(definition);
    }
}
