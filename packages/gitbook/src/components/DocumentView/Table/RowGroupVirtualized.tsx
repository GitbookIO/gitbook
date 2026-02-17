import { tcls } from '@/lib/tailwind';
import type { DocumentTableViewGrid } from '@gitbook/api';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import React from 'react';
import { RecordRow } from './RecordRow';
import type { TableViewProps } from './Table';

/**
 * Virtualized group of rows for tables with many records.
 */
export const VIRTUALIZATION_THRESHOLD = 200;
const ROW_ESTIMATE_PX = 40;

export function RowGroupVirtualized(
    props: TableViewProps<DocumentTableViewGrid> & {
        autoSizedColumns: string[];
        fixedColumns: string[];
        tableWidth: string;
    }
) {
    const { records, tableWidth, ...rest } = props;
    const [isHydrated, setIsHydrated] = React.useState(false);
    const [scrollMargin, setScrollMargin] = React.useState(0);
    const parentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        setIsHydrated(true);
    }, []);

    React.useEffect(() => {
        if (!isHydrated) {
            return;
        }

        const updateScrollMargin = () => {
            if (!parentRef.current) {
                return;
            }

            const rect = parentRef.current.getBoundingClientRect();
            setScrollMargin(rect.top + window.scrollY);
        };

        updateScrollMargin();
        window.addEventListener('resize', updateScrollMargin);

        return () => {
            window.removeEventListener('resize', updateScrollMargin);
        };
    }, [isHydrated]);

    const rowVirtualizer = useWindowVirtualizer({
        count: records.length,
        estimateSize: () => ROW_ESTIMATE_PX,
        overscan: 8,
        scrollMargin,
    });

    if (!isHydrated) {
        return (
            <div role="rowgroup" className={tcls('flex', 'flex-col', tableWidth)}>
                {records.map((record) => (
                    <RecordRow key={record[0]} record={record} records={records} {...rest} />
                ))}
            </div>
        );
    }

    return (
        <div
            ref={parentRef}
            role="rowgroup"
            className={tcls('relative', 'flex', 'flex-col', tableWidth)}
            style={{ height: rowVirtualizer.getTotalSize() }}
        >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const record = records[virtualRow.index];

                if (!record) {
                    return null;
                }

                return (
                    <div
                        key={record[0]}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualRow.start - scrollMargin}px)`,
                        }}
                    >
                        <RecordRow
                            records={records}
                            record={record}
                            className={virtualRow.index === 0 ? undefined : 'border-t'}
                            {...rest}
                        />
                    </div>
                );
            })}
        </div>
    );
}
