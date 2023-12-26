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
                'max-w-full',
                'md:max-w-3xl',
                'inline-grid',
                'gap-4',

                view.cardSize === 'large'
                    ? 'grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))]'
                    : 'grid-cols-[repeat(auto-fit,_minmax(184px,_1fr))]',
                block.data.fullWidth ? ['max-w-full', 'large:flex-column'] : null,
            )}
        >
            {records.map((record) => {
                return <RecordCard key={record[0]} {...props} record={record} />;
            })}
        </div>
    );
}
