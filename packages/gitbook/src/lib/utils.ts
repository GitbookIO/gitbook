import * as api from '@gitbook/api';

/**
 * Get the title to display for a content.
 */
export function getContentTitle(
    space: api.Space,
    customization: api.CustomizationSettings | api.SiteCustomizationSettings,
    parent: api.Site | null,
) {
    // When we are rendering a site, always give priority to the customization title first
    // and then fallback to the site title
    if (parent?.object === 'site') {
        // the parent title for a site is already overridden by the customized title in the fetch call
        return parent.title ?? space.title;
    }

    // Otherwise the legacy behavior is not changed to avoid regressions
    return parent ? parent.title : (customization.title ?? space.title);
}

/**
 * Return the customizations with the default values for a space.
 */
export function defaultCustomizationForSpace(): api.CustomizationSettings {
    return {
        internationalization: {
            inherit: false,
            locale: api.CustomizationLocale.En,
        },
        styling: {
            primaryColor: {
                dark: '#346DDB',
                light: '#346DDB',
            },
            corners: api.CustomizationCorners.Rounded,
            font: api.CustomizationFont.Inter,
            background: api.CustomizationBackground.Plain,
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
            toggeable: false,
        },
        trademark: {
            enabled: true,
        },
        feedback: {
            enabled: false,
        },
        pdf: {
            enabled: true,
        },
        aiSearch: {
            enabled: true,
        },
        pagination: {
            enabled: true,
        },
        privacyPolicy: {},
        socialPreview: {},
        git: {
            showEditLink: false,
        },
        inherit: false,
    };
}
