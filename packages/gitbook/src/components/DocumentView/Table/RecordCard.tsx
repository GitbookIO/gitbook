import { LinkBox, LinkOverlay } from '@/components/primitives';
import { Image } from '@/components/utils';
import { type ResolvedContentRef, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';
import {
    type ContentRef,
    type DocumentTableViewCards,
    SiteInsightsLinkPosition,
} from '@gitbook/api';
import { RecordColumnValue } from './RecordColumnValue';
import type { TableRecordKV, TableViewProps } from './Table';
import { RecordCardStyles } from './styles';
import { getRecordCardCovers } from './utils';

export async function RecordCard(
    props: TableViewProps<DocumentTableViewCards> & {
        record: TableRecordKV;
    }
) {
    const { view, record, context, block, isOffscreen } = props;

    const { dark, light } = getRecordCardCovers(record[1], view);
    const targetRef = view.targetDefinition
        ? (record[1].values[view.targetDefinition] as ContentRef)
        : null;

    const [lightCover, darkCover, target] = await Promise.all([
        light && context.contentContext ? resolveContentRef(light, context.contentContext) : null,
        dark && context.contentContext ? resolveContentRef(dark, context.contentContext) : null,
        targetRef && context.contentContext
            ? resolveContentRef(targetRef, context.contentContext)
            : null,
    ]);

    const darkCoverIsSquareOrPortrait = isSquareOrPortrait(darkCover);
    const lightCoverIsSquareOrPortrait = isSquareOrPortrait(lightCover);

    const body = (
        <div
            className={tcls(
                'grid-area-1-1',
                'relative',
                'grid',
                'bg-tint-base',
                'w-[calc(100%+2px)]',
                'h-[calc(100%+2px)]',
                '-inset-px',
                'rounded-sm',
                'straight-corners:rounded-none',
                'circular-corners:rounded-xl',
                'overflow-hidden',
                '[&_.heading>div:first-child]:hidden',
                '[&_.heading>div]:text-[.8em]',
                'md:[&_.heading>div]:text-[1em]',
                '[&_.blocks:first-child_.heading]:pt-0', // Remove padding-top on first heading in card

                // On mobile, check if we can display the cover responsively or not:
                // - If the file has a landscape aspect ratio, we display it normally
                // - If the file is square or portrait, we display it left with 40% of the card width
                lightCoverIsSquareOrPortrait || darkCoverIsSquareOrPortrait
                    ? [
                          lightCoverIsSquareOrPortrait
                              ? 'grid-cols-[40%__1fr] min-[432px]:grid-cols-none min-[432px]:grid-rows-[auto_1fr]'
                              : '',
                          darkCoverIsSquareOrPortrait
                              ? 'dark:grid-cols-[40%__1fr] dark:min-[432px]:grid-cols-none dark:min-[432px]:grid-rows-[auto_1fr]'
                              : '',
                      ].filter(Boolean)
                    : 'grid-rows-[auto_1fr]'
            )}
        >
            {lightCover ? (
                <Image
                    alt="Cover"
                    sources={{
                        light: {
                            src: lightCover.href,
                            size: lightCover.file?.dimensions,
                        },
                        dark: darkCover
                            ? {
                                  src: darkCover.href,
                                  size: darkCover.file?.dimensions,
                              }
                            : null,
                    }}
                    sizes={[
                        {
                            width: view.cardSize === 'medium' ? 245 : 376,
                        },
                    ]}
                    resize={context.contentContext?.imageResizer}
                    className={tcls(
                        'min-w-0',
                        'w-full',
                        'h-full',
                        'object-cover',
                        lightCoverIsSquareOrPortrait || darkCoverIsSquareOrPortrait
                            ? [
                                  lightCoverIsSquareOrPortrait
                                      ? 'min-[432px]:aspect-video min-[432px]:h-auto'
                                      : '',
                                  darkCoverIsSquareOrPortrait
                                      ? 'dark:min-[432px]:aspect-video dark:min-[432px]:h-auto'
                                      : '',
                              ].filter(Boolean)
                            : ['h-auto', 'aspect-video']
                    )}
                    priority={isOffscreen ? 'lazy' : 'high'}
                    preload
                />
            ) : null}
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

                    return <RecordColumnValue key={column} {...props} column={column} />;
                })}
            </div>
        </div>
    );

    if (target && targetRef) {
        return (
            // We don't use `Link` directly here because we could end up in a situation where
            // a link is rendered inside a link, which is not allowed in HTML.
            // It causes an hydration error in React.
            <LinkBox href={target.href} classNames={['RecordCardStyles']}>
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
 * Check if a file is square or portrait.
 */
function isSquareOrPortrait(contentRef: ResolvedContentRef | null) {
    const file = contentRef?.file;

    if (!file || !file.dimensions) {
        return false;
    }

    return file.dimensions?.width / file.dimensions?.height <= 1;
}
