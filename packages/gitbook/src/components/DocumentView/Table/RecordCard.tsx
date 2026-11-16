import {
    CardsImageObjectFit,
    type ContentRef,
    type DocumentTableViewCards,
    SiteInsightsLinkPosition,
} from '@gitbook/api';

import { isRecordColumnEmpty } from './isRecordColumnEmpty';
import { RecordColumnValue } from './RecordColumnValue';
import type { TableRecordKV, TableViewProps } from './Table';
import { getRecordCardCovers } from './utils';
import { LinkBox, LinkOverlay } from '@/components/primitives';
import { Image } from '@/components/utils';
import { cx } from '@/lib/classnames';
import { type ResolvedContentRef, resolveContentRefInDocument } from '@/lib/references';

export async function RecordCard(
    props: TableViewProps<DocumentTableViewCards> & {
        record: TableRecordKV;
    }
) {
    const { view, record, context, block, isOffscreen, document } = props;

    // A card paints its own opaque background, so a background page cover is never behind its
    // content. Cover-aware contrast text must not apply inside it: it leaves the glyphs transparent
    // and relies on a viewport-fixed background clipped to text, which Firefox and iOS Safari fail
    // to paint through the card's clipped stacking context — the text disappears entirely.
    const cardProps = { ...props, context: { ...context, isPageBody: false } };

    const { dark, light } = getRecordCardCovers(record[1], view);
    const targetRef = view.targetDefinition
        ? (record[1].values[view.targetDefinition] as ContentRef)
        : null;

    const [lightCover, darkCover, target] = await Promise.all([
        light.contentRef && context.contentContext
            ? resolveContentRefInDocument(document, light.contentRef, context.contentContext)
            : null,
        dark.contentRef && context.contentContext
            ? resolveContentRefInDocument(document, dark.contentRef, context.contentContext)
            : null,
        targetRef && context.contentContext
            ? resolveContentRefInDocument(document, targetRef, context.contentContext)
            : null,
    ]);

    const darkCoverIsSquareOrPortrait = isSquareOrPortrait(darkCover);
    const lightCoverIsSquareOrPortrait = isSquareOrPortrait(lightCover);

    const darkObjectFit = `dark:${getObjectFitClass(dark.objectFit)}`;
    const lightObjectFit = getObjectFitClass(light.objectFit);
    const objectFits = `${lightObjectFit} ${darkObjectFit}`;

    const body = (
        <div
            // Marks the card body so overflow-clipped affordances (e.g. the paragraph "Ask"
            // button) can opt out of rendering inside it.
            data-card=""
            className={cx(
                'record-card-body',
                lightCoverIsSquareOrPortrait || darkCoverIsSquareOrPortrait
                    ? [
                          lightCoverIsSquareOrPortrait && 'record-card-body-portrait',
                          darkCoverIsSquareOrPortrait && 'record-card-body-portrait-dark',
                      ]
                    : 'record-card-body-landscape'
            )}
        >
            {lightCover ? (
                <Image
                    alt="Cover"
                    sources={{
                        light: {
                            src: lightCover.href,
                            size: lightCover.file?.dimensions,
                            alt: light.alt,
                        },
                        dark: darkCover
                            ? {
                                  src: darkCover.href,
                                  size: darkCover.file?.dimensions,
                                  alt: dark.alt,
                              }
                            : null,
                    }}
                    sizes={[
                        {
                            media: '(max-width: 640px)',
                            width: view.cardSize === 'medium' ? 245 : 376,
                        },
                        {
                            width: view.cardSize === 'medium' ? 490 : 752,
                        },
                    ]}
                    resize={context.contentContext?.imageResizer}
                    className={cx(
                        'record-card-cover',
                        lightCoverIsSquareOrPortrait || darkCoverIsSquareOrPortrait
                            ? [
                                  lightCoverIsSquareOrPortrait && 'record-card-cover-portrait',
                                  darkCoverIsSquareOrPortrait && 'record-card-cover-portrait-dark',
                              ]
                            : 'record-card-cover-landscape',
                        objectFits
                    )}
                    loading={isOffscreen && context.mode !== 'print' ? 'lazy' : 'eager'}
                />
            ) : null}
            <div className="record-card-content">
                {view.columns.map((column) => {
                    const definition = block.data.definition[column];

                    if (!definition) {
                        return null;
                    }

                    // A field can hold nothing at all (an `if` block that didn't match, an
                    // empty value); rendering it would leave a gap and a dangling title.
                    if (isRecordColumnEmpty(block, record[1], column)) {
                        return null;
                    }

                    if (!view.hideColumnTitle && definition.title) {
                        const ariaLabelledBy = `${block.key}-${column}-title`;
                        return (
                            <div key={column} className="record-card-field">
                                <div id={ariaLabelledBy} className="record-card-field-title">
                                    {definition.title}
                                </div>
                                <RecordColumnValue
                                    {...cardProps}
                                    column={column}
                                    ariaLabelledBy={ariaLabelledBy}
                                />
                            </div>
                        );
                    }

                    return <RecordColumnValue key={column} {...cardProps} column={column} />;
                })}
            </div>
        </div>
    );

    if (target && targetRef) {
        return (
            // We don't use `Link` directly here because we could end up in a situation where
            // a link is rendered inside a link, which is not allowed in HTML.
            // It causes an hydration error in React.
            <LinkBox href={target.href} classNames={['RecordCardStyles', 'RecordCardLinkStyles']}>
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

    return <div className="record-card">{body}</div>;
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

/**
 * Get the CSS class for object-fit based on the objectFit value.
 */
function getObjectFitClass(objectFit: CardsImageObjectFit | undefined): string {
    if (!objectFit) {
        return 'object-cover';
    }

    switch (objectFit) {
        case CardsImageObjectFit.Contain:
            return 'object-contain';
        case CardsImageObjectFit.Fill:
            return 'object-fill';
        case CardsImageObjectFit.Cover:
            return 'object-cover';
        default:
            throw new Error(`Unsupported object fit: ${objectFit}`);
    }
}
