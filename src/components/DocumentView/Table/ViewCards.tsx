import { DocumentTableViewCards } from '@gitbook/api';
import { TableViewProps } from './Table';
import { tcls } from '@/lib/tailwind';
import { RecordCard } from './RecordCard';

export function ViewCards(props: TableViewProps<DocumentTableViewCards>) {
    const { block, view, records, style } = props;

    return (
        <div
            className={tcls(
                style,
                'grid',
                view.cardSize === 'large' ? 'grid-cols-2' : 'grid-cols-3',
                'gap-4',

                block.data.fullWidth ? ['max-w-full', 'large:flex-column'] : null,
            )}
        >
            {records.map((record) => {
                return <RecordCard key={record[0]} {...props} record={record} />;
            })}
        </div>
    );
}
