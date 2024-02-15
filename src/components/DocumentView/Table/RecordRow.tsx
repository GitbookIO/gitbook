import { DocumentTableViewGrid } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { RecordColumnValue } from './RecordColumnValue';
import { TableRecordKV, TableViewProps } from './Table';

export async function RecordRow(
    props: TableViewProps<DocumentTableViewGrid> & {
        record: TableRecordKV;
    },
) {
    const { view } = props;
    const columnsLengthThreshold = view.columns.length >= 7;

    const tableTR = columnsLengthThreshold
        ? ['[&>*+*]:border-l', '[&>*]:px-4']
        : ['[&>*+*]:border-l', '[&>*+*]:pl-4'];

    return (
        <tr className={tcls(tableTR, 'border-dark/3', 'dark:border-light/2')}>
            {view.columns.map((column) => {
                return (
                    <td
                        key={column}
                        className={tcls(
                            'align-baseline',
                            'min-w-[8rem]',
                            'border-dark/2',
                            'py-3',
                            'text-sm',
                            'lg:text-base',
                            'dark:border-light/2',
                        )}
                    >
                        <div className={tcls('pr-4 ', 'text-balance')}>
                            <RecordColumnValue key={column} {...props} column={column} />
                        </div>
                    </td>
                );
            })}
        </tr>
    );
}
