import assertNever from 'assert-never';
import type { ListItem, Paragraph, RootContent } from 'mdast';

import type { RevisionPageDocument, RevisionPageGroup, SiteSection, SiteSpace } from '@gitbook/api';

import { renderSiteAgentInstructions } from '@/lib/ask-prompt';
import {
    type GitBookSiteContext,
    type SiteStructureNode,
    checkIsRootSiteContext,
} from '@/lib/context';
import { throwIfDataError } from '@/lib/data';
import { type GitBookLinker, linkerWithMarkdownPages } from '@/lib/links';
import { type LLMsIndexNode, renderLLMsIndex } from '@/lib/llms-index';
import { joinPath } from '@/lib/paths';
import { type FlatPageEntry, type PageTreeEntry, getIndexablePageTree } from '@/lib/sitemap';
import {
    filterSiteSpacesByLocale,
    getFallbackSiteSpacePath,
    getLocalizedDescription,
    getLocalizedTitle,
    getSiteStructureSections,
    resolveSiteSpacePagePathDocumentOrGroup,
} from '@/lib/sites';

/**
 * Generate the llms.txt index for the part of the site it is served under: the whole site at
 * the root, a section, a site space, or the pages under `pagePath`.
 */
export async function serveLLMsTxt(context: GitBookSiteContext, pagePath?: string) {
    const index = await getLLMsIndex(context, pagePath);
    if (!index) {
        return new Response('No llms.txt for this path', { status: 404 });
    }

    const rootURL = getLLMsTxtURLForPath(context, '');
    const agentInstructions = renderSiteAgentInstructions(context);

    const output = renderLLMsIndex({
        title: index.title,
        summary:
            index.url === rootURL
                ? undefined
                : `This index lists part of the site. The index for the whole site is at ${rootURL}.`,
        url: index.url,
        nodes: index.nodes,
        footer: agentInstructions,
    });

    return new Response(output, {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
        },
    });
}

async function getLLMsIndex(
    context: GitBookSiteContext,
    pagePath: string | undefined
): Promise<{ title: string; url: string; nodes: LLMsIndexNode[] } | null> {
    const { site, siteSpace, linker } = context;

    if (pagePath !== undefined) {
        const resolved = resolveSiteSpacePagePathDocumentOrGroup(
            siteSpace,
            context.revision.pages,
            pagePath
        );
        const entry = resolved
            ? findPageTreeEntry(getIndexablePageTree(context.revision.pages), resolved.page.id)
            : null;
        if (!entry || entry.children.length === 0) {
            return null;
        }
        const nodes = getNodesFromPageTree(entry.children, linker);
        return { title: entry.page.title, url: getPageLLMsTxtURL(linker, entry.page), nodes };
    }

    if (checkIsRootSiteContext(context)) {
        return {
            title: site.title,
            url: getLLMsTxtURLForPath(context, ''),
            nodes: await getNodesFromSiteStructure(context),
        };
    }

    const currentSection = context.sections?.current;
    // A section's default site space is served at the section's own path.
    if (currentSection && siteSpace.default) {
        const node = await getNodeFromSection(context, currentSection);
        return node?.indexURL
            ? { title: node.title, url: node.indexURL, nodes: node.children }
            : null;
    }

    const node = await getNodeFromSiteSpace(context, siteSpace);
    if (!node?.indexURL) {
        return null;
    }
    return {
        title: currentSection
            ? `${getLocalizedTitle(currentSection, context.locale)}: ${node.title}`
            : node.title,
        url: node.indexURL,
        nodes: node.children,
    };
}

async function getNodesFromSiteStructure(context: GitBookSiteContext): Promise<LLMsIndexNode[]> {
    switch (context.structure.type) {
        case 'sections':
            return getNodesFromSectionNodes(
                context,
                getSiteStructureSections(context.structure, { ignoreGroups: false })
            );
        case 'siteSpaces':
            return getNodesFromSiteSpaces(context, context.structure.structure);
        default:
            assertNever(context.structure);
    }
}

async function getNodesFromSectionNodes(
    context: GitBookSiteContext,
    sectionNodes: SiteStructureNode[]
): Promise<LLMsIndexNode[]> {
    const nodes = await Promise.all(
        sectionNodes.map(async (sectionNode): Promise<LLMsIndexNode | null> => {
            switch (sectionNode.object) {
                case 'site-section':
                    return getNodeFromSection(context, sectionNode);
                case 'site-section-group': {
                    const children = await getNodesFromSectionNodes(context, sectionNode.children);
                    return children.length > 0
                        ? {
                              kind: 'structure',
                              title: getLocalizedTitle(sectionNode, context.locale),
                              children,
                          }
                        : null;
                }
                case 'site-external-link':
                    return null;
                default:
                    assertNever(sectionNode);
            }
        })
    );
    return nodes.filter((node) => node !== null);
}

