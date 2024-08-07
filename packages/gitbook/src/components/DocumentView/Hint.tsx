import { DocumentBlockHint } from '@gitbook/api';
import { Icon, IconName } from '@gitbook/icons';
import React from 'react';

import { ClassValue, tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';
import { getBlockTextStyle } from './spacing';

export function Hint(props: BlockProps<DocumentBlockHint>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;
    const hintStyle = HINT_STYLES[block.data.style] ?? HINT_STYLES.info;
    const firstLine = getBlockTextStyle(block.nodes[0]);

    return (
        <div
            className={tcls(
                'px-4',
                'py-4',
                'transition-colors',
                'rounded-md',
                'straight-corners:rounded-none',
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
                        hintStyle.iconColor,
                    )}
                >
                    <Icon icon={hintStyle.icon} className={tcls('size-4')} />
                </div>
                <Blocks
                    {...contextProps}
                    ancestorBlocks={[...ancestorBlocks, block]}
                    nodes={block.nodes}
                    blockStyle={tcls(
                        hintStyle.bodyColor,
                        // render hash icon on the other side of the heading
                        'flip-heading-hash',
                    )}
                    style={['flex-1', 'space-y-4', '[&>p]:text-sm', '[&>p]:leading-relaxed']}
                />
            </div>
        </div>
    );
}

const HINT_STYLES: {
    [style in DocumentBlockHint['data']['style']]: {
        icon: IconName;
        iconColor: ClassValue;
        bodyColor: ClassValue;
        style: ClassValue;
    };
} = {
    info: {
        icon: 'circle-info',
        iconColor: ['text-periwinkle-700', 'dark:text-periwinkle-400'],
        bodyColor: [
            '[&>a]:text-periwinkle-700',
            '[&>a:hover]:text-periwinkle-800',
            '[&>code]:bg-periwinkle-700/4',
            '[&>code]:text-inherit',
            '[&>code]:shadow-none',

            'text-periwinkle-900',

            'dark:text-periwinkle-200',
            'dark:[&>a]:text-periwinkle',
            'dark:[&>a:hover]:text-periwinkle-600',
            'dark:[&>code]:bg-periwinkle-200/2',
            'dark:[&>code]:text-inherit',
            'decoration-periwinkle-700/6',
            'dark:decoration-periwinkle/6',
        ],
        style: [
            'bg-gradient-to-b',
            'from-periwinkle/6',
            'to-periwinkle/5',
            'ring-1',
            'ring-inset',
            'ring-dark/1',
            'dark:ring-periwinkle/1',
            'dark:from-periwinkle/2',
            'dark:to-periwinkle/[0.1]',
        ],
    },
    warning: {
        icon: 'circle-exclamation',
        iconColor: ['text-yellow-800', 'dark:text-yellow'],
        bodyColor: [
            '[&>a]:text-yellow-700',
            '[&>a:hover]:text-yellow-800',
            '[&>code]:bg-yellow-600/5',
            '[&>code]:text-inherit',
            '[&>code]:shadow-none',

            'text-yellow-900',

            'dark:text-yellow-200',
            'dark:[&>a]:text-yellow',
            'dark:[&>a:hover]:text-yellow-600',
            'dark:[&>code]:bg-yellow-200/2',
            'dark:[&>code]:text-inherit',
            'decoration-yellow-700/6',
            'dark:decoration-yellow/6',
        ],
        style: [
            'bg-gradient-to-b',
            'from-yellow/6',
            'to-yellow/5',
            'ring-1',
            'ring-inset',
            'ring-dark/1',
            'dark:ring-yellow/[0.02]',
            'dark:from-yellow/[0.06]',
            'dark:to-yellow/2',
        ],
    },
    danger: {
        icon: 'triangle-exclamation',
        iconColor: ['text-pomegranate-700', 'dark:text-pomegranate-400'],
        bodyColor: [
            '[&>a]:text-pomegranate-600/9',
            '[&>a:hover]:text-pomegranate-800',
            '[&>code]:bg-pomegranate-600/4',
            '[&>code]:text-inherit',
            '[&>code]:shadow-none',

            'text-pomegranate-900',

            'dark:text-pomegranate-100',
            'dark:[&>a]:text-pomegranate',
            'dark:[&>a:hover]:text-pomegranate-600',
            'dark:[&>code]:bg-pomegranate-200/2',
            'dark:[&>code]:text-inherit',
            'decoration-pomegranate-600/6',
            'dark:decoration-pomegranate/6',
        ],
        style: [
            'bg-gradient-to-b',
            'from-pomegranate/4',
            'to-pomegranate/3',
            'ring-1',
            'ring-inset',
            'ring-dark/1',
            'dark:ring-pomegranate/1',
            'dark:from-pomegranate/2',
            'dark:to-pomegranate/3',
        ],
    },
    success: {
        icon: 'circle-check',
        iconColor: ['text-teal-700', 'dark:text-teal-400'],
        bodyColor: [
            '[&>a]:text-teal-600',
            '[&>a:hover]:text-teal-800',
            '[&>code]:bg-teal-600/4',
            '[&>code]:text-inherit',
            '[&>code]:shadow-none',

            'text-teal-800',

            'dark:text-teal-100',
            'dark:[&>a]:text-teal-400',
            'dark:[&>a:hover]:text-teal-500',
            'dark:[&>code]:bg-teal-200/2',
            'dark:[&>code]:text-inherit',
            'decoration-teal/6',
            'dark:decoration-teal/6',
        ],
        style: [
            'bg-gradient-to-b',
            'from-teal/4',
            'to-teal/3',
            'ring-1',
            'ring-inset',
            'ring-dark/1',
            'dark:ring-teal/1',
            'dark:from-teal/2',
            'dark:to-teal/3',
        ],
    },
};
