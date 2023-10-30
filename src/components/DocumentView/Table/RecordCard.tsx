import { ContentRef, DocumentTableViewCards } from '@gitbook/api';
import { TableRecordKV, TableViewProps } from './Table';
import { tcls } from '@/lib/tailwind';
import { resolveContentRef } from '@/lib/references';
import { RecordColumnValue } from './RecordColumnValue';

export async function RecordCard(
    props: TableViewProps<DocumentTableViewCards> & {
        record: TableRecordKV;
    },
) {
    const { block, view, record } = props;

    const coverFile = view.coverDefinition
        ? (record[1].values[view.coverDefinition]?.[0] as string)
        : null;
    const cover = coverFile
        ? await resolveContentRef({ kind: 'file', file: coverFile }, props.context)
        : null;

    const targetRef = view.targetDefinition
        ? (record[1].values[view.targetDefinition] as ContentRef)
        : null;
    const target = targetRef ? await resolveContentRef(targetRef, props.context) : null;

    const body = (
        <>
            {cover ? (
                <img alt="Cover" src={cover.href} className={tcls('w-full', 'aspect-video')} />
            ) : null}
            <div className={tcls('flex', 'flex-col', 'p-4', 'gap-2')}>
                {view.columns.map((column) => {
                    return <RecordColumnValue key={column} {...props} column={column} />;
                })}
            </div>
        </>
    );

    const style = [
        'group',
        'flex',
        'flex-col',
        'rounded-lg',
        'overflow-hidden',
        'transition-shadow',
        'duration-300',
        'shadow-md',
        'hover:shadow-lg',
        'border',
        'border-zinc-100',
        'dark:border-zinc-700',
    ];

    if (target) {
        return (
            <a href={target.href} className={tcls(style)}>
                {body}
            </a>
        );
    }

    return <div className={tcls('rounded-lg')}>{body}</div>;
}
