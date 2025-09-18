import * as api from '@gitbook/api';

/**
 * Return the default customization settings for a site.
 */
export function defaultCustomization(): api.SiteCustomizationSettings {
    return {
        styling: {
            theme: api.CustomizationTheme.Clean,
            primaryColor: { light: '#346DDB', dark: '#346DDB' },
            infoColor: { light: '#787878', dark: '#787878' },
            warningColor: { light: '#FE9A00', dark: '#FE9A00' },
            dangerColor: { light: '#FB2C36', dark: '#FB2C36' },
            successColor: { light: '#00C950', dark: '#00C950' },
            corners: api.CustomizationCorners.Rounded,
            font: api.CustomizationDefaultFont.Inter,
            monospaceFont: api.CustomizationDefaultMonospaceFont.IBMPlexMono,
            background: api.CustomizationBackground.Plain,
            icons: api.CustomizationIconsStyle.Regular,
            links: api.CustomizationLinksStyle.Default,
            depth: api.CustomizationDepth.Subtle,
            sidebar: {
                background: api.CustomizationSidebarBackgroundStyle.Default,
                list: api.CustomizationSidebarListStyle.Default,
            },
            search: api.CustomizationSearchStyle.Subtle,
        },
        internationalization: {
            locale: api.CustomizationLocale.En,
        },
        insights: {
            trackingCookie: true,
        },
        favicon: {},
        header: {
            preset: api.CustomizationHeaderPreset.Default,
            links: [],
        },
        footer: {
            groups: [],
        },
        themes: {
            default: api.CustomizationThemeMode.Light,
            toggeable: true,
        },
        pdf: {
            enabled: true,
        },
        feedback: {
            enabled: false,
        },
        ai: {
            mode: api.CustomizationAIMode.None,
        },
        externalLinks: {
            target: api.SiteExternalLinksTarget.Self,
        },
        advancedCustomization: {
            enabled: true,
        },
        git: {
            showEditLink: false,
        },
        pagination: {
            enabled: true,
        },
        pageActions: {
            externalAI: true,
            markdown: true,
            mcp: true,
        },
        trademark: {
            enabled: true,
        },
        privacyPolicy: {
            url: 'https://www.gitbook.com/privacy',
        },
        socialPreview: {},
    };
}

/**
 * Recursively flatten all sections from nested groups
 */
export function flattenSectionsFromGroup<T extends { id: string; object: string; children?: T[] }>(
    children: T[]
): T[] {
    const sections: T[] = [];

    for (const child of children) {
        if (child.object === 'site-section') {
            sections.push(child);
        } else if (child.object === 'site-section-group' && child.children) {
            sections.push(...flattenSectionsFromGroup(child.children));
        }
    }

    return sections;
}

/**
 * Recursively find a section by ID within a group and its nested children
 */
export function findSectionInGroup<T extends { id: string; object: string; children?: T[] }>(
    group: { children: T[] },
    sectionId: string
): T | null {
    return (
        flattenSectionsFromGroup(group.children).find((section) => section.id === sectionId) ?? null
    );
}
