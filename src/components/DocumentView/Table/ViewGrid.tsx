import { DocumentTableViewGrid } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { RecordRow } from './RecordRow';
import { TableViewProps } from './Table';
import styles from './table.module.css';
import { getColumnAlignment } from './utils';

export function ViewGrid(props: TableViewProps<DocumentTableViewGrid>) {
    const { block, view, records, style } = props;
    const columnsOverThreshold = view.columns.length >= 7;

    const tableWrapper = columnsOverThreshold
        ? [
              // has over X columns
              'overflow-x-auto',
              'overflow-y-hidden',
              'mx-auto',
              'rounded-md',
              'border',
              'border-dark/3',
              'dark:border-light/2',
          ]
        : ['overflow-x-auto', 'overflow-y-hidden', 'mx-auto'];

    const tableTR = columnsOverThreshold
        ? ['[&>*+*]:border-l', '[&>*]:px-4']
        : ['[&>*+*]:border-l', '[&>*+*]:px-4'];

    const tableTH = columnsOverThreshold ? ['py-3'] : ['py-1', 'pt-0'];

    // Only show the header when configured and not empty
    const withHeader =
        !view.hideHeader &&
        view.columns.some((columnId) => block.data.definition[columnId].title.trim().length > 0);

    return (
        <div
            className={`${tcls(style, 'relative', 'grid', tableWrapper, styles.progressContainer)}`}
        >
            {/* ProgressScroller: */}
            <div
                className={`${styles.progressOpacitySharp} ${tcls(
                    'grid',
                    'items-center',
                    'grid-area-1-1',
                    'w-[5rem]',
                    'h-full',
                    'top-0',
                    'z-[1]',
                    'sticky',
                    'left-[calc(100%-5rem)]',
                )}`}
            >
                <svg
                    className={`${styles.progressSvg} ${tcls(
                        'grid-area-1-1',
                        'relative',
                        '[strokeDasharray:_0_100]',
                        'z-[1]',
                        'w-7',
                        'mt-3',
                        'mr-3',
                        'self-start',
                        'justify-self-end',
                        'stroke-primary-600',
                        'shadow-1xs',
                        'bg-light',
                        'ring-1',
                        'ring-inset',
                        'rounded-full',
                        'ring-dark/2',
                        'dark:ring-light/2',
                        'dark:bg-dark',
                        'dark:stroke-primary-400',
                    )}`}
                    preserveAspectRatio="xMaxYMid meet"
                    width="100%"
                    viewBox="0 0 26 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle
                        cx="13"
                        className={`${styles.strokeOpacityProgressInverted}`}
                        cy="13"
                        r="12.5"
                        fill="none"
                        stroke="inherit"
                        strokeWidth="1.5"
                        pathLength="100"
                        strokeLinecap="round"
                        strokeOpacity={0}
                    />

                    <path
                        strokeDasharray="none"
                        d="M12 10L15 13L12 16"
                        stroke="inherit"
                        fill="none"
                        strokeOpacity={0.64}
                    />
                </svg>

                <div
                    className={`${styles.progressOpacity}  ${tcls(
                        'bg-gradient-to-r',
                        'from-transparent',
                        'to-light',
                        'to-40%',
                        'grid-area-1-1',
                        'w-full',
                        'h-full',
                        'dark:from-transparent',
                        'dark:to-dark/10',
                    )}`}
                ></div>
            </div>

            {/* Table: */}
            <table className={tcls('w-full', 'grid-area-1-1', 'table-auto')}>
                {withHeader ? (
                    <thead>
                        <tr className={tcls(tableTR)}>
                            {view.columns.map((column) => {
                                const columnWidth = view.columnWidths?.[column];
                                const alignment = getColumnAlignment(block.data.definition[column]);

                                return (
                                    <th
                                        key={column}
                                        className={tcls(
                                            tableTH,
                                            'align-middle',
                                            'text-balance',
                                            'border-b',
                                            'border-b-dark/5',
                                            'text-left',
                                            'text-xs',
                                            'lg:text-base',
                                            'dark:border-l-light/2',
                                            'dark:border-b-light/4',
                                            alignment === 'right' ? 'text-right' : null,
                                            alignment === 'center' ? 'text-center' : null,
                                        )}
                                        style={columnWidth ? { width: columnWidth } : undefined}
                                    >
                                        {block.data.definition[column].title}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                ) : null}
                <tbody className={tcls('[&>*+*]:border-t')}>
                    {records.map((record) => {
                        return <RecordRow key={record[0]} {...props} record={record} />;
                    })}
                </tbody>
            </table>
        </div>
    );
}
