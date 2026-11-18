import type { Heading, List, ListItem, Paragraph, Root, RootContent } from 'mdast';
import { toMarkdown } from 'mdast-util-to-markdown';

/**
 * Agents truncate or skip llms.txt files past this size, so larger indexes are split into
 * scoped child files (see https://llmstxt.org/ on files at subpaths).
 */
export const LLMS_TXT_MAX_CHARACTERS = 100_000;

export type LLMsIndexNode = {
    /** A navigation level (section group, section, site space) rendered as a heading, or a page rendered as a list item. */
    kind: 'structure' | 'page';
    title: string;
    description?: string;
    /** Markdown URL of the page itself. */
    url?: string;
    /** URL of the llms.txt scoped to this node, when it can be split out. */
    indexURL?: string;
    children: LLMsIndexNode[];
};

export type LLMsIndexFile = {
    title: string;
    /** Rendered as the summary blockquote below the title. */
    summary?: string;
    /** URL this file is served at, so nodes sharing it are never collapsed into a link to itself. */
    url: string;
    nodes: LLMsIndexNode[];
    /** Appended after the index, and counted in its size. */
    footer?: string;
};

/**
 * Render an llms.txt index, collapsing the nodes that save the most space into links to
 * their own llms.txt until the file fits within the limit.
 */
export function renderLLMsIndex(
    file: LLMsIndexFile,
    limit: number = LLMS_TXT_MAX_CHARACTERS
): string {
    const collapsed = new Set<LLMsIndexNode>();
    const candidates: LLMsIndexNode[] = [];
    const visit = (node: LLMsIndexNode) => {
        // A node sharing this file's URL would collapse into a link to the file itself.
        if (node.indexURL && node.indexURL !== file.url && node.children.length > 0) {
            candidates.push(node);
        }
        node.children.forEach(visit);
    };
    file.nodes.forEach(visit);

    const ownSizes = new Map<LLMsIndexNode, number>();
    const collapsedSizes = new Map<LLMsIndexNode, number>();
    const ownSize = (node: LLMsIndexNode) =>
        getCached(ownSizes, node, () => measureNode(node, false));
    const collapsedSize = (node: LLMsIndexNode) =>
        getCached(collapsedSizes, node, () => measureNode(node, true));
    const baseSize = renderFile(file, collapsed, []).length;

    // Sizes are estimated per node to stay linear in the number of pages; the exact render
    // only runs once the estimate fits.
    while (true) {
        const sizes = new Map<LLMsIndexNode, number>();
        const sizeOf = (node: LLMsIndexNode): number => {
            const size = collapsed.has(node)
                ? collapsedSize(node)
                : node.children.reduce((total, child) => total + sizeOf(child), ownSize(node));
            sizes.set(node, size);
            return size;
        };
        const estimated = file.nodes.reduce((total, node) => total + sizeOf(node), baseSize);

        if (estimated <= limit) {
            const output = renderFile(file, collapsed, file.nodes);
            if (output.length <= limit) {
                return output;
            }
        }

        let best: LLMsIndexNode | null = null;
        let bestSaving = 0;
        for (const node of candidates) {
            const size = sizes.get(node);
            // Nodes under a collapsed ancestor weren't measured in this pass.
            if (size === undefined || collapsed.has(node)) {
                continue;
            }
            const saving = size - collapsedSize(node);
            if (saving > bestSaving) {
                best = node;
                bestSaving = saving;
            }
        }

        if (!best) {
            // Nothing left to split out: serve the smallest index we can build.
            return renderFile(file, collapsed, file.nodes);
        }
        collapsed.add(best);
    }
}

function getCached<K, V>(cache: Map<K, V>, key: K, compute: () => V): V {
    let value = cache.get(key);
    if (value === undefined) {
        value = compute();
        cache.set(key, value);
    }
    return value;
}

/**
 * Approximate the characters a node adds on its own, excluding its children.
 */
function measureNode(node: LLMsIndexNode, asCollapsed: boolean): number {
    const blocks =
        node.kind === 'structure'
            ? asCollapsed
                ? toCollapsedStructureBlocks(node, 2)
                : toStructureBlocks(node, 2, new Set(), false)
            : [toList([asCollapsed ? toCollapsedItem(node) : toPageItem(node, new Set(), false)])];
    // Nested list items are indented, which the standalone render doesn't account for.
    return toMarkdown({ type: 'root', children: blocks }, { bullet: '-' }).length + 4;
}

