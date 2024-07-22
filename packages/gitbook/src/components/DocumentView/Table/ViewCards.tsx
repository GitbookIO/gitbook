import { DocumentTableViewCards } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { RecordCard } from './RecordCard';
import { TableViewProps } from './Table';

export function ViewCards(props: TableViewProps<DocumentTableViewCards>) {
    const { block, view, records, style } = props;

    return (
        <div
            className={tcls(
                style,
                'inline-grid',
                'gap-4',
                'grid-cols-1',
                'min-[432px]:grid-cols-2',
                view.cardSize === 'large' ? 'md:grid-cols-2' : 'md:grid-cols-3',
                block.data.fullWidth ? 'large:flex-column' : null,
            )}
        >
            {records.map((record) => {
                return <RecordCard key={record[0]} {...props} record={record} />;
            })}
        </div>
    );
}
