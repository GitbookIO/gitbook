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
                'hint',
                'p-4',
                'transition-colors',
                'rounded-md',
                'straight-corners:rounded-none',
                hintStyle.style,
                style,
            )}
        >
            <div className={tcls('flex', 'flex-row')}>
                <Icon
                    icon={hintStyle.icon}
                    className={tcls(
                        'size-5',
                        'mr-4',
                        'mt-0.5',
                        firstLine.lineHeight,
                        hintStyle.iconColor,
                    )}
                />
                <Blocks
                    {...contextProps}
                    ancestorBlocks={[...ancestorBlocks, block]}
                    nodes={block.nodes}
                    blockStyle={tcls(
                        hintStyle.bodyColor,
                        // render hash icon on the other side of the heading
                        'flip-heading-hash',
                    )}
                    style={['flex-1', 'space-y-4', '[&_.hint]:border', '[&_pre]:border']}
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
        iconColor: ['text-primary-500', 'dark:text-primary-400'],
        bodyColor: [
            '[&_a]:text-primary-500',
            '[&_a:hover]:text-primary-600',
            'dark:[&_a]:text-primary-400',
            'dark:[&_a:hover]:text-primary-300',
        ],
        style: [
            'bg-dark-1/1',
            'border-dark/3',
            'dark:bg-light/1',
            'dark:border-light/3',
            '[&_.can-override-bg]:bg-dark-1/2',
            '[&_.can-override-text]:text-dark',
            'dark:[&_.can-override-bg]:bg-light/2',
            'dark:[&_.can-override-text]:text-light',
        ],
    },
    warning: {
        icon: 'circle-exclamation',
        iconColor: ['text-amber-500', 'dark:text-orange-400'], // Darker shades of orange-* mismatch with lighter shades, so in light mode we use amber text on top of orange bg.
        bodyColor: [
            '[&_a]:text-orange-800',
            '[&_a:hover]:text-orange-900',
            'dark:[&_a]:text-orange-400',
            'dark:[&_a:hover]:text-orange-300',
            '[&_.can-override-bg]:bg-orange-500/3',
            '[&_.can-override-text]:text-orange-800',
            'dark:[&_.can-override-text]:text-orange-400',
            'decoration-orange-800/6',
            'dark:decoration-orange-400/6',
        ],
        style: ['bg-orange-500/2', 'border-orange-500/4'],
    },
    danger: {
        icon: 'triangle-exclamation',
        iconColor: ['text-red-500', 'dark:text-red-400'],
        bodyColor: [
            '[&_a]:text-red-800',
            '[&_a:hover]:text-red-900',
            'dark:[&_a]:text-red-400',
            'dark:[&_a:hover]:text-red-300',
            '[&_.can-override-bg]:bg-red-500/3',
            '[&_.can-override-text]:text-red-400',
            'decoration-red-800/6',
            'dark:decoration-red-400/6',
        ],
        style: ['bg-red-500/2', 'border-red-500/4'],
    },
    success: {
        icon: 'circle-check',
        iconColor: ['text-green-500', 'dark:text-green-400'],
        bodyColor: [
            '[&_a]:text-green-800',
            '[&_a:hover]:text-green-900',
            'dark:[&_a]:text-green-400',
            'dark:[&_a:hover]:text-green-300',
            '[&_.can-override-bg]:bg-green-500/3',
            '[&_.can-override-text]:text-green-800',
            'dark:[&_.can-override-text]:text-green-400',
            'decoration-green-800/6',
            'dark:decoration-green-400/6',
        ],
        style: ['bg-green-500/2', 'border-green-500/4'],
    },
};