async function getNodeFromSection(
    context: GitBookSiteContext,
    section: SiteSection
): Promise<LLMsIndexNode | null> {
    const children = await getNodesFromSiteSpaces(context, section.siteSpaces);
    if (children.length === 0) {
        return null;
    }

    return {
        kind: 'structure',
        title: getLocalizedTitle(section, context.locale),
        description: getLocalizedDescription(section, context.locale),
        indexURL: getSectionLLMsTxtURL(context, section),
        children,
    };
}

/**
 * The section's llms.txt lists its default variant's language, so it only stands in for the
 * listed variants when they include the default one; otherwise link the single listed variant.
 */
function getSectionLLMsTxtURL(context: GitBookSiteContext, section: SiteSection) {
    const listed = filterSiteSpacesByLocale(section.siteSpaces, context.locale);
    const target =
        listed.find((siteSpace) => siteSpace.default) ??
        (listed.length === 1 ? listed[0] : undefined);
    return target
        ? getLLMsTxtURLForPath(context, getFallbackSiteSpacePath(context, target))
        : undefined;
}

/**
 * A single site space is listed directly, without a heading of its own.
 */
async function getNodesFromSiteSpaces(
    context: GitBookSiteContext,
    siteSpaces: SiteSpace[]
): Promise<LLMsIndexNode[]> {
    const filtered = filterSiteSpacesByLocale(siteSpaces, context.locale);
    const nodes = (
        await Promise.all(filtered.map((siteSpace) => getNodeFromSiteSpace(context, siteSpace)))
    ).filter((node) => node !== null);

    return nodes.length === 1 ? nodes[0]!.children : nodes;
}

async function getNodeFromSiteSpace(
    context: GitBookSiteContext,
    siteSpace: SiteSpace
): Promise<LLMsIndexNode | null> {
    if (!siteSpace.urls.published) {
        return null;
    }

    const revision =
        siteSpace.id === context.siteSpace.id
            ? context.revision
            : await throwIfDataError(
                  context.dataFetcher.getRevision({
                      spaceId: siteSpace.space.id,
                      revisionId: siteSpace.space.revision,
                  })
              );
    const siteSpacePath = getFallbackSiteSpacePath(context, siteSpace);
    const linker = context.linker.withOtherSiteSpace({ spaceBasePath: siteSpacePath });

    return {
        kind: 'structure',
        title: getLocalizedTitle(siteSpace, context.locale),
        indexURL: getLLMsTxtURLForPath(context, siteSpacePath),
        children: getNodesFromPageTree(getIndexablePageTree(revision.pages), linker),
    };
}

function getNodesFromPageTree(entries: PageTreeEntry[], linker: GitBookLinker): LLMsIndexNode[] {
    const markdownLinker = linkerWithMarkdownPages(linker);
    const toNode = ({ page, children }: PageTreeEntry): LLMsIndexNode => ({
        kind: 'page',
        title: page.title,
        description: (page.type === 'document' && page.description) || undefined,
        url:
            page.type === 'document'
                ? markdownLinker.toAbsoluteURL(
                      markdownLinker.toPathForPagePath({ path: page.path })
                  )
                : undefined,
        indexURL: children.length > 0 ? getPageLLMsTxtURL(linker, page) : undefined,
        children: children.map(toNode),
    });
    return entries.map(toNode);
}

function findPageTreeEntry(entries: PageTreeEntry[], pageId: string): PageTreeEntry | null {
    for (const entry of entries) {
        if (entry.page.id === pageId) {
            return entry;
        }
        const found = findPageTreeEntry(entry.children, pageId);
        if (found) {
            return found;
        }
    }
    return null;
}

function getPageLLMsTxtURL(
    linker: GitBookLinker,
    page: RevisionPageDocument | RevisionPageGroup
): string {
    return linker.toAbsoluteURL(linker.toPathInSpace(joinPath(page.path, 'llms.txt')));
}

function getLLMsTxtURLForPath(context: GitBookSiteContext, pathInSite: string): string {
    return context.linker.toAbsoluteURL(
        context.linker.toPathInSite(joinPath(pathInSite, 'llms.txt'))
    );
}

/**
 * Returns a list of markdown nodes for a pages tree.
 */
export async function getMarkdownForPagesTree(
    pages: FlatPageEntry[],
    linker: GitBookLinker
): Promise<RootContent[]> {
    const listChildren = await Promise.all(
        pages.map(async ({ page }): Promise<ListItem> => {
            const url = linker.toAbsoluteURL(
                linker.toPathForPagePath({
                    path: page.path,
                })
            );
            const children: Paragraph['children'] = [
                {
                    type: 'link',
                    url,
                    children: [{ type: 'text', value: page.title }],
                },
            ];
            if (page.description) {
                children.push({ type: 'text', value: `: ${page.description}` });
            }
            return {
                type: 'listItem',
                children: [{ type: 'paragraph', children }],
            };
        })
    );
    const nodes: RootContent[] = [];
    nodes.push({
        type: 'list',
        spread: false,
        children: listChildren,
    });
    return nodes;
}
