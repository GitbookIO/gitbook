import type { DocumentTableViewCards } from '@gitbook/api';

import { RecordCard } from './RecordCard';
import type { TableViewProps } from './Table';
import { TableSearchRecord } from './TableSearch';
import { ScrollContainer } from '@/components/primitives/ScrollContainer';
import { tcls } from '@/lib/tailwind';

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
                view.cardSize === 'large' ? '@xl:grid-cols-2' : '@2xl:grid-cols-3 @sm:grid-cols-2', // Large cards break earlier to avoid becoming *too* big.
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

// Each step fits the page gutter at that breakpoint (3rem only once the content column is capped); buttons sit 1rem inside the peek.
const PEEK = {
    margin: '-mx-4 sm:-mx-6 md:-mx-8 3xl:-mx-12',
    padding:
        'px-4 scroll-px-4 sm:px-6 sm:scroll-px-6 md:px-8 md:scroll-px-8 3xl:px-12 3xl:scroll-px-12',
    leadingButton: 'ml-0 sm:ml-2 md:ml-4 3xl:ml-8',
    trailingButton: 'mr-0 sm:mr-2 md:mr-4 3xl:mr-8',
};

/**
 * The carousel layout: cards lay out in a single horizontally-scrolling row that
 * snaps to the leftmost card. Reuses ScrollContainer for the scroll buttons.
 *
 * The row extends by a small, symmetric peek on each side. The matching padding keeps
 * the first and last cards aligned with the content column while the edge masks fade only
 * the cards in that peek area. The peek follows the page gutter (`CONTAINER_STYLE`) and
 * only reaches 3rem on wide screens, so the faded edge stays inside the viewport.
 */
function CardsCarousel(props: TableViewProps<DocumentTableViewCards>) {
    const { view, records } = props;

    // Cards need a fixed width so the row overflows and scrolls; mirror the grid's
    // medium/large sizing.
    const cardWidth =
        view.cardSize === 'large'
            ? 'w-[90%] @sm:w-[calc(45%-0.5rem)] @5xl:w-[calc(50%-0.5rem)]'
            : 'w-[90%] @sm:w-[calc(45%-0.5rem)] @xl:w-[calc(30%-0.66rem)] @5xl:w-[calc(33.33%-0.66rem)]';

    return (
        <ScrollContainer
            orientation="horizontal"
            className={tcls(PEEK.margin, 'hover:z-11')}
            // `py-1` keeps the card ring/shadow from being clipped by the scroll overflow;
            // `snap-mandatory` + the scroll-padding snap each card to the content edge.
            contentClassName={tcls(
                'gap-4',
                'pt-px',
                '-mt-px',
                'pb-6',
                '-mb-6',
                PEEK.padding,
                'snap-x',
                'snap-mandatory'
            )}
            scrollByVisibleItems
            leading={{
                fade: true,
                button: { size: 'small', className: PEEK.leadingButton },
            }}
            trailing={{
                fade: true,
                button: { size: 'small', className: PEEK.trailingButton },
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
