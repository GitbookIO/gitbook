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
            background: api.CustomizationBackground.Plain,
            icons: api.CustomizationIconsStyle.Regular,
            links: api.CustomizationLinksStyle.Default,
            sidebar: {
                background: api.CustomizationSidebarBackgroundStyle.Default,
                list: api.CustomizationSidebarListStyle.Default,
            },
            search: api.CustomizationSearchStyle.Subtle,
        },
        internationalization: {
            locale: api.CustomizationLocale.En,
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
        aiSearch: {
            enabled: true,
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
        trademark: {
            enabled: true,
        },
        privacyPolicy: {
            url: 'https://www.gitbook.com/privacy',
        },
        socialPreview: {},
    };
}
