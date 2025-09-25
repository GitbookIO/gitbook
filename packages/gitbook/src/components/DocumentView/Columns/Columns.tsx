import { tcls } from '@/lib/tailwind';
import { type DocumentBlockColumns, type Length, VerticalAlignment } from '@gitbook/api';
import React from 'react';
import type { BlockProps } from '../Block';
import { Blocks } from '../Blocks';

export function Columns(props: BlockProps<DocumentBlockColumns>) {
    const { block, style, ancestorBlocks, document, context } = props;

    const columnWidths = React.useMemo(() => {
        const widths = block.nodes.map((block) => {
            const width = block.data.width;
            return width ? getFractionalWidth(width) : 0;
        });

        const totalWidth = widths.reduce<number>((acc, width) => acc + width, 0);
        // If not all columns widths are set, distribute the remaining widths as equally as we can
        if (totalWidth < 1.0 && widths.some((width) => width === 0)) {
            const unsetWidths = widths.filter((width) => width === 0);
            let remainingWidth = 1.0 - totalWidth;
            let unsetWidthsLength = unsetWidths.length;
            widths.forEach((width, index) => {
                if (width === 0) {
                    const calculatedWidth =
                        Math.round((remainingWidth / unsetWidthsLength) * COLUMN_DIVISIONS) /
                        COLUMN_DIVISIONS;
                    widths[index] = calculatedWidth; // Assign width to empty columns
                    unsetWidthsLength--;
                    remainingWidth -= calculatedWidth;
                }
            });
        }
        return widths;
    }, [block.nodes]);

    return (
        <div
            className={tcls(
                'grid w-full grid-cols-1 gap-x-8 gap-y-4 md:grid-flow-col md:grid-cols-[repeat(var(--grid-slices),minmax(0,1fr))] md:grid-rows-1',
                style
            )}
            style={{ '--grid-slices': COLUMN_DIVISIONS } as React.CSSProperties}
        >
            {block.nodes.map((columnBlock, index) => {
                const columnWidth = columnWidths[index];
                return (
                    <Column
                        key={columnBlock.key}
                        width={
                            columnBlock.data.width ??
                            (columnWidth
                                ? { value: columnWidth * 100, unit: '%' }
                                : { value: 0, unit: '%' })
                        }
                        verticalAlignment={columnBlock.data.verticalAlignment}
                    >
                        <Blocks
                            key={columnBlock.key}
                            nodes={columnBlock.nodes}
                            document={document}
                            ancestorBlocks={[...ancestorBlocks, block, columnBlock]}
                            context={context}
                            style="group/column w-full space-y-4 *:max-w-full"
                        />
                    </Column>
                );
            })}
        </div>
    );
}

export function Column(props: {
    children?: React.ReactNode;
    width: Length;
    verticalAlignment?: VerticalAlignment;
}) {
    const { width, verticalAlignment } = props;
    const { className, style } = transformLengthToCSS(width) ?? {};
    return (
        <div
            className={tcls(
                'flex flex-col',
                (verticalAlignment === VerticalAlignment.Top || !verticalAlignment) &&
                    'justify-start',
                verticalAlignment === VerticalAlignment.Middle && 'justify-center',
                verticalAlignment === VerticalAlignment.Bottom && 'justify-end',
                className
            )}
            style={style}
        >
            {props.children}
        </div>
    );
}

const COLUMN_DIVISIONS = 12;

export function transformLengthToCSS(length: Length) {
    if (typeof length === 'number') {
        return; // not implemented yet with non-percentage lengths
    }
    if (length.unit === '%') {
        return {
            className: 'md:flex-shrink-0 md:[grid-column:var(--grid-col)]',
            style: {
                '--grid-col': `auto / span ${Math.round(length.value * 0.01 * COLUMN_DIVISIONS)}`,
            } as React.CSSProperties,
        };
    }
}

function getFractionalWidth(length: Length) {
    if (typeof length === 'number') {
        return 0;
    }
    return length.value / 100;
}
