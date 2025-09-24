import type { DocumentBlockHint } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';

import { type ClassValue, tcls } from '@/lib/tailwind';

import { getSpaceLanguage, tString } from '@/intl/server';
import { languages } from '@/intl/translations';
import { Block, type BlockProps } from './Block';
import { Blocks } from './Blocks';
import { getBlockTextStyle } from './spacing';

export function Hint({
    block,
    style,
    ancestorBlocks,
    ...contextProps
}: BlockProps<DocumentBlockHint>) {
    const hintStyle = HINT_STYLES[block.data.style] ?? HINT_STYLES.info;
    const firstNode = block.nodes[0]!;
    const firstLine = getBlockTextStyle(firstNode);
    const hasHeading = ['heading-1', 'heading-2', 'heading-3'].includes(firstNode.type);

    const language = contextProps.context.contentContext
        ? getSpaceLanguage(contextProps.context.contentContext)
        : languages.en;

    const label = tString(language, `hint_${block.data.style}`);

    return (
        <div
            className={tcls(
                'hint',
                'transition-colors',
                'rounded-md',
                hasHeading ? 'rounded-l-sm' : null,
                'straight-corners:rounded-none',
                'circular-corners:rounded-xl',
                'overflow-hidden',
                hasHeading ? ['border-l-2', hintStyle.containerWithHeader] : hintStyle.container,

                'text-sm',

                'grid',
                'grid-cols-[auto_1fr]',
                hasHeading ? 'grid-rows-[auto_auto]' : '',

                style
            )}
            aria-label={label}
            role="note"
        >
            <div
                className={tcls(
                    'py-4',
                    'pl-4',
                    hasHeading ? hintStyle.header : null,
                    hintStyle.iconColor
                )}
            >
                <Icon
                    icon={hintStyle.icon}
                    className={tcls('size-[1.2em]', 'mt-px', firstLine.lineHeight)}
                />
            </div>
            {hasHeading ? (
                <Block
                    style={tcls(
                        'w-full items-start py-4! pl-3 text-[1em] *:flex-none',
                        // Heading hash styles
                        'flip-heading-hash pr-8',
                        hintStyle.header
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
                    'p-4',
                    'pl-3',
                    'empty:p-0',
                    '-row-end-1',
                    '-col-end-1',
                    'space-y-3',
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
            'bg-info border-info theme-muted-tint:bg-info-solid/2 [html.sidebar-filled.theme-bold.tint_&]:bg-info-solid/2',
        containerWithHeader: 'border-info-solid bg-info-subtle',
    },
    warning: {
        icon: 'circle-exclamation',
        iconColor: 'text-warning-subtle contrast-more:text-warning',
        header: 'bg-warning-active',
        body: [
            'text-neutral-strong',
            'links-default:[&_a]:text-warning',
            'links-default:[&_a:hover]:text-warning-strong',
            'links-default:[&_a]:decoration-warning/6',
            'links-accent:[&_a]:decoration-warning',
            'decoration-warning/6',
            '[&_.can-override-bg]:bg-warning-active',
            '[&_.can-override-text]:text-warning-strong',
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
            'links-default:[&_a]:text-danger',
            'links-default:[&_a:hover]:text-danger-strong',
            'links-default:[&_a]:decoration-danger/6',
            'links-accent:[&_a]:decoration-danger',
            'decoration-danger/6',
            '[&_.can-override-bg]:bg-danger-active',
            '[&_.can-override-text]:text-danger-strong',
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
            'links-default:[&_a]:text-success',
            'links-default:[&_a:hover]:text-success-strong',
            'links-default:[&_a]:decoration-success/6',
            'links-accent:[&_a]:decoration-success',
            'decoration-success/6',
            '[&_.can-override-bg]:bg-success-active',
            '[&_.can-override-text]:text-success-strong',
        ],
        container: 'bg-success border-success',
        containerWithHeader: 'border-success-solid bg-success-subtle',
    },
};
