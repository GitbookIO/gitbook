import type { DocumentBlockHint } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';
import { validateIconName } from '@gitbook/icons/icons';

import { Block, type BlockProps } from './Block';
import { Blocks } from './Blocks';
import { BLOCK_LINE_HEIGHT, getBlockTextKind } from './spacing';
import { getSpaceLanguage, tString } from '@/intl/server';
import { defaultLanguage } from '@/intl/translations';
import { type ClassValue, cx } from '@/lib/classnames';
import { isHeadingBlock } from '@/lib/document';

export async function Hint({
    block,
    style,
    ancestorBlocks,
    ...contextProps
}: BlockProps<DocumentBlockHint>) {
    const hintStyle = HINT_STYLES[block.data.style] ?? HINT_STYLES.info;

    const customIcon = block.data.icon;
    const icon = customIcon && validateIconName(customIcon) ? customIcon : hintStyle.icon;

    const firstNode = block.nodes[0]!;
    const firstLineHeight = BLOCK_LINE_HEIGHT[getBlockTextKind(firstNode)];
    const hasHeading = isHeadingBlock(firstNode);

    const language = contextProps.context.contentContext
        ? await getSpaceLanguage(contextProps.context.contentContext)
        : defaultLanguage;

    const label = tString(language, `hint_${block.data.style}`);

    return (
        <div
            className={cx(
                'hint',
                hasHeading && 'hint-titled',
                // Kept as utilities: `AskAIParagraphButton` matches `.hint.bg-*`.
                hasHeading ? hintStyle.containerWithHeader : hintStyle.container,
                style
            )}
            aria-label={label}
            role="note"
        >
            <div className={cx('hint-aside', hasHeading && hintStyle.header, hintStyle.iconColor)}>
                <Icon icon={icon} className={cx('hint-icon', firstLineHeight)} />
            </div>
            {hasHeading ? (
                <Block
                    style={cx(
                        'hint-heading flip-heading-hash',
                        // A utility, to beat the themed backgrounds of `.hash`.
                        '[&_.hash]:bg-transparent',
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
                blockStyle={cx(
                    hintStyle.body,
                    // render hash icon on the other side of the heading
                    'flip-heading-hash'
                )}
                // Descendant rules stay utilities so they keep beating the nested blocks' own classes.
                style="hint-content [&_.hint]:border [&_pre]:border [&_pre]:border-neutral"
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
            'links-default:[&_a:not(.button)]:text-warning',
            'links-default:[&_a:not(.button):hover]:text-warning-strong',
            'links-default:[&_a:not(.button)]:decoration-warning/6',
            'links-accent:[&_a:not(.button)]:decoration-warning',
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
            'links-default:[&_a:not(.button)]:text-danger',
            'links-default:[&_a:not(.button):hover]:text-danger-strong',
            'links-default:[&_a:not(.button)]:decoration-danger/6',
            'links-accent:[&_a:not(.button)]:decoration-danger',
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
            'links-default:[&_a:not(.button)]:text-success',
            'links-default:[&_a:not(.button):hover]:text-success-strong',
            'links-default:[&_a:not(.button)]:decoration-success/6',
            'links-accent:[&_a:not(.button)]:decoration-success',
            'decoration-success/6',
            '[&_.can-override-bg]:bg-success-active',
            '[&_.can-override-text]:text-success-strong',
        ],
        container: 'bg-success border-success',
        containerWithHeader: 'border-success-solid bg-success-subtle',
    },
};
