import { ContentRef, DocumentTableViewCards } from '@gitbook/api';

import { Image } from '@/components/utils';
import { ClassValue, tcls } from '@/lib/tailwind';

import { RecordColumnValue } from './RecordColumnValue';
import { TableRecordKV, TableViewProps } from './Table';
import { getRecordValue } from './utils';

export async function RecordCard(
    props: TableViewProps<DocumentTableViewCards> & {
        record: TableRecordKV;
    },
) {
    const { view, record, context, isOffscreen } = props;

    const coverFile = view.coverDefinition
        ? getRecordValue<string[]>(record[1], view.coverDefinition)?.[0]
        : null;
    const cover = coverFile
        ? await context.resolveContentRef({ kind: 'file', file: coverFile })
        : null;

    const targetRef = view.targetDefinition
        ? (record[1].values[view.targetDefinition] as ContentRef)
        : null;
    const target = targetRef ? await context.resolveContentRef(targetRef) : null;

    const body = (
        <div className={tcls('grid-area-1-1', 'z-0', 'relative')}>
            {cover ? (
                <Image
                    alt="Cover"
                    sources={{
                        light: {
                            src: cover.href,
                            size: cover.fileDimensions,
                        },
                    }}
                    sizes={[
                        {
                            width: view.cardSize === 'medium' ? 245 : 376,
                        },
                    ]}
                    className={tcls('w-full', 'aspect-video', 'object-cover')}
                    priority={isOffscreen ? 'lazy' : 'high'}
                    preload
                />
            ) : null}
            <div
                className={tcls(
                    'flex',
                    'flex-col',
                    'p-4',
                    'text-sm',
                    'text-dark/8',
                    'transition-colors',
                    'group-hover:text-dark/10',
                    'dark:text-light/8',
                    'dark:group-hover:text-light/10',
                )}
            >
                {view.columns.map((column) => {
                    return <RecordColumnValue key={column} {...props} column={column} />;
                })}
            </div>
        </div>
    );

    const style = [
        'group',
        'grid',
        'overflow-hidden',
        'bg-light',
        'shadow-1xs',
        'duration-300',
        'rounded-md',
        'shadow-dark/[0.02]',
        'hover:before:ring-dark/4',
        'dark:bg-dark',
        'dark:shadow-transparent',
        'dark:hover:before:ring-light/4',
        'z-0',
        //before
        'before:grid-area-1-1',
        'before:transition-shadow',
        'before:w-full',
        'before:h-full',
        'before:rounded-md',
        'before:ring-inset',
        'before:ring-1',
        'before:ring-dark/2',
        'before:z-10',
        'before:relative',
        'before:dark:ring-light/2',
    ] as ClassValue;

    if (target) {
        return (
            <a href={target.href} className={tcls(style)}>
                {body}
            </a>
        );
    }

    return (
        <div
            className={tcls([style, 'hover:before:ring-dark/2', 'dark:hover:before:ring-light/2'])}
        >
            {body}
        </div>
    );
}
