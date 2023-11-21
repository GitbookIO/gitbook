import IconAlertCircle from '@geist-ui/icons/alertCircle';
import IconAlertTriangle from '@geist-ui/icons/alertTriangle';
import IconCheckInCircle from '@geist-ui/icons/checkInCircle';
import IconInfo from '@geist-ui/icons/info';
import { DocumentBlockHint } from '@gitbook/api';

import { ClassValue, tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';
import { getBlockTextStyle } from './spacing';

export function Hint(props: BlockProps<DocumentBlockHint>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;
    const hintStyle = HINT_STYLES[block.data.style];
    const firstLine = getBlockTextStyle(block.nodes[0]);

    return (
        <div
            className={tcls(
                'flex',
                'flex-row',
                'px-4',
                'py-4',
                'transition-colors',
                'rounded',
                'border-l-4',
                hintStyle.style,
                style,
            )}
        >
            <div
                className={tcls(
                    'flex',
                    'items-center',
                    'justify-center',
                    'pr-3',

                    firstLine.lineHeight,
                    hintStyle.iconStyle,
                )}
            >
                <hintStyle.icon className={tcls('w-5', 'h-5')} />
            </div>
            <Blocks
                {...contextProps}
                ancestorBlocks={[...ancestorBlocks, block]}
                nodes={block.nodes}
                style={['flex-1', 'space-y-8']}
            />
        </div>
    );
}

const HINT_STYLES: {
    [style in DocumentBlockHint['data']['style']]: {
        icon: React.ComponentType<{ className?: string }>;
        iconStyle: ClassValue;
        style: ClassValue;
    };
} = {
    info: {
        icon: IconInfo,
        iconStyle: ['text-current'],
        style: ['border-dark/2', 'bg-dark/2', 'dark:bg-light/1', 'dark:border-light/3'],
    },
    warning: {
        icon: IconAlertCircle,
        iconStyle: ['text-yellow, dark:text-yellow/1, dark:text-yellow/8'],
        style: ['border-yellow/4', 'bg-yellow', 'dark:bg-yellow/1'],
    },
    danger: {
        icon: IconAlertTriangle,
        iconStyle: ['text-pomegranate'],
        style: ['border-pomegranate/4', 'bg-pomegranate/2', 'dark:bg-pomegranate/1'],
    },
    success: {
        icon: IconCheckInCircle,
        iconStyle: ['text-teal'],
        style: ['border-teal/4', 'bg-teal/2', 'dark:bg-teal/2'],
    },
};
