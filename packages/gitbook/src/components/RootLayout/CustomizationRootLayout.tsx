import {
    CustomizationCorners,
    CustomizationHeaderPreset,
    CustomizationIconsStyle,
    type CustomizationSettings,
    CustomizationSidebarBackgroundStyle,
    CustomizationSidebarListStyle,
    type CustomizationThemedColor,
    type CustomizationTint,
    type SiteCustomizationSettings,
} from '@gitbook/api';
import {
    type ColorScaleOptions,
    DEFAULT_HINT_DANGER_COLOR,
    DEFAULT_HINT_INFO_COLOR,
    DEFAULT_HINT_SUCCESS_COLOR,
    DEFAULT_HINT_WARNING_COLOR,
    DEFAULT_TINT_COLOR,
    colorContrast,
    colorScale,
    hexToRgb,
} from '@gitbook/colors';
import { IconStyle, IconsProvider } from '@gitbook/icons';

import { fontNotoColorEmoji, fonts, ibmPlexMono } from '@/fonts';
import { getSpaceLanguage } from '@/intl/server';
import { getAssetURL } from '@/lib/assets';
import { tcls } from '@/lib/tailwind';

import { ClientContexts } from './ClientContexts';

import '@gitbook/icons/style.css';
import './globals.css';

/**
 * Layout shared between the content and the PDF renderer.
 * It takes care of setting the theme and the language.
 */
export async function CustomizationRootLayout(props: {
    customization: SiteCustomizationSettings | CustomizationSettings;
    children: React.ReactNode;
}) {
    const { customization, children } = props;

    const language = getSpaceLanguage(customization);
    const tintColor = getTintColor(customization);
    const mixColor = getTintMixColor(customization.styling.primaryColor, tintColor);
    const sidebarStyles = getSidebarStyles(customization);
    const { infoColor, successColor, warningColor, dangerColor } = getSemanticColors(customization);

    return (
        <html
            suppressHydrationWarning
            lang={customization.internationalization.locale}
            className={tcls(
                customization.header.preset === CustomizationHeaderPreset.None
                    ? null
                    : 'scroll-pt-[76px]', // Take the sticky header in consideration for the scrolling
                customization.styling.corners === CustomizationCorners.Straight
                    ? ' straight-corners'
                    : '',
                'theme' in customization.styling && `theme-${customization.styling.theme}`,
                tintColor ? ' tint' : 'no-tint',
                sidebarStyles.background && `sidebar-${sidebarStyles.background}`,
                sidebarStyles.list && `sidebar-list-${sidebarStyles.list}`,
                'links' in customization.styling && `links-${customization.styling.links}`,
                fontNotoColorEmoji.variable,
                fonts[customization.styling.font].variable,
                ibmPlexMono.variable
            )}
        >
            <head>
                {customization.privacyPolicy.url ? (
                    <link rel="privacy-policy" href={customization.privacyPolicy.url} />
                ) : null}
                <style
                    nonce={
                        //Since I can't get the nonce to work for inline styles, we need to allow unsafe-inline
                        undefined
                    }
                >{`
                    :root {
                        ${generateColorVariable('primary', customization.styling.primaryColor.light)}
                        ${generateColorVariable('tint', tintColor ? tintColor.light : DEFAULT_TINT_COLOR, { mix: mixColor && { color: mixColor.color.light, ratio: mixColor.ratio.light } })}
                        ${generateColorVariable('neutral', DEFAULT_TINT_COLOR)}

                        --header-background: ${
                            /** If the site still has a (deprecated) custom header link or background set, we use that.
                             * These values are no longer supported in the Customiser, and will eventually be unsupported in the front-end. */
                            hexToRgb(
                                customization.header.backgroundColor?.light ??
                                    tintColor?.light ??
                                    customization.styling.primaryColor.light
                            )
                        };
                        --header-link: ${hexToRgb(customization.header.linkColor?.light ?? colorContrast(tintColor?.light ?? customization.styling.primaryColor.light))};

                        ${generateColorVariable('info', infoColor.light)}
                        ${generateColorVariable('warning', warningColor.light)}
                        ${generateColorVariable('danger', dangerColor.light)}
                        ${generateColorVariable('success', successColor.light)}
                    }

                    .dark {
                        ${generateColorVariable('primary', customization.styling.primaryColor.dark, { darkMode: true })}
                        ${generateColorVariable('tint', tintColor ? tintColor.dark : DEFAULT_TINT_COLOR, { darkMode: true, mix: mixColor && { color: mixColor?.color.dark, ratio: mixColor.ratio.dark } })}
                        ${generateColorVariable('neutral', DEFAULT_TINT_COLOR, { darkMode: true })}

                        --header-background: ${hexToRgb(customization.header.backgroundColor?.dark ?? tintColor?.dark ?? customization.styling.primaryColor.dark)};
                        --header-link: ${hexToRgb(customization.header.linkColor?.dark ?? colorContrast(tintColor?.dark ?? customization.styling.primaryColor.dark))};

                        ${generateColorVariable('info', infoColor.dark, { darkMode: true })}
                        ${generateColorVariable('warning', warningColor.dark, { darkMode: true })}
                        ${generateColorVariable('danger', dangerColor.dark, { darkMode: true })}
                        ${generateColorVariable('success', successColor.dark, { darkMode: true })}
                    }
                `}</style>
            </head>
            <body
                className={tcls(
                    'bg-tint-base',
                    'theme-muted:bg-tint-subtle',
                    'theme-bold-tint:bg-tint-subtle',

                    'theme-gradient:bg-gradient-primary',
                    'theme-gradient-tint:bg-gradient-tint'
                )}
            >
                <IconsProvider
                    assetsURL={process.env.GITBOOK_ICONS_URL ?? getAssetURL('icons')}
                    assetsURLToken={process.env.GITBOOK_ICONS_TOKEN}
                    assetsByStyles={{
                        'custom-icons': {
                            assetsURL: getAssetURL('icons'),
                        },
                    }}
                    iconStyle={
                        ('icons' in customization.styling
                            ? apiToIconsStyles[customization.styling.icons]
                            : null) || IconStyle.Regular
                    }
                >
                    <ClientContexts language={language}>{children}</ClientContexts>
                </IconsProvider>
            </body>
        </html>
    );
}

