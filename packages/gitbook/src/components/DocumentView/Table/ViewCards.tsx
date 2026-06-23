import type { DocumentTableViewCards } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { RecordCard } from './RecordCard';
import type { TableViewProps } from './Table';
import { TableSearchRecord } from './TableSearch';

export function ViewCards(props: TableViewProps<DocumentTableViewCards>) {
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
