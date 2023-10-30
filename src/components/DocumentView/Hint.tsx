import { ClassValue, tcls } from '@/lib/tailwind';
import { BlockProps } from './Block';
import { Blocks } from './Blocks';
import { DocumentBlockHint } from '@gitbook/api';
import IconInfo from '@geist-ui/icons/info';
import IconAlertTriangle from '@geist-ui/icons/alertTriangle';
import IconAlertCircle from '@geist-ui/icons/alertCircle';
import IconCheckInCircle from '@geist-ui/icons/checkInCircle';
import { getBlockTextStyle } from './spacing';

export function Hint(props: BlockProps<DocumentBlockHint>) {
    const { block, style, ...contextProps } = props;
    const hintStyle = HINT_STYLES[block.data.style];
    const firstLine = getBlockTextStyle(block.nodes[0]);

    return (
        <div
            className={tcls(
                'flex',
                'flex-row',
                'px-4',
                'py-4',
                'bg-slate-50',
                'dark:bg-slate-900',
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
            <Blocks {...contextProps} nodes={block.nodes} style={['flex-1']} />
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
        iconStyle: ['text-blue-500'],
        style: ['border-blue-500'],
    },
    warning: {
        icon: IconAlertCircle,
        iconStyle: ['text-orange-500'],
        style: ['border-orange-500'],
    },
    danger: {
        icon: IconAlertTriangle,
        iconStyle: ['text-red-500'],
        style: ['border-red-500'],
    },
    success: {
        icon: IconCheckInCircle,
        iconStyle: ['text-green-500'],
        style: ['border-green-500'],
    },
};
