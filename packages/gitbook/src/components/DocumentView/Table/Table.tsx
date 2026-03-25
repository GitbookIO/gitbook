import type { DocumentBlockTable, DocumentTableRecord } from '@gitbook/api';
import assertNever from 'assert-never';

import { tcls } from '@/lib/tailwind';

import type { BlockProps } from '../Block';
import { isBlockOffscreen } from '../utils';
import { StickyViewGrid } from './StickyViewGrid';
import { ViewCards } from './ViewCards';
import { ViewGrid, ViewGridHeader } from './ViewGrid';
import { getViewGridLayout, hasVisibleHeader } from './layout';

export type TableRecordKV = [string, DocumentTableRecord];

export interface TableViewProps<View> extends BlockProps<DocumentBlockTable> {
    view: View;
    records: TableRecordKV[];
    isOffscreen: boolean;
}

export function Table(props: BlockProps<DocumentBlockTable>) {
    const { block, ancestorBlocks, document, context, style } = props;
    const isOffscreen = isBlockOffscreen({ block, ancestorBlocks, document });

    const records: TableRecordKV[] = Object.entries(block.data.records).sort((a, b) => {
        return a[1].orderIndex.localeCompare(b[1].orderIndex);
    });

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

            if (withStickyHeader) {
                return (
                    <StickyViewGrid
                        className={tcls(style, 'relative mx-auto grid w-full min-w-0')}
                        tableClassName={tableContainerClassName}
                        header={
                            <ViewGridHeader
                                {...gridProps}
                                tableClassName={tableContainerClassName}
                                className={tcls(
                                    'mb-0 rounded-b-none border-t border-r border-l',
                                    'group-data-[scrollable=false]/table:mb-1',
                                    'group-data-[scrollable=false]/table:rounded-b-lg',
                                    'group-data-[scrollable=true]/table:border-t-0',
                                    'group-data-[scrollable=true]/table:border-r-0',
                                    'group-data-[scrollable=true]/table:border-l-0'
                                )}
                            />
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
                        <div className={tcls('flex', 'flex-col', tableContainerClassName)}>
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
