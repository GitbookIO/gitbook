import 'server-only';

import {
    CustomizationIconsStyle,
    type JSONDocument,
    type RevisionPage,
    type RevisionTag,
    type SiteCustomizationSettings,
    type SiteSection,
    type SiteSectionGroup,
} from '@gitbook/api';
import { type InlineIconSource, getInlineIconSourceKey } from '@gitbook/icons/IconSources';
import { getIconStyle } from '@gitbook/icons/getIconStyle';
import { validateIconName } from '@gitbook/icons/icons';
import { type IconName, IconStyle } from '@gitbook/icons/types';
import { GITBOOK_ICONS_ASSET_VERSION } from '@gitbook/icons/version';
import pRetry from 'p-retry';

import { getAssetURL } from '@/lib/assets';
import { GITBOOK_ICONS_TOKEN, GITBOOK_ICONS_URL, GITBOOK_URL } from '@/lib/env';
import { joinPath, joinPathWithBaseURL } from '@/lib/paths';

const rawSvgPromises = new Map<string, Promise<InlineIconSource | null>>();
const svgPattern = /<svg\b([^>]*)>([\s\S]*?)<\/svg>\s*$/i;
const viewBoxPattern = /\bviewBox=(["'])(.*?)\1/i;
const commentPattern = /<!--[\s\S]*?-->/g;
const scriptPattern = /<script\b[\s\S]*?<\/script>/gi;

/**
 * A request for an icon whose SVG source should be resolved and provided to the client renderer.
 */
export type IconSourceRequest = {
    icon: IconName;
    iconStyle?: IconStyle;
};

const apiToIconsStyles: {
    [key in CustomizationIconsStyle]: IconStyle;
} = {
    [CustomizationIconsStyle.Regular]: IconStyle.Regular,
    [CustomizationIconsStyle.Solid]: IconStyle.Solid,
    [CustomizationIconsStyle.Duotone]: IconStyle.Duotone,
    [CustomizationIconsStyle.Thin]: IconStyle.Thin,
    [CustomizationIconsStyle.Light]: IconStyle.Light,
};

const defaultIconSourceRequests = [
    'arrow-down',
    'arrow-down-short-wide',
    'arrow-left',
    'arrow-turn-down-left',
    'arrow-up',
    'arrow-up-right',
    'arrow-up-right-from-square',
    'ban',
    'bars',
    'block-quote',
    'chart-simple',
    'check',
    'check-circle',
    'circle-check',
    'circle-exclamation',
    'circle-info',
    'chevron-down',
    'chevron-left',
    'chevron-right',
    'chevron-up',
    'circle-xmark',
    'close',
    'code-commit',
    'code-pull-request',
    'comment',
    'copy',
    'desktop',
    'download',
    'edit',
    'ellipsis',
    'ellipsis-h',
    'envelope',
    'exclamation-triangle',
    'eye',
    'eye-slash',
    'file-archive',
    'file-download',
    'file-image',
    'file-lines',
    'file-pdf',
    'folder-gear',
    'gear',
    'gitbook',
    'github',
    'gitlab',
    'globe',
    'hashtag',
    'link',
    'lock',
    'magnifying-glass',
    'markdown',
    'maximize',
    'mcp',
    'memo',
    'message-question',
    'minus',
    'moon',
    'palette',
    'pen-to-square',
    'plus',
    'print',
    'question-circle',
    'refresh',
    'rotate',
    'rss',
    'search',
    'sparkle',
    'spinner-third',
    'star',
    'sun-bright',
    'thumbs-down',
    'thumbs-up',
    'trash',
    'trash-can',
    'triangle-exclamation',
    'user',
    'x',
    'xmark',
] satisfies IconName[];

const customIconSourceRequests = [
    'chatgpt',
    'bytedance',
    'claude',
    'cohere',
    'common-crawl',
    'cursor',
    'deepseek',
    'gitbook-assistant',
    'mistral',
    'vscode',
] satisfies IconName[];

const explicitStyleIconSourceRequests = [
    { icon: 'check', iconStyle: IconStyle.Solid },
    { icon: 'chevron-right', iconStyle: IconStyle.Solid },
    { icon: 'circle-info', iconStyle: IconStyle.Solid },
    { icon: 'circle-exclamation', iconStyle: IconStyle.Solid },
    { icon: 'circle-check', iconStyle: IconStyle.Solid },
] satisfies IconSourceRequest[];

/**
 * Icons used by core UI that can render after hydration, such as menus and popovers.
 */
export function getDefaultInlineIconSourceRequests(iconStyle: IconStyle): IconSourceRequest[] {
    return [
        ...defaultIconSourceRequests.map((icon) => ({ icon, iconStyle })),
        ...customIconSourceRequests.map((icon) => ({ icon, iconStyle: IconStyle.Regular })),
        ...explicitStyleIconSourceRequests,
    ];
}

/**
 * Resolve the Font Awesome style configured for a site's customization.
 */
export function getCustomizationIconStyle(customization: SiteCustomizationSettings): IconStyle {
    return (
        ('icons' in customization.styling ? apiToIconsStyles[customization.styling.icons] : null) ||
        IconStyle.Regular
    );
}

/**
 * Collect icon source requests from content data that can render icons outside the default UI set.
 */
export function getContentInlineIconSourceRequests(input: {
    iconStyle: IconStyle;
    pages?: RevisionPage[];
    document?: JSONDocument | null;
    tags?: RevisionTag[];
    sections?: (SiteSection | SiteSectionGroup)[] | null;
}): IconSourceRequest[] {
    const { iconStyle, pages = [], document = null, tags = [], sections = null } = input;
    const requests: IconSourceRequest[] = [];

    collectPageIconSourceRequests(pages, iconStyle, requests);
    collectTagIconSourceRequests(tags, iconStyle, requests);
    collectSiteSectionIconSourceRequests(sections ?? [], iconStyle, requests);

    if (document) {
        collectDocumentIconSourceRequests(document, iconStyle, requests);
    }

    return requests;
}

/**
 * Resolve SVG markup for icons that should be available to client components at first paint.
 */
export async function getInlineIconSources(
    requests: IconSourceRequest[]
): Promise<Record<string, InlineIconSource>> {
    const resolved = new Map<string, { style: string; icon: IconName }>();

    for (const request of requests) {
        const [style, icon] = getIconStyle(request.iconStyle ?? IconStyle.Regular, request.icon);
        resolved.set(getInlineIconSourceKey(style, icon), { style, icon });
    }

    const sources = await Promise.all(
        [...resolved.entries()].map(async ([key, request]) => {
            const source = await getInlineIconSource(request.style, request.icon);
            return source ? ([key, source] as const) : null;
        })
    );

    return Object.fromEntries(
        sources.filter((source): source is [string, InlineIconSource] => {
            return source !== null;
        })
    );
}

async function getInlineIconSource(
    style: string,
    icon: IconName
): Promise<InlineIconSource | null> {
    const cacheKey = getInlineIconSourceKey(style, icon);
    const existing = rawSvgPromises.get(cacheKey);
    if (existing) {
        return existing;
    }

    try {
        const request = pRetry(
            () =>
                fetch(getIconAssetURL(style, icon), {
                    cache: 'force-cache',
                }).then(async (response) => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch icon');
                    }

                    return parseRawSVG(await response.text());
                }),
            { retries: 3 }
        );
        rawSvgPromises.set(cacheKey, request);
        return await request;
    } catch {
        console.warn(`Failed to fetch icon ${icon} with style ${style} after multiple attempts`);
        return null;
    }
}

