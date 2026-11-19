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
    let output = renderFile(file, collapsed);
    if (output.length <= limit) {
        return output;
    }

    const parents = new Map<LLMsIndexNode, LLMsIndexNode>();
    const sizes = new Map<LLMsIndexNode, number>();
    const collapsedSizes = new Map<LLMsIndexNode, number>();
    const versions = new Map<LLMsIndexNode, number>();
    const orders = new Map<LLMsIndexNode, number>();
    // Ties go to the node that comes first in the file.
    const queue = new MaxHeap<QueueEntry>((a, b) => a.saving - b.saving || b.order - a.order);

    const enqueue = (node: LLMsIndexNode) => {
        if (!collapsedSizes.has(node)) {
            return;
        }
        queue.push({
            node,
            order: orders.get(node)!,
            version: versions.get(node) ?? 0,
            saving: sizes.get(node)! - collapsedSizes.get(node)!,
        });
    };

    const measure = (node: LLMsIndexNode, position: Position): number => {
        const childPosition: Position =
            node.kind === 'structure'
                ? { headingDepth: position.headingDepth + 1, listDepth: 0 }
                : { headingDepth: position.headingDepth, listDepth: position.listDepth + 1 };
        orders.set(node, orders.size);
        let size = measureNode(node, position, false);
        for (const child of node.children) {
            parents.set(child, node);
            size += measure(child, childPosition);
        }
        sizes.set(node, size);
        // A node sharing this file's URL would collapse into a link to the file itself.
        if (node.indexURL && node.indexURL !== file.url && node.children.length > 0) {
            collapsedSizes.set(node, measureNode(node, position, true));
            enqueue(node);
        }
        return size;
    };
    for (const node of file.nodes) {
        measure(node, { headingDepth: 2, listDepth: 0 });
    }

    // Savings are estimates; the total starts from the exact render and is corrected by each
    // render that turns out larger than estimated.
    let total = output.length;
    while (true) {
        const entry = queue.pop();
        if (!entry) {
            // Nothing left to split out: serve the smallest index we can build.
            return renderFile(file, collapsed);
        }
        const { node } = entry;
        if (
            entry.saving <= 0 ||
            collapsed.has(node) ||
            entry.version !== (versions.get(node) ?? 0) ||
            hasCollapsedAncestor(node, parents, collapsed)
        ) {
            continue;
        }

        collapsed.add(node);
        total -= entry.saving;
        for (let parent = parents.get(node); parent; parent = parents.get(parent)) {
            sizes.set(parent, sizes.get(parent)! - entry.saving);
            versions.set(parent, (versions.get(parent) ?? 0) + 1);
            enqueue(parent);
        }

        if (total <= limit) {
            output = renderFile(file, collapsed);
            if (output.length <= limit) {
                return output;
            }
            total = output.length;
        }
    }
}

type Position = { headingDepth: number; listDepth: number };

type QueueEntry = { node: LLMsIndexNode; order: number; version: number; saving: number };

function hasCollapsedAncestor(
    node: LLMsIndexNode,
    parents: Map<LLMsIndexNode, LLMsIndexNode>,
    collapsed: Set<LLMsIndexNode>
): boolean {
    for (let parent = parents.get(node); parent; parent = parents.get(parent)) {
        if (collapsed.has(parent)) {
            return true;
        }
    }
    return false;
}

/**
 * Approximate the characters a node adds on its own, excluding its children.
 */
function measureNode(node: LLMsIndexNode, position: Position, asCollapsed: boolean): number {
    const blocks =
        node.kind === 'structure'
            ? asCollapsed
                ? toCollapsedStructureBlocks(node, position.headingDepth)
                : toStructureBlocks(node, position.headingDepth, new Set(), false)
            : [toList([asCollapsed ? toCollapsedItem(node) : toPageItem(node, new Set(), false)])];
    const markdown = toMarkdown({ type: 'root', children: blocks }, { bullet: '-' });
    // In the file, blocks are separated by a blank line and nested list items are indented.
    const lines = markdown.split('\n').length - 1;
    return (
        markdown.length +
        (node.kind === 'structure' ? blocks.length : lines * 2 * position.listDepth)
    );
}

/**
 * Binary heap returning the largest entry first.
 */
class MaxHeap<T> {
    private items: T[] = [];

    constructor(private compare: (a: T, b: T) => number) {}

    push(item: T) {
        const items = this.items;
        items.push(item);
        let index = items.length - 1;
        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (this.compare(items[index]!, items[parent]!) <= 0) {
                break;
            }
            [items[index], items[parent]] = [items[parent]!, items[index]!];
            index = parent;
        }
    }

    pop(): T | undefined {
        const items = this.items;
        const top = items[0];
        const last = items.pop();
        if (items.length > 0 && last !== undefined) {
            items[0] = last;
            let index = 0;
            while (true) {
                const left = index * 2 + 1;
                const right = left + 1;
                let largest = index;
                if (left < items.length && this.compare(items[left]!, items[largest]!) > 0) {
                    largest = left;
                }
                if (right < items.length && this.compare(items[right]!, items[largest]!) > 0) {
                    largest = right;
                }
                if (largest === index) {
                    break;
                }
                [items[index], items[largest]] = [items[largest]!, items[index]!];
                index = largest;
            }
        }
        return top;
    }
}

function renderFile(file: LLMsIndexFile, collapsed: Set<LLMsIndexNode>): string {
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
            ...toBlocks(file.nodes, 2, collapsed),
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
    // Parsers expect every list line to be a link, so groups link to their own index.
    const children: ListItem['children'] = [toLinkParagraph(node, node.url ?? node.indexURL)];
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