function renderFile(
    file: LLMsIndexFile,
    collapsed: Set<LLMsIndexNode>,
    nodes: LLMsIndexNode[]
): string {
    const tree: Root = {
        type: 'root',
        children: [
            { type: 'heading', depth: 1, children: [{ type: 'text', value: file.title }] },
            ...(file.summary
                ? [
                      {
                          type: 'blockquote' as const,
                          children: [toParagraph(file.summary)],
                      },
                  ]
                : []),
            ...toBlocks(nodes, 2, collapsed),
        ],
    };

    let output = toMarkdown(tree, { bullet: '-' });
    if (file.footer) {
        output += `\n\n---\n\n${file.footer}`;
    }
    return output;
}

/**
 * Render sibling nodes, grouping consecutive list items into a single list.
 */
function toBlocks(
    nodes: LLMsIndexNode[],
    depth: number,
    collapsed: Set<LLMsIndexNode>
): RootContent[] {
    const blocks: RootContent[] = [];
    let items: ListItem[] = [];
    const flush = () => {
        if (items.length > 0) {
            blocks.push(toList(items));
            items = [];
        }
    };

    for (const node of nodes) {
        if (node.kind === 'structure') {
            flush();
            blocks.push(
                ...(collapsed.has(node)
                    ? toCollapsedStructureBlocks(node, depth)
                    : toStructureBlocks(node, depth, collapsed, true))
            );
        } else if (collapsed.has(node)) {
            items.push(toCollapsedItem(node));
        } else {
            items.push(toPageItem(node, collapsed, true));
        }
    }
    flush();
    return blocks;
}

function toStructureBlocks(
    node: LLMsIndexNode,
    depth: number,
    collapsed: Set<LLMsIndexNode>,
    withChildren: boolean
): RootContent[] {
    return [
        {
            type: 'heading',
            depth: Math.min(depth, 6) as Heading['depth'],
            children: [{ type: 'text', value: node.title }],
        },
        ...(node.description ? [toParagraph(node.description)] : []),
        ...(withChildren ? toBlocks(node.children, depth + 1, collapsed) : []),
    ];
}

/**
 * Keep the heading so the link isn't read as part of the previous section's list.
 */
function toCollapsedStructureBlocks(node: LLMsIndexNode, depth: number): RootContent[] {
    return [
        {
            type: 'heading',
            depth: Math.min(depth, 6) as Heading['depth'],
            children: [{ type: 'text', value: node.title }],
        },
        toList([toCollapsedItem(node)]),
    ];
}

function toPageItem(
    node: LLMsIndexNode,
    collapsed: Set<LLMsIndexNode>,
    withChildren: boolean
): ListItem {
    const children: ListItem['children'] = [toLinkParagraph(node, node.url)];
    if (withChildren && node.children.length > 0) {
        children.push(
            toList(
                node.children.map((child) =>
                    collapsed.has(child)
                        ? toCollapsedItem(child)
                        : toPageItem(child, collapsed, true)
                )
            )
        );
    }
    return { type: 'listItem', spread: false, children };
}

/**
 * A page that is also a document keeps its own link, with its subtree moved to its index.
 */
function toCollapsedItem(node: LLMsIndexNode): ListItem {
    if (node.kind === 'page' && node.url) {
        return {
            type: 'listItem',
            spread: false,
            children: [
                toLinkParagraph(node, node.url),
                toList([
                    {
                        type: 'listItem',
                        spread: false,
                        children: [
                            toLinkParagraph({ title: `Pages under ${node.title}` }, node.indexURL),
                        ],
                    },
                ]),
            ],
        };
    }

    return {
        type: 'listItem',
        spread: false,
        children: [toLinkParagraph(node, node.indexURL)],
    };
}

function toLinkParagraph(
    node: Pick<LLMsIndexNode, 'title' | 'description'>,
    url: string | undefined
): Paragraph {
    const children: Paragraph['children'] = [
        url
            ? { type: 'link', url, children: [{ type: 'text', value: node.title }] }
            : { type: 'text', value: node.title },
    ];
    if (node.description) {
        children.push({ type: 'text', value: `: ${node.description}` });
    }
    return { type: 'paragraph', children };
}

function toParagraph(value: string): Paragraph {
    return { type: 'paragraph', children: [{ type: 'text', value }] };
}

function toList(children: ListItem[]): List {
    return { type: 'list', spread: false, children };
}
