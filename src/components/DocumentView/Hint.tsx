import IconAlertCircle from '@geist-ui/icons/alertCircle';
import IconAlertTriangle from '@geist-ui/icons/alertTriangle';
import IconCheckInCircle from '@geist-ui/icons/checkInCircle';
import IconInfo from '@geist-ui/icons/info';
import { DocumentBlockHint } from '@gitbook/api';
import React from 'react';

import { ClassValue, tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';
import { getBlockTextStyle } from './spacing';

export function Hint(props: BlockProps<DocumentBlockHint>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;
    const hintStyle = HINT_STYLES[block.data.style];
    const firstLine = getBlockTextStyle(block.nodes[0]);
    const RenderIcon = HINT_STYLES[block.data.style].icon;

    return (
        <div
            className={tcls(
                'flex',
                'flex-row',
                'px-4',
                'py-4',
                'transition-colors',
                'rounded',
                'border-b-[1px]',
                'dark:border-t-[1px]',
                'dark:border-b-0',

                /*                 'shadow-1xs', */
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
                {/*  <hintStyle.icon className={tcls('w-5', 'h-5')} /> */}

                <RenderIcon />
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

const SuccessIcon = () => (
    <div
        className={tcls(
            'flex',
            'flex-col',
            'w-[17px]',
            'h-[17px]',
            'bg-white',
            'rounded-full',
            'justify-center',
            'items-center',
            'dark:bg-light/3',
        )}
    >
        <div
            className={tcls(
                'grid',
                'justify-items-center',
                'items-center',
                'w-[5px]',
                'h-[5px]',
                'top-[-0.5px]',
                'relative',
            )}
        >
            <div
                className={tcls(
                    'animate-[pingAlt_8s_ease_infinite_forwards]',
                    'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-dark/2 from-0% via-dark/2 via-55% to-dark to-100%',
                    'grid-area-1-1',
                    'w-[5px]',
                    'h-[5px]',
                    'rounded',
                    'dark:from-light/2 dark:via-light/2 dark:to-light/8',
                )}
            ></div>
            <div
                className={tcls(
                    'animate-[pulse_8s_ease_infinite]',
                    'grid-area-1-1',
                    'w-[3px]',
                    'h-[3px]',
                    'bg-dark/7',
                    'rounded',
                    'dark:bg-light/8',
                )}
            ></div>
        </div>
        <div
            className={tcls(
                'animate-[pulse_8s_ease_infinite]',
                'w-[3px]',
                'h-[7px]',
                'bg-dark/7',
                'rounded',
                'dark:bg-light/8',
            )}
        ></div>
    </div>
);
const WarningIcon = () => SuccessIcon();
const DangerIcon = () => SuccessIcon();
const InfoIcon = () => SuccessIcon();

const HINT_STYLES: {
    [style in DocumentBlockHint['data']['style']]: {
        icon: React.ComponentType;
        iconStyle: ClassValue;
        style: ClassValue;
    };
} = {
    info: {
        icon: SuccessIcon,
        iconStyle: ['text-current'],
        style: ['border-dark/1', 'bg-dark/2', 'dark:bg-light/1', 'dark:border-light/1'],
    },
    warning: {
        icon: WarningIcon,
        iconStyle: ['text-yellow, dark:text-yellow/1, dark:text-yellow/8'],
        style: ['border-yellow/6', 'bg-yellow/6', 'dark:bg-yellow/1', 'dark:border-yellow/2'],
    },
    danger: {
        icon: DangerIcon,
        iconStyle: ['text-pomegranate'],
        style: [
            'border-pomegranate/2',
            'bg-pomegranate/2',
            'dark:bg-pomegranate/1',
            'dark:border-pomegranate/3',
        ],
    },
    success: {
        icon: InfoIcon,
        iconStyle: ['text-teal'],
        style: ['border-teal/2', 'bg-teal/2', 'dark:bg-teal/2'],
    },
};
