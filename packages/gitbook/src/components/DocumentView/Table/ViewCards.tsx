import type { DocumentTableViewCards } from '@gitbook/api';

import { ScrollContainer } from '@/components/primitives/ScrollContainer';
import { tcls } from '@/lib/tailwind';

import { RecordCard } from './RecordCard';
import type { TableViewProps } from './Table';
import { TableSearchRecord } from './TableSearch';

export function ViewCards(props: TableViewProps<DocumentTableViewCards>) {
    // `wrap` defaults to `true` (a wrapping grid); only an explicit `false` opts into the
    // horizontally-scrolling carousel row. Fall back to the grid in print mode: a PDF can't
    // scroll, so carousel overflow would be silently clipped.
    if (props.view.wrap === false && props.context.mode !== 'print') {
        return <CardsCarousel {...props} />;
    }

    return <CardsGrid {...props} />;
}

/**
 * The default layout: cards wrap into a responsive grid.
 */
function CardsGrid(props: TableViewProps<DocumentTableViewCards>) {
    const { block, view, records, style } = props;

    return (
        <div
            className={tcls(
                style,
                'inline-grid',
                'gap-4',
                'grid-cols-1',
                '@sm:grid-cols-2',
                view.cardSize === 'large' ? '@xl:grid-cols-2' : '@xl:grid-cols-3',
                block.data.fullWidth ? 'large:flex-column' : null
            )}
        >
            {records.map((record) => {
                return (
                    <TableSearchRecord
                        key={record[0]}
                        recordId={record[0]}
                        visibleClassName="contents"
                    >
                        <RecordCard {...props} record={record} />
                    </TableSearchRecord>
                );
            })}
        </div>
    );
}

/**
 * The carousel layout: cards lay out in a single horizontally-scrolling row that
 * snaps to the leftmost card. Reuses ScrollContainer for the scroll buttons.
 *
 * Rather than fading the edges, the row breaks out of the content column so it can
 * scroll to the page edges. Negative margins on the outer wrapper pull it out; matching
 * padding + scroll-padding on the scroller keep the first/last cards aligned with the
 * body text at rest and snapping to that edge, while cards bleed to the edge mid-scroll.
 * See `bleedVars` below for how far each side reaches.
 */
