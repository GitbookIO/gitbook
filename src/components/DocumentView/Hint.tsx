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
                'px-4',
                'py-4',
                'transition-colors',
                'rounded-md',
                hintStyle.style,
                style,
            )}
        >
            <div className={tcls('flex', 'flex-row')}>
                <div
                    className={tcls(
                        'flex',
                        'items-start',
                        'justify-center',
                        'pr-3',
                        'mt-0.5',
                        firstLine.lineHeight,
                        hintStyle.anchorColor,
                    )}
                >
                    <RenderIcon />
                </div>
                <Blocks
                    {...contextProps}
                    ancestorBlocks={[...ancestorBlocks, block]}
                    nodes={block.nodes}
                    blockStyle={tcls(hintStyle.anchorColor)}
                    style={['flex-1', 'space-y-4', '[&>p]:text-sm']}
                />
            </div>
        </div>
    );
}

const HINT_STYLES: {
    [style in DocumentBlockHint['data']['style']]: {
        icon: () => React.ReactNode;
        anchorColor: ClassValue;
        style: ClassValue;
    };
} = {
    info: {
        icon: InfoIcon,
        anchorColor: [
            '[&>a]:text-dark/9',
            '[&>a:hover]:text-vanta',

            'fill-dark',
            'dark:[&>a]:text-light',
            'dark:[&>a:hover]:text-light/8',
            'decoration-dark/6',
            'dark:decoration-light/5',
            'dark:fill-light',
        ],
        style: [
            'bg-gradient-to-b',
            'from-dark/2',
            'to-dark/1',
            'ring-1',
            'ring-inset',
            'ring-dark/1',
            'dark:ring-light/[0.02]',
            'dark:from-light/[0.03]',
            'dark:to-light/1',
        ],
    },
    warning: {
        icon: WarningIcon,
        anchorColor: [
            '[&>a]:text-yellow-700',
            '[&>a:hover]:text-yellow-800',
            '[&>code]:bg-yellow-600/5',
            '[&>code]:text-inherit',
            '[&>code]:shadow-none',

            'text-yellow-900',

            'fill-yellow-800',
            'dark:text-yellow-200',
            'dark:[&>a]:text-yellow',
            'dark:[&>a:hover]:text-yellow-600',
            'dark:[&>code]:bg-yellow-200/2',
            'dark:[&>code]:text-inherit',
            'decoration-yellow-700/6',
            'dark:decoration-yellow/6',
            'dark:fill-yellow',
        ],
        style: [
            'bg-gradient-to-b',
            'from-yellow/6',
            'to-yellow/5',
            'ring-1',
            'ring-inset',
            'ring-dark/1',
            'dark:ring-yellow/[0.02]',
            'dark:from-yellow/1',
            'dark:to-yellow/2',
        ],
    },
    danger: {
        icon: DangerIcon,
        anchorColor: [
            '[&>a]:text-pomegranate-600/9',
            '[&>a:hover]:text-pomegranate-800',
            '[&>code]:bg-pomegranate-600/4',
            '[&>code]:text-inherit',
            '[&>code]:shadow-none',

            'text-pomegranate-900',

            'fill-pomegranate-700',
            'dark:text-pomegranate-100',
            'dark:[&>a]:text-pomegranate',
            'dark:[&>a:hover]:text-pomegranate-600',
            'dark:[&>code]:bg-pomegranate-200/2',
            'dark:[&>code]:text-inherit',
            'decoration-pomegranate-600/6',
            'dark:decoration-pomegranate/6',
            'dark:fill-pomegranate-400',
        ],
        style: [
            'bg-gradient-to-b',
            'from-pomegranate/4',
            'to-pomegranate/3',
            'ring-1',
            'ring-inset',
            'ring-dark/1',
            'dark:ring-pomegranate/1',
            'dark:from-pomegranate/1',
            'dark:to-pomegranate/2',
        ],
    },
    success: {
        icon: SuccessIcon,
        anchorColor: [
            '[&>a]:text-teal-600',
            '[&>a:hover]:text-teal-700',
            '[&>code]:bg-teal-600/4',
            '[&>code]:text-inherit',
            '[&>code]:shadow-none',

            'text-teal-800',
            'fill-teal-700',
            'stroke-teal-700',

            'dark:text-teal-200',
            'dark:[&>a]:text-teal-400',
            'dark:[&>a:hover]:text-teal-700',
            'dark:[&>code]:bg-teal-200/2',
            'dark:[&>code]:text-inherit',
            'decoration-teal/6',
            'dark:decoration-teal/6',
            'dark:fill-teal-400',
            'dark:stroke-teal-400',
        ],
        style: [
            'bg-gradient-to-b',
            'from-teal/4',
            'to-teal/3',
            'ring-1',
            'ring-inset',
            'ring-dark/1',
            'dark:ring-teal/1',
            'dark:from-teal/1',
            'dark:to-teal/2',
        ],
    },
};

function InfoIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            className={tcls('overflow-visible')}
        >
            <circle cx="8" cy="4.5" r="1.5" fill="inherit" fillOpacity="0.64" stroke="none" />
            <circle
                cx="8"
                cy="4.5"
                r="1.5"
                fill="inherit"
                fillOpacity="0.12"
                stroke="none"
                className={tcls(
                    'animate-[pingAlt_8s_ease_infinite_forwards]',
                    'origin-[8px_4.5px]',
                    'w-[4px]',
                    'h-[4px]',
                )}
            />
            <rect
                x="7"
                y="7"
                width="2"
                rx="1"
                height="6"
                fill="inherit"
                fillOpacity="0.64"
                stroke="none"
            />
            <circle cx="8" cy="8" r="8" fill="inherit" fillOpacity="0.12" stroke="none" />
        </svg>
    );
}

function WarningIcon() {
    return (
        <svg width="18" height="16" viewBox="0 0 18 16" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M7.2546 1C8.03034 -0.333333 9.96967 -0.333333 10.7454 1L17.727 13C18.5027 14.3333 17.533 16 15.9816 16H2.01842C0.466953 16 -0.502711 14.3333 0.27302 13L7.2546 1Z"
                fill="inherit"
                fillOpacity="0.16"
                stroke="none"
            />
            <rect
                x="8"
                y="4"
                width="2"
                height="6"
                rx="1"
                fill="inherit"
                fillOpacity="0.92"
                stroke="none"
                className={tcls(
                    'animate-[wag_4s_ease_infinite_forwards]',
                    '[animation-composition:accumulate]',
                    'origin-[9px_12.5px]',
                    'will-change-transform',
                )}
            />
            <circle cx="9" cy="12.5" r="1.5" fill="inherit" fillOpacity="0.92" stroke="none" />
        </svg>
    );
}

function DangerIcon() {
    return (
        <svg width="16" height="18" viewBox="0 0 16 18" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M6.9736 0.277489C7.60874 -0.0924963 8.39126 -0.0924962 9.0264 0.277489L14.9736 3.74189C15.6087 4.11187 16 4.79563 16 5.5356V12.4644C16 13.2044 15.6087 13.8881 14.9736 14.2581L9.0264 17.7225C8.39126 18.0925 7.60874 18.0925 6.9736 17.7225L1.0264 14.2581C0.391261 13.8881 0 13.2044 0 12.4644V5.5356C0 4.79563 0.391262 4.11187 1.0264 3.74189L6.9736 0.277489Z"
                fill="inherit"
                fillOpacity="0.16"
                stroke="none"
            />
            <rect
                x="7"
                y="4"
                width="2"
                height="6"
                rx="1"
                fill="inherit"
                fillOpacity="0.8"
                stroke="none"
            />
            <circle
                cx="8"
                cy="12.5"
                r="1.5"
                fill="inherit"
                fillOpacity="1"
                stroke="none"
                className={tcls('animate-[pulse_1s_ease_infinite_forwards]')}
            />
        </svg>
    );
}

function SuccessIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <rect width="16" height="16" rx="3" fill="inherit" fillOpacity="0.16" stroke="none" />
            <path
                className={tcls('animate-[stroke_8s_ease_infinite_forwards]')}
                d="M4 8.5L6.5 11L12 5.5"
                stroke="inherit"
                fill="none"
                strokeOpacity="0.8"
                strokeWidth="2"
                strokeLinecap="round"
                pathLength="100"
            />
            <path
                d="M4 8.5L6.5 11L12 5.5"
                stroke="inherit"
                fill="none"
                strokeOpacity="0.16"
                strokeWidth="2"
                strokeLinecap="round"
                pathLength="100"
            />
        </svg>
    );
}
