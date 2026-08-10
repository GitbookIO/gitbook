import type { DocumentBlockTable } from '@gitbook/api';
import assertNever from 'assert-never';

import { tcls } from '@/lib/tailwind';

import type { BlockProps } from '../Block';
import { isBlockOffscreen } from '../utils';
import { StickyViewGrid } from './StickyViewGrid';
import { TableSearchEmpty, TableSearchInput, TableSearchProvider } from './TableSearch';
import { ViewCards } from './ViewCards';
import { ViewGrid, ViewGridHeader } from './ViewGrid';
import { getViewGridLayout, hasVisibleHeader } from './layout';
import {
    type TableRecordKV,
    getTableCheckboxColumns,
    getTableRecordSearchData,
    getTableSelectColumns,
} from './search';
import { shouldShowTableSearch } from './shouldShowSearch';

export type { TableRecordKV };

export interface TableViewProps<View> extends BlockProps<DocumentBlockTable> {
    view: View;
    records: TableRecordKV[];
    isOffscreen: boolean;
}

export function Table(props: BlockProps<DocumentBlockTable>) {
    const { block, ancestorBlocks, document, context, style } = props;
    const isOffscreen = isBlockOffscreen({ block, ancestorBlocks, document });

    const records: TableRecordKV[] = Object.entries(block.data.records).sort((a, b) =>
        a[1].orderIndex.localeCompare(b[1].orderIndex)
    );

    // Authors can override the smart default per block with `search: true | false`; `undefined`
    // keeps the default (search on grid tables with enough rows, off on cards). See the helper.
    const showSearch = shouldShowTableSearch({
        recordCount: records.length,
        viewType: block.data.view.type,
        searchOverride: block.data.search,
        isPrint: context.mode === 'print',
    });
    const searchRecords = showSearch
        ? records.map(([id, record]) => ({ id, ...getTableRecordSearchData(block, record) }))
        : [];

    return (
        <TableSearchProvider records={searchRecords}>
            <div className={tcls(style, 'flex flex-col gap-3')}>
                {showSearch ? (
                    <TableSearchInput
                        selectColumns={getTableSelectColumns(block)}
                        checkboxColumns={getTableCheckboxColumns(block)}
                    />
                ) : null}
                <TableView {...props} isOffscreen={isOffscreen} records={records} />
                <TableSearchEmpty />
            </div>
        </TableSearchProvider>
    );
}

/**
 * Renders the table itself (grid or cards view) for the given records.
 */
function TableView({
    isOffscreen,
    records,
    ...props
}: BlockProps<DocumentBlockTable> & { isOffscreen: boolean; records: TableRecordKV[] }) {
    const { block, context, style } = props;

    switch (block.data.view.type) {
        case 'cards':
            return (
                <ViewCards
                    view={block.data.view}
                    isOffscreen={isOffscreen}
                    records={records}
                    {...props}
                />
            );
        case 'grid': {
            const gridProps = {
                ...props,
                view: block.data.view,
                isOffscreen,
                records,
            };
            const { tableWidth } = getViewGridLayout({
                block,
                view: block.data.view,
                mode: context.mode,
            });
            const tableContainerClassName =
                tableWidth === 'w-full' ? 'min-w-full w-fit' : tableWidth;
            const withHeader = hasVisibleHeader(block, block.data.view);
            const withStickyHeader =
                withHeader && context.mode !== 'print' && block.data.view.stickyHeader === true;
            const withStickyFirstColumn =
                context.mode !== 'print' && block.data.view.stickyFirstColumn === true;

            if (withStickyHeader || withStickyFirstColumn) {
                return (
                    <StickyViewGrid
                        className={tcls(style, 'relative mx-auto grid w-full min-w-0')}
                        stickyHeader={withStickyHeader}
                        tableClassName={tableContainerClassName}
                        header={
                            withHeader ? (
                                <ViewGridHeader
                                    {...gridProps}
                                    tableClassName={tableContainerClassName}
                                    className={tcls(
                                        withStickyHeader
                                            ? [
                                                  'mb-0 border-t border-r border-l',
                                                  'group-data-[scrollable=false]/table:mb-1',
                                                  'group-data-[scrollable=false]/table:rounded-b-lg',
                                                  'group-data-[scrollable=true]/table:border-t-0',
                                                  'group-data-[scrollable=true]/table:border-x-0',
                                              ]
                                            : undefined
                                    )}
                                />
                            ) : undefined
                        }
                    >
                        <ViewGrid {...gridProps} tableClassName={tableContainerClassName} />
                    </StickyViewGrid>
                );
            }

            return (
                <div className={tcls(style, 'relative mx-auto grid w-full min-w-0')}>
                    <div
                        className={tcls(
                            'w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-none border-tint-subtle '
                        )}
                    >
                        <div
                            className={tcls('flex', 'flex-col', tableContainerClassName)}
                            role="table"
                        >
                            {withHeader ? (
                                <ViewGridHeader
                                    {...gridProps}
                                    tableClassName={tableContainerClassName}
                                    className={tableContainerClassName}
                                />
                            ) : null}
                            <ViewGrid {...gridProps} tableClassName={tableContainerClassName} />
                        </div>
                    </div>
                </div>
            );
        }
        default:
            assertNever(block.data.view);
    }
}
