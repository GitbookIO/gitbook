import * as api from '@gitbook/api';

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
