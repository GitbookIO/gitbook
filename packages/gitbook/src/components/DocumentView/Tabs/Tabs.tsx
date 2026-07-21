import type { DocumentBlockTabs } from '@gitbook/api';
import type { IconName } from '@gitbook/icons';
import { validateIconName } from '@gitbook/icons/icons';
import { Fragment } from 'react';

import { generateSelectCSS, selectSetClassName, slugifySelectValue } from '@/lib/select';
import { tcls } from '@/lib/tailwind';

import type { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { DynamicTabs } from './DynamicTabs';

export function Tabs(props: BlockProps<DocumentBlockTabs>) {
    const { block, ancestorBlocks, document, style, context } = props;

    if (!block.key) {
        throw new Error('Tabs block is missing a key');
    }

    const items = block.nodes.map((tab) => {
        if (!tab.key) {
            throw new Error('Tab block is missing a key');
        }

        const icon: IconName | undefined =
            tab.data.icon && validateIconName(tab.data.icon) ? tab.data.icon : undefined;

        return {
            id: tab.meta?.id ?? tab.key,
            title: tab.data.title ?? '',
            icon,
            body: (
                <Blocks
                    key={tab.key}
                    nodes={tab.nodes}
                    document={document}
                    ancestorBlocks={[...ancestorBlocks, block, tab]}
                    context={context}
                    blockStyle="flip-heading-hash"
                    style="w-full space-y-4"
                />
            ),
        };
    });

    const tabs = withSelectSlugs(items);

    // When printing, we display the tabs one after the other, each as its own single-tab group so
    // every variant is visible (no selection to hide them).
    if (context.mode === 'print') {
        return tabs.map((tab) => (
            <Fragment key={tab.id}>
                <SelectGroupStyle slugs={[tab.slug]} />
                <DynamicTabs
                    tabs={[tab]}
                    setClassName={selectSetClassName([tab.slug])}
                    className={tcls(style)}
                />
            </Fragment>
        ));
    }

    const slugs = tabs.map((tab) => tab.slug);

    return (
        <>
            <SelectGroupStyle slugs={slugs} />
            <DynamicTabs
                tabs={tabs}
                setClassName={selectSetClassName(slugs)}
                className={tcls(style)}
            />
        </>
    );
}

/**
 * Inline stylesheet that resolves which pane a tab group shows, purely in CSS (see
 * generateSelectCSS). Byte-identical for every visitor, so it has no cache impact.
 */
function SelectGroupStyle({ slugs }: { slugs: string[] }) {
    const css = generateSelectCSS(slugs);
    if (!css) {
        return null;
    }
    return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

/**
 * Derive a `select` slug for each tab from its title. Untitled tabs fall back to their id so they
 * stay selectable, and slugs that collide within a group are suffixed so panes remain distinct
 * (cross-group syncing still keys off the base slug).
 */
function withSelectSlugs<T extends { id: string; title: string }>(
    items: T[]
): Array<T & { slug: string }> {
    const counts = new Map<string, number>();
    return items.map((item) => {
        const base = slugifySelectValue(item.title) || slugifySelectValue(item.id) || item.id;
        const seen = counts.get(base) ?? 0;
        counts.set(base, seen + 1);
        return { ...item, slug: seen === 0 ? base : `${base}-${seen + 1}` };
    });
}
