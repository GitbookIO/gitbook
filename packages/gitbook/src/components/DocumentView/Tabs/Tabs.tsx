import type { DocumentBlockTabs } from '@gitbook/api';
import type { IconName } from '@gitbook/icons';
import { validateIconName } from '@gitbook/icons/icons';

import type { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { DynamicTabs } from './DynamicTabs';
import { generateSelectCSS, selectSetClassName, slugifySelectValue } from '@/lib/select';
import { tcls } from '@/lib/tailwind';

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
    // When printing we show every tab, one after another, so there's no selection to resolve — skip
    // the generated stylesheet entirely (each single-tab group's pane is its own default and stays
    // visible on its own).
    if (context.mode === 'print') {
        return tabs.map((tab) => (
            <DynamicTabs
                key={tab.id}
                tabs={[tab]}
                setClassName={selectSetClassName([tab.slug])}
                className={tcls(style)}
            />
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
 * Stylesheet that resolves which pane a tab group shows, purely in CSS (see generateSelectCSS).
 * Byte-identical for every visitor, so it has no cache impact.
 *
 * `href` + `precedence` opt into React's stylesheet hoisting: the tag is moved to `<head>` (out of
 * the content flow, so sibling/child selectors like Tailwind's `space-y-*` never count it as a
 * phantom node) and deduped by `href`, so identical option-sets across the page share one sheet.
 */
function SelectGroupStyle({ slugs }: { slugs: string[] }) {
    const css = generateSelectCSS(slugs);
    if (!css) {
        return null;
    }
    return (
        <style href={selectSetClassName(slugs)} precedence="high">
            {css}
        </style>
    );
}

/**
 * Derive a `select` slug for each tab from its title. Untitled tabs fall back to their (stable) id
 * so they stay selectable.
 *
 * Same-named tabs deliberately share a slug — selecting one syncs every tab of that name, here and
 * on other pages, which is the whole point of name-based selection. We don't disambiguate duplicates
 * with a positional suffix: that would desync the duplicate and make a stored selection retarget
 * whenever tabs are renamed or reordered.
 */
function withSelectSlugs<T extends { id: string; title: string }>(
    items: T[]
): (T & { slug: string })[] {
    return items.map((item) => ({
        ...item,
        slug: slugifySelectValue(item.title) || slugifySelectValue(item.id) || item.id,
    }));
}
