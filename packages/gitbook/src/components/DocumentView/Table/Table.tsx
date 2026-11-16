import assertNever from 'assert-never';

import type { DocumentBlockTable, DocumentTableViewGrid } from '@gitbook/api';

import type { BlockProps } from '../Block';
import { getCommentAnchorProps, getCommentMarkerProps, isBlockOffscreen } from '../utils';
import { type TableCellMergeLayout, createTableCellMergeLayout } from './cellMerges';
import { getViewGridLayout, hasVisibleHeader } from './layout';
import { NativeViewGrid } from './NativeViewGrid';
import {
    type TableRecordKV,
    getTableCheckboxColumns,
    getTableRecordSearchData,
    getTableSelectColumns,
} from './search';
import { shouldShowTableSearch } from './shouldShowSearch';
import { StickyViewGrid } from './StickyViewGrid';
import {
    TableSearchEmpty,
    TableSearchInput,
    TableSearchProvider,
    TableSelectionFilter,
} from './TableSearch';
import { ViewCards } from './ViewCards';
import { ViewGrid, ViewGridHeader } from './ViewGrid';
import { cx } from '@/lib/classnames';
import { tcls } from '@/lib/tailwind';

export type { TableRecordKV };

export interface TableViewProps<View> extends BlockProps<DocumentBlockTable> {
    view: View;
    records: TableRecordKV[];
    isOffscreen: boolean;
}

export interface TableGridViewProps extends TableViewProps<DocumentTableViewGrid> {
    cellMergeLayout: TableCellMergeLayout;
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
    const selectColumns = getTableSelectColumns(block);
    // Also needed when the search bar is hidden: a reader's content selection can narrow a select
    // column from a tab or picker elsewhere on the page, and without records there is nothing to
    // match against. A table with no select column can never be narrowed that way, so it skips.
    const searchRecords =
        showSearch || selectColumns.length > 0
            ? records.map(([id, record]) => ({ id, ...getTableRecordSearchData(block, record) }))
            : [];
    const cellMergeLayout = createTableCellMergeLayout(
        block,
        records.map(([recordId]) => recordId)
    );

    return (
        <TableSearchProvider
            records={searchRecords}
            selectColumns={selectColumns}
            recordGroups={
                block.data.view.type === 'grid' ? cellMergeLayout.recordGroups : undefined
            }
        >
            <div
                {...getCommentAnchorProps(context, block.key)}
                // Owns clicks inside, e.g. on blocks of a record's own document; cells still win.
                {...getCommentMarkerProps(context, 'data-comment-block')}
                className={cx(tcls(style), 'table-block')}
            >
                {showSearch ? (
                    <TableSearchInput
                        selectColumns={selectColumns}
                        checkboxColumns={getTableCheckboxColumns(block)}
                    />
                ) : null}
                {/* Sits under the filter control it relates to, and tight against the search bar,
                    so it reads as part of the filter controls rather than a caption on the table.
                    Standalone — cards, short grids — there is no control to sit under. */}
                <TableSelectionFilter className={showSearch ? '-mt-1.5 justify-end' : undefined} />
                <TableView
                    {...props}
                    isOffscreen={isOffscreen}
                    records={records}
                    cellMergeLayout={cellMergeLayout}
                />
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
    cellMergeLayout,
    ...props
}: BlockProps<DocumentBlockTable> & {
    isOffscreen: boolean;
    records: TableRecordKV[];
    cellMergeLayout: TableCellMergeLayout;
}) {
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
                cellMergeLayout,
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

            if (cellMergeLayout.hasVerticalMerges) {
                return <NativeViewGrid {...gridProps} />;
            }

            if (withStickyHeader || withStickyFirstColumn) {
                return (
                    <StickyViewGrid
                        className={cx(tcls(style), 'table-view')}
                        stickyHeader={withStickyHeader}
                        tableClassName={tableContainerClassName}
                        header={
                            withHeader ? (
                                <ViewGridHeader
                                    {...gridProps}
                                    tableClassName={tableContainerClassName}
                                    className={cx(
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
                <div className={cx(tcls(style), 'table-view')}>
                    <div className="table-scroll">
                        <div className={cx('table-stack', tableContainerClassName)} role="table">
                            {withHeader ? (
                                <ViewGridHeader
                                    {...gridProps}
                                    tableClassName={tableContainerClassName}
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