export function parseRawSVG(document: string): InlineIconSource | null {
    const svgMatch = document.match(svgPattern);
    if (!svgMatch) {
        return null;
    }

    const svgAttributes = svgMatch[1];
    const rawMarkup = svgMatch[2];
    if (!svgAttributes || rawMarkup === undefined) {
        return null;
    }

    const viewBox = svgAttributes.match(viewBoxPattern)?.[2];
    if (!viewBox) {
        return null;
    }

    return {
        viewBox,
        markup: rawMarkup.replace(commentPattern, '').replace(scriptPattern, '').trim(),
    };
}

function getIconAssetURL(style: string, icon: string): string {
    const url = new URL(
        joinPathWithBaseURL(
            getAbsoluteIconAssetBaseURL(style),
            joinPath('svgs', style, `${icon}.svg`)
        )
    );
    url.searchParams.set('v', GITBOOK_ICONS_ASSET_VERSION);

    if (style !== 'custom-icons' && GITBOOK_ICONS_TOKEN) {
        url.searchParams.set('token', GITBOOK_ICONS_TOKEN);
    }

    return url.toString();
}

function getIconAssetBaseURL(style: string): string {
    if (style === 'custom-icons') {
        return getAssetURL('icons');
    }

    return GITBOOK_ICONS_URL;
}

function getAbsoluteIconAssetBaseURL(style: string): string {
    const baseURL = getIconAssetBaseURL(style);

    if (baseURL.startsWith('http://') || baseURL.startsWith('https://')) {
        return baseURL;
    }

    return joinPathWithBaseURL(GITBOOK_URL, baseURL);
}

function collectPageIconSourceRequests(
    pages: RevisionPage[],
    iconStyle: IconStyle,
    requests: IconSourceRequest[]
) {
    for (const page of pages) {
        addIconSourceRequest(requests, page.icon, iconStyle);

        if ('pages' in page) {
            collectPageIconSourceRequests(page.pages, iconStyle, requests);
        }
    }
}

function collectTagIconSourceRequests(
    tags: RevisionTag[],
    iconStyle: IconStyle,
    requests: IconSourceRequest[]
) {
    for (const tag of tags) {
        if ('icon' in tag) {
            addIconSourceRequest(requests, tag.icon, iconStyle);
        }
    }
}

function collectSiteSectionIconSourceRequests(
    sections: (SiteSection | SiteSectionGroup)[],
    iconStyle: IconStyle,
    requests: IconSourceRequest[]
) {
    for (const section of sections) {
        addIconSourceRequest(requests, section.icon, iconStyle);

        if (section.object === 'site-section-group') {
            collectSiteSectionIconSourceRequests(section.children, iconStyle, requests);
        }
    }
}

function collectDocumentIconSourceRequests(
    node: unknown,
    iconStyle: IconStyle,
    requests: IconSourceRequest[]
) {
    if (!node || typeof node !== 'object') {
        return;
    }

    const record = node as Record<string, unknown>;

    if (record.type === 'icon' || record.type === 'button') {
        const data = record.data;
        if (data && typeof data === 'object') {
            addIconSourceRequest(requests, (data as Record<string, unknown>).icon, iconStyle);
        }
    }

    for (const value of Object.values(record)) {
        if (Array.isArray(value)) {
            for (const item of value) {
                collectDocumentIconSourceRequests(item, iconStyle, requests);
            }
        } else if (value && typeof value === 'object') {
            collectDocumentIconSourceRequests(value, iconStyle, requests);
        }
    }
}

function addIconSourceRequest(requests: IconSourceRequest[], icon: unknown, iconStyle: IconStyle) {
    if (typeof icon === 'string' && validateIconName(icon)) {
        requests.push({ icon, iconStyle });
    }
}
