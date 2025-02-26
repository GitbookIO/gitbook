import type { DocumentBlockHint } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';

import { type ClassValue, tcls } from '@/lib/tailwind';

import { Block, type BlockProps } from './Block';
import { Blocks } from './Blocks';
import { getBlockTextStyle } from './spacing';

export function Hint(props: BlockProps<DocumentBlockHint>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;
    const hintStyle = HINT_STYLES[block.data.style] ?? HINT_STYLES.info;
    const firstLine = getBlockTextStyle(block.nodes[0]);

    const firstNode = block.nodes[0];
    const hasHeading = ['heading-1', 'heading-2', 'heading-3'].includes(block.nodes[0].type);

    return (
        <div
            className={tcls(
                'hint',
                'transition-colors',
                'rounded-md',
                hasHeading ? 'rounded-l' : null,
                'straight-corners:rounded-none',
                'overflow-hidden',
                hasHeading ? ['border-l-2', hintStyle.containerWithHeader] : hintStyle.container,

                'text-sm',

                'grid',
                'grid-cols-[auto_1fr]',
                hasHeading ? 'grid-rows-[auto_auto]' : '',

                style
            )}
        >
            <div
                className={tcls(
                    'py-3',
                    'pl-3',
                    '-mt-px', // Bump icon up 1px for optical alignment with heading
                    hasHeading ? hintStyle.header : null,
                    hintStyle.iconColor
                )}
            >
                <Icon
                    icon={hintStyle.icon}
                    className={tcls('size-[1.2em]', 'mt-0.5', firstLine.lineHeight)}
                />
            </div>
            {hasHeading ? (
                <Block
                    style={tcls(
                        'flip-heading-hash p-3 text-[1em] *:mt-0',
                        hasHeading ? hintStyle.header : null
                    )}
                    ancestorBlocks={[...ancestorBlocks, block]}
                    {...contextProps}
                    block={firstNode}
                />
            ) : null}
            <Blocks
                {...contextProps}
                ancestorBlocks={[...ancestorBlocks, block]}
                nodes={hasHeading ? block.nodes.slice(1) : block.nodes}
                blockStyle={tcls(
                    hintStyle.body,
                    // render hash icon on the other side of the heading
                    'flip-heading-hash'
                )}
                style={[
                    'p-3',
                    'empty:p-0',
                    '-row-end-1',
                    '-col-end-1',
                    'space-y-4',
                    '[&_.hint]:border',
                    '[&_pre]:border',
                    '[&_pre]:border-neutral',
                ]}
            />
        </div>
    );
}

const HINT_STYLES: {
    [style in DocumentBlockHint['data']['style']]: {
        icon: IconName;
        iconColor?: ClassValue;
        body?: ClassValue;
        header?: ClassValue;
        container?: ClassValue;
        containerWithHeader?: ClassValue;
    };
} = {
    info: {
        icon: 'circle-info',
        iconColor: 'text-info-subtle contrast-more:text-info',
        header: 'bg-info-active',
        body: [
            'text-neutral-strong',
            '[&_.can-override-bg]:bg-neutral-active',
            '[&_.can-override-text]:text-neutral-strong',
        ],
        container:
            'bg-neutral theme-muted:bg-neutral-base theme-bold-tint:bg-neutral-base theme-gradient:bg-neutral-12/1 border-neutral',
        containerWithHeader: 'border-info-solid bg-neutral-subtle theme-gradient:bg-neutral-12/1',
    },
    warning: {
        icon: 'circle-exclamation',
        iconColor: 'text-warning-subtle contrast-more:text-warning',
        header: 'bg-warning-active',
        body: [
            'text-neutral-strong',
            '[&_a]:text-warning',
            '[&_a:hover]:text-warning-strong',
            '[&_.can-override-bg]:bg-warning-active',
            '[&_.can-override-text]:text-warning-strong',
            'decoration-warning/6',
        ],
        container: 'bg-warning border-warning',
        containerWithHeader: 'border-warning-solid bg-warning-subtle',
    },
    danger: {
        icon: 'triangle-exclamation',
        iconColor: 'text-danger-subtle contrast-more:text-danger',
        header: 'bg-danger-active',
        body: [
            'text-neutral-strong',
            '[&_a]:text-danger',
            '[&_a:hover]:text-danger-strong',
            '[&_.can-override-bg]:bg-danger-active',
            '[&_.can-override-text]:text-danger-strong',
            'decoration-danger/6',
        ],
        container: 'bg-danger border-danger',
        containerWithHeader: 'border-danger-solid bg-danger-subtle',
    },
    success: {
        icon: 'circle-check',
        iconColor: 'text-success-subtle contrast-more:text-success',
        header: 'bg-success-active',
        body: [
            'text-neutral-strong',
            '[&_a]:text-success',
            '[&_a:hover]:text-success-strong',
            '[&_.can-override-bg]:bg-success-active',
            '[&_.can-override-text]:text-success-strong',
            'decoration-success/6',
        ],
        container: 'bg-success border-success',
        containerWithHeader: 'border-success-solid bg-success-subtle',
    },
};
