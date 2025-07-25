import { type ClassValue, tcls } from '@/lib/tailwind';
import type { DocumentBlockColumns, Length } from '@gitbook/api';
import type { BlockProps } from '../Block';
import { Blocks } from '../Blocks';

export function Columns(props: BlockProps<DocumentBlockColumns>) {
    const { block, style, ancestorBlocks, document, context } = props;
    return (
        <div className={tcls('flex flex-col gap-x-8 md:flex-row', style)}>
            {block.nodes.map((columnBlock) => {
                const width = columnBlock.data.width;
                const { className, style } = transformLengthToCSS(width);
                return (
                    <Column key={columnBlock.key} className={className} style={style}>
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
    className?: ClassValue;
    style?: React.CSSProperties;
}) {
    return (
        <div className={tcls('flex-col', props.className)} style={props.style}>
            {props.children}
        </div>
    );
}

function transformLengthToCSS(length: Length | undefined) {
    if (!length) {
        return { className: ['md:w-full'] }; // default to full width if no length is specified
    }

    if (typeof length === 'number') {
        return { style: undefined }; // not implemented yet with non-percentage lengths
    }

    if (length.unit === '%') {
        return {
            className: [
                'md:shrink-0',
                COLUMN_WIDTHS[Math.round(length.value * 0.01 * (COLUMN_WIDTHS.length - 1))],
            ],
        };
    }

    return { style: undefined }; // not implemented yet with non-percentage lengths
}

// Tailwind CSS classes for column widths.
// The index of the array corresponds to the percentage width of the column.
const COLUMN_WIDTHS = [
    'md:w-0',
    'md:w-1/12',
    'md:w-2/12',
    'md:w-3/12',
    'md:w-4/12',
    'md:w-5/12',
    'md:w-6/12',
    'md:w-7/12',
    'md:w-8/12',
    'md:w-9/12',
    'md:w-10/12',
    'md:w-11/12',
    'md:w-full',
];
