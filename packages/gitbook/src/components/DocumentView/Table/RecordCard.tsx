import {
    type ContentRef,
    type DocumentTableViewCards,
    type RevisionFile,
    SiteInsightsLinkPosition,
    type TableRecordValueImage,
} from '@gitbook/api';

import { LinkBox, LinkOverlay } from '@/components/primitives';
import { Image } from '@/components/utils';
import { type ResolvedContentRef, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import type { DocumentContext } from '@/components/DocumentView/DocumentView';
import { RecordColumnValue } from './RecordColumnValue';
import type { TableRecordKV, TableViewProps } from './Table';
import { RecordCardStyles } from './styles';
import { getRecordValue, isImageDefition } from './utils';

export async function RecordCard(
    props: TableViewProps<DocumentTableViewCards> & {
        record: TableRecordKV;
    }
) {
    const { view, record, context, block, isOffscreen } = props;

    const coverRef = view.coverDefinition
        ? getRecordValue<string[] | TableRecordValueImage>(record[1], view.coverDefinition)
        : null;
    const cover = coverRef
        ? await getRecordCover({
              value: coverRef,
              context,
          })
        : null;

    const targetRef = view.targetDefinition
        ? (record[1].values[view.targetDefinition] as ContentRef)
        : null;

    const target =
        targetRef && context.contentContext
            ? await resolveContentRef(targetRef, context.contentContext)
            : null;

    const coverIsSquareOrPortrait = cover ? getCoverIsSquareOrPortrait(cover) : null;

    const body = (
        <div
            className={tcls(
                'grid-area-1-1',
                'relative',
                'grid',
                'bg-tint-base',
                'w-full',
                'h-full',
                'inset-0',
                'rounded',
                'straight-corners:rounded-none',
                'circular-corners:rounded-xl',
                'overflow-hidden',
                '[&_.heading>div:first-child]:hidden',
                '[&_.heading>div]:text-[.8em]',
                'md:[&_.heading>div]:text-[1em]',
                '[&_.blocks:first-child_.heading]:pt-0', // Remove padding-top on first heading in card
                'min-h-10',

                // On mobile, check if we can display the cover responsively or not:
                // - If the file has a landscape aspect ratio, we display it normally
                // - If the file is square or portrait, we display it left with 40% of the card width
                // Only create rows when there are columns to display
                view.columns.length > 0
                    ? coverIsSquareOrPortrait
                        ? [
                              'grid-cols-[40%,_1fr]',
                              'min-[432px]:grid-cols-none',
                              'min-[432px]:grid-rows-[auto,1fr]',
                          ]
                        : 'grid-rows-[auto,1fr]'
                    : null
            )}
        >
            {cover ? (
                <Image
                    alt="Cover"
                    sources={{
                        light: {
                            src: cover.light.href,
                            size: cover.light.file?.dimensions,
                        },
                        ...(cover.dark
                            ? {
                                  dark: {
                                      src: cover.dark.href,
                                      size: cover.dark.file?.dimensions,
                                  },
                              }
                            : {}),
                    }}
                    sizes={[
                        {
                            width: view.cardSize === 'medium' ? 245 : 376,
                        },
                    ]}
                    resize={context.contentContext?.imageResizer}
                    className={tcls(
                        'rounded-none',
                        'min-w-0',
                        'w-full',
                        'h-full',
                        'object-cover',
                        coverIsSquareOrPortrait
                            ? ['min-[432px]:aspect-video']
                            : ['h-auto', 'aspect-video']
                    )}
                    priority={isOffscreen ? 'lazy' : 'high'}
                    preload
                />
            ) : null}
            {view.columns.length > 0 ? (
                <div
                    className={tcls(
                        'min-w-0',
                        'w-full',
                        'flex',
                        'flex-col',
                        'place-self-start',
                        'gap-3',
                        'p-4',
                        'text-sm',
                        target
                            ? ['transition-colors', 'text-tint', 'group-hover:text-tint-strong']
                            : ['text-tint-strong']
                    )}
                >
                    {view.columns.map((column) => {
                        const definition = block.data.definition[column];

                        if (!definition) {
                            return null;
                        }

                        if (!view.hideColumnTitle && definition.title) {
                            const ariaLabelledBy = `${block.key}-${column}-title`;
                            return (
                                <div key={column} className="flex flex-col gap-1">
                                    <div id={ariaLabelledBy} className="text-sm text-tint">
                                        {definition.title}
                                    </div>
                                    <RecordColumnValue
                                        {...props}
                                        column={column}
                                        ariaLabelledBy={ariaLabelledBy}
                                    />
                                </div>
                            );
                        }

                        console.log(column, definition);

                        return <RecordColumnValue key={column} {...props} column={column} />;
                    })}
                </div>
            ) : null}
        </div>
    );

    if (target && targetRef) {
        return (
            // We don't use `Link` directly here because we could end up in a situation where
            // a link is rendered inside a link, which is not allowed in HTML.
            // It causes an hydration error in React.
            <LinkBox
                data-hoverable={true}
                href={target.href}
                classNames={['RecordCardStyles']}
                className="data-[hoverable=true]:hover:border-tint-12/5"
            >
                <LinkOverlay
                    href={target.href}
                    insights={{
                        type: 'link_click',
                        link: {
                            target: targetRef,
                            position: SiteInsightsLinkPosition.Content,
                        },
                    }}
                />
                {body}
            </LinkBox>
        );
    }

    return <div className={tcls(RecordCardStyles)}>{body}</div>;
}

/**
 * Extract the cover from the record.
 * It can be an image or a file definition.
 */
async function getRecordCover(props: {
    value: TableRecordValueImage | string[];
    context: DocumentContext;
}): Promise<{
    light: ResolvedContentRef;
    dark?: ResolvedContentRef | null;
} | null> {
    const { value, context } = props;

    if (!context.contentContext) {
        return null;
    }

    if (Array.isArray(value) || typeof value === 'string') {
        const resolved = await resolveContentRef(
            { kind: 'file', file: Array.isArray(value) ? value[0] : value },
            context.contentContext
        );

        if (!resolved) {
            return null;
        }

        return {
            light: resolved,
        };
    }

    // If the cover is an image, resolve the light and dark images
    if (isImageDefition(value) && context.contentContext) {
        const [light, dark] = await Promise.all([
            resolveContentRef(value.src, context.contentContext),
            value.srcDark ? resolveContentRef(value.srcDark, context.contentContext) : undefined,
        ]);

        // If the light image is not resolved, we can't display the cover
        if (!light) {
            return null;
        }

        return {
            light,
            dark,
        };
    }

    return null;
}

/**
 * Check if the cover is square or portrait.
 */
function getCoverIsSquareOrPortrait(cover: {
    light: ResolvedContentRef;
    dark?: ResolvedContentRef | null;
}) {
    const isLightSquareOrPortrait = (file: RevisionFile) => {
        return file?.dimensions && file.dimensions.width / file.dimensions.height <= 1;
    };

    return {
        light: cover.light.file ? isLightSquareOrPortrait(cover.light.file) : false,
        dark: cover.dark?.file ? isLightSquareOrPortrait(cover.dark.file) : false,
    };
}
