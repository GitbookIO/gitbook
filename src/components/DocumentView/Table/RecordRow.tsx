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

    return (
        <tr
            className={tcls(
                'border-dark/2',
                '[&>*+*]:border-l',
                '[&>*+*]:pl-4',
                'flex-row',
                'dark:border-light/2',
            )}
        >
            {view.columns.map((column) => {
                return (
                    <td
                        key={column}
                        className={tcls('border-dark/2', 'py-3', 'dark:border-light/2')}
                    >
                        <div className={tcls('pr-4 ', 'textwrap-balance')}>
                            <RecordColumnValue key={column} {...props} column={column} />
                        </div>
                    </td>
                );
            })}
        </tr>
    );
}