function CardsCarousel(props: TableViewProps<DocumentTableViewCards>) {
    const { view, records } = props;

    // Cards need a fixed width so the row overflows and scrolls; mirror the grid's
    // medium/large sizing.
    const cardWidth =
        view.cardSize === 'large'
            ? 'w-[90%] @sm:w-[calc(45%-0.5rem)] @5xl:w-[calc(50%-0.5rem)]'
            : 'w-[90%] @sm:w-[calc(45%-0.5rem)] @xl:w-[calc(30%-0.66rem)] @5xl:w-[calc(33.33%-0.66rem)]';

    // Break the row out of the content column so it bleeds to the page edges instead of
    // fading. `--cards-bleed-l/r` are the distances to pull each side out by; they drive the
    // negative margins (on the wrapper) and the matching padding + scroll-padding (on the
    // scroller), so the first/last cards stay aligned with the body text at rest while cards
    // bleed to the edge mid-scroll. Kept as literals here since it's a single block.
    //
    // The bleed only makes sense on the default layout, where the 48rem column leaves wide
    // empty margins to reclaim. The wide layout (max-w-6xl) already fills the usable width,
    // so from `lg` we suppress the bleed entirely — otherwise the page gutter would push the
    // row past where every other block ends, jutting into the window frame.
    //
    // On the default layout:
    // - Left is capped at the page gutter (1/1.5/2rem) so it never slides under the TOC.
    // - Right reaches the viewport edge from `lg`. The 48rem column is centred in the space
    //   beside the TOC, so the gap to the viewport edge is `50vw` minus half the column
    //   (24rem), minus half the TOC (10.5rem of the 21rem `w-72`+`mr-12`) when one is shown.
    //   `html` clips horizontal overflow, so a small overshoot is harmless.
    // - Right collapses to 0 once an outline occupies that column (shown from `xl`), so
    //   cards never slide under it.
    const bleedVars = tcls(
        '[--cards-bleed-l:1rem]',
        'sm:[--cards-bleed-l:1.5rem]',
        'md:[--cards-bleed-l:2rem]',
        'layout-default:md:max-lg:[--cards-bleed-l:max(calc(50vw-24.5rem),2rem)]',
        'lg:[--cards-bleed-l:max(calc(50vw-34rem),3rem)]',
        'xl:[--cards-bleed-l:3rem]',

        '[--cards-bleed-r:1rem]',
        'sm:[--cards-bleed-r:1.5rem]',
        'md:[--cards-bleed-r:2rem]',
        'layout-default:md:max-lg:[--cards-bleed-r:max(calc(50vw-24.5rem),2rem)]',
        'layout-default:lg:[--cards-bleed-r:max(calc(50vw-35rem),3rem)]',
        'layout-default:xl:[--cards-bleed-r:3rem]',

        'hover:layout-default:no-sidebar:lg:max-xl:[--cards-bleed-l:max(calc(50vw-24.5rem),2rem)]',
        'hover:layout-default:no-sidebar:lg:max-xl:[--cards-bleed-r:max(calc(50vw-24.5rem),2rem)]',

        // Default centered
        'hover:layout-default:no-sidebar:xl:[--cards-bleed-l:max(calc(50vw-22.5rem),2rem)]',
        'hover:layout-default:xl:[--cards-bleed-r:max(calc(50vw-26.5rem),19rem)]',

        // Full width, no outline
        'hover:layout-wide:page-no-outline:2xl:[--cards-bleed-r:max(calc(50vw-43.5rem),0rem)]',

        // Full width centered
        'layout-wide:no-sidebar:page-no-outline:2xl:[--cards-bleed-l:max(calc(50vw-36.5rem),0rem)]',
        'layout-wide:no-sidebar:page-no-outline:2xl:[--cards-bleed-r:max(calc(50vw-36.5rem),0rem)]'
    );

    return (
        <ScrollContainer
            orientation="horizontal"
            className={tcls(
                bleedVars,
                'ml-[calc(var(--cards-bleed-l)*-1)]',
                'mr-[calc(var(--cards-bleed-r)*-1)]',
                'xl:transition-[margin]',
                'hover:z-11'
            )}
            // `py-1` keeps the card ring/shadow from being clipped by the scroll overflow;
            // `snap-mandatory` + the scroll-padding snap each card to the content edge.
            contentClassName={tcls(
                'gap-4',
                'pt-px',
                '-mt-px',
                'pb-6',
                '-mb-6',
                'pl-[var(--cards-bleed-l)]',
                'pr-[var(--cards-bleed-r)]',
                'scroll-pl-[var(--cards-bleed-l)]',
                'scroll-pr-[var(--cards-bleed-r)]',
                'snap-x',
                'snap-mandatory',
                'xl:transition-[padding]'
            )}
            leading={{
                fade: true,
                button: { size: 'small', className: 'ml-[calc(var(--cards-bleed-l)-1rem)]' },
            }}
            trailing={{
                fade: true,
                button: { size: 'small', className: 'mr-[calc(var(--cards-bleed-r)-1rem)]' },
            }}
        >
            {records.map((record) => {
                return (
                    <TableSearchRecord
                        key={record[0]}
                        recordId={record[0]}
                        // `grid grid-cols-1` stretches the card to fill the fixed-width,
                        // equal-height track; `snap-start` aligns it to the left edge.
                        visibleClassName={tcls(
                            'grid',
                            'grid-cols-1',
                            'shrink-0',
                            'snap-start',
                            cardWidth
                        )}
                    >
                        <RecordCard {...props} record={record} />
                    </TableSearchRecord>
                );
            })}
        </ScrollContainer>
    );
}
