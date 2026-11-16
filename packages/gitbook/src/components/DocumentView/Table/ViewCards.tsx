import type { DocumentTableViewCards } from '@gitbook/api';

import { RecordCard } from './RecordCard';
import type { TableViewProps } from './Table';
import { TableSearchRecord } from './TableSearch';
import { ScrollContainer } from '@/components/primitives/ScrollContainer';
import { cx } from '@/lib/classnames';
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
            className={cx(
                tcls(style),
                'record-cards',
                view.cardSize === 'large' ? 'record-cards-large' : 'record-cards-medium',
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

// The peek fits the page gutter (`CONTAINER_STYLE`) so the fade stays on screen; from `2xl` the
// cards fill the row exactly and need the full 3rem to show the next one.
const PEEK = {
    margin: '-mx-4 sm:-mx-6 md:-mx-8 2xl:-mx-12',
    padding:
        'px-4 scroll-px-4 sm:px-6 sm:scroll-px-6 md:px-8 md:scroll-px-8 2xl:px-12 2xl:scroll-px-12',
    leadingButton: 'ml-0 sm:ml-2 md:ml-4 2xl:ml-8',
    trailingButton: 'mr-0 sm:mr-2 md:mr-4 2xl:mr-8',
};

/**
 * The carousel layout: cards lay out in a single horizontally-scrolling row that
 * snaps to the leftmost card. Reuses ScrollContainer for the scroll buttons.
 *
 * The row extends by a small, symmetric peek on each side. The matching padding keeps
 * the first and last cards aligned with the content column while the edge masks fade only
 * the cards in that peek area.
 */
function CardsCarousel(props: TableViewProps<DocumentTableViewCards>) {
    const { view, records } = props;

    const itemClassName = cx(
        'record-carousel-item',
        view.cardSize === 'large' ? 'record-carousel-item-large' : 'record-carousel-item-medium'
    );

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
                        visibleClassName={itemClassName}
                    >
                        <RecordCard {...props} record={record} />
                    </TableSearchRecord>
                );
            })}
        </ScrollContainer>
    );
}