/**
 * Get the tint color from the customization settings.
 * If the tint color is not set or it is a space customization, it will return the default color.
 */
function getTintColor(
    customization: CustomizationSettings | SiteCustomizationSettings
): CustomizationTint['color'] | undefined {
    if ('tint' in customization.styling && customization.styling.tint) {
        return {
            light: customization.styling.tint?.color.light ?? DEFAULT_TINT_COLOR,
            dark: customization.styling.tint?.color.dark ?? DEFAULT_TINT_COLOR,
        };
    }
}

function getTintMixColor(
    primaryColor: CustomizationThemedColor,
    tintColor: CustomizationTint['color'] | undefined
): {
    color: CustomizationThemedColor;
    ratio: { light: number; dark: number };
} {
    if (!tintColor) {
        // Mix in a bit of the primary colour into neutral, to match with primary nicely.
        return {
            color: primaryColor,
            ratio: {
                light: 0.2,
                dark: 0.1,
            },
        };
    }

    // Mix in neutral into the tint colour to offset it from the primary, and to make the effect less intense.
    // If the tint colour differs from the primary colour, we use the tint colour fully without mixing.
    return {
        color: {
            light: DEFAULT_TINT_COLOR,
            dark: DEFAULT_TINT_COLOR,
        },
        ratio: {
            light: tintColor.light.toUpperCase() === primaryColor.light.toUpperCase() ? 0.4 : 0,
            dark: tintColor.dark.toUpperCase() === primaryColor.dark.toUpperCase() ? 0.4 : 0,
        },
    };
}

/**
 * Get the sidebar styles from the customization settings.
 * If it is a space customization, it will return the default styles.
 */
function getSidebarStyles(
    customization: CustomizationSettings | SiteCustomizationSettings
): SiteCustomizationSettings['styling']['sidebar'] {
    if ('sidebar' in customization.styling) {
        return {
            background: customization.styling.sidebar.background,
            list: customization.styling.sidebar.list,
        };
    }

    return {
        background: CustomizationSidebarBackgroundStyle.Default,
        list: CustomizationSidebarListStyle.Default,
    };
}

/**
 * Get the semnatic color customization settings.
 * If it is a space customization, it will return the default styles.
 */
function getSemanticColors(
    customization: CustomizationSettings | SiteCustomizationSettings
): Pick<
    SiteCustomizationSettings['styling'],
    'infoColor' | 'successColor' | 'warningColor' | 'dangerColor'
> {
    if ('infoColor' in customization.styling) {
        return {
            infoColor: customization.styling.infoColor,
            successColor: customization.styling.successColor,
            warningColor: customization.styling.warningColor,
            dangerColor: customization.styling.dangerColor,
        };
    }

    return {
        infoColor: {
            light: DEFAULT_HINT_INFO_COLOR,
            dark: DEFAULT_HINT_INFO_COLOR,
        },
        successColor: {
            light: DEFAULT_HINT_SUCCESS_COLOR,
            dark: DEFAULT_HINT_SUCCESS_COLOR,
        },
        warningColor: {
            light: DEFAULT_HINT_WARNING_COLOR,
            dark: DEFAULT_HINT_WARNING_COLOR,
        },
        dangerColor: {
            light: DEFAULT_HINT_DANGER_COLOR,
            dark: DEFAULT_HINT_DANGER_COLOR,
        },
    };
}

type ColorInput = string;
function generateColorVariable(
    name: string,
    color: ColorInput | Record<string, string>,
    {
        withContrast = true,
        ...options // Pass any options along to the colorScale() function
    }: ColorScaleOptions & {
        withContrast?: boolean;
    } = {}
) {
    const shades: Record<string, string> =
        typeof color === 'string'
            ? Object.fromEntries(
                  colorScale(color, options)
                      .map((shade, index) => [index + 1, shade])
                      .concat([['original', color]])
              )
            : color;

    return Object.entries(shades)
        .map(([key, value]) => {
            const rgbValue = hexToRgb(value); // Check the original hex value
            const contrastValue = withContrast ? hexToRgb(colorContrast(value)) : undefined; // Add contrast if needed
            return `--${name}-${key}: ${rgbValue}; ${
                contrastValue ? `--contrast-${name}-${key}: ${contrastValue};` : ''
            }`;
        })
        .join('\n');
}

const apiToIconsStyles: {
    [key in CustomizationIconsStyle]: IconStyle;
} = {
    [CustomizationIconsStyle.Regular]: IconStyle.Regular,
    [CustomizationIconsStyle.Solid]: IconStyle.Solid,
    [CustomizationIconsStyle.Duotone]: IconStyle.Duotone,
    [CustomizationIconsStyle.Thin]: IconStyle.Thin,
    [CustomizationIconsStyle.Light]: IconStyle.Light,
};
