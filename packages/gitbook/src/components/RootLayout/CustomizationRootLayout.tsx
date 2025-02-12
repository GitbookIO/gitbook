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
import { IconsProvider, IconStyle } from '@gitbook/icons';
import assertNever from 'assert-never';

import { fontNotoColorEmoji, fonts, ibmPlexMono } from '@/fonts';
import { getSpaceLanguage } from '@/intl/server';
import { getStaticFileURL } from '@/lib/assets';
import {
    colorContrast,
    colorScale,
    type ColorScaleOptions,
    DARK_BASE,
    DEFAULT_TINT_COLOR,
    hexToRgb,
    LIGHT_BASE,
    shadesOfColor,
} from '@/lib/colors';
import { tcls } from '@/lib/tailwind';

import { ClientContexts } from './ClientContexts';

import '@gitbook/icons/style.css';
import './globals.css';

interface FontUrls {
    regular: string;
    semiBold: string;
    bold: string;
}

interface CustomFont {
    id: string;
    name: string;
    links: FontUrls;
    display?: string;
    preload?: boolean;
    fallback?: string[];
}

// This would come from props/API
const customFont: CustomFont = {
    id: 'custom-font',
    name: 'CustomFont',
    links: {
        regular: 'https://fonts.gstatic.com/s/satisfy/v21/rP2Hp2yn6lkG50LoCZOIHTWEBlw.woff2',
        semiBold: 'https://fonts.gstatic.com/s/satisfy/v21/rP2Hp2yn6lkG50LoCZOIHTWEBlw.woff2',
        bold: 'https://fonts.gstatic.com/s/satisfy/v21/rP2Hp2yn6lkG50LoCZOIHTWEBlw.woff2',
    },
    display: 'swap',
    fallback: ['system-ui', 'arial'],
};

/**
 * Layout shared between the content and the PDF renderer.
 * It takes care of setting the theme and the language.
 */
export async function CustomizationRootLayout(props: {
    customization: SiteCustomizationSettings | CustomizationSettings;
    children: React.ReactNode;
}) {
    const { customization, children } = props;

    const headerTheme = generateHeaderTheme(customization);
    const language = getSpaceLanguage(customization);
    const tintColor = getTintColor(customization);
    const mixColor = getTintMixColor(customization.styling.primaryColor, tintColor);
    const sidebarStyles = getSidebarStyles(customization);

    const hasCustomFont = true;
    // Add custom font handling
    const customFontCSS = hasCustomFont
        ? generateCustomFontFaces(customFont.name, customFont.links)
        : '';

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
                tintColor ? ' tint' : 'no-tint',
                sidebarStyles.background && ` sidebar-${sidebarStyles.background}`,
                sidebarStyles.list && ` sidebar-list-${sidebarStyles.list}`,
            )}
        >
            <head>
                {customization.privacyPolicy.url ? (
                    <link rel="privacy-policy" href={customization.privacyPolicy.url} />
                ) : null}
                {hasCustomFont ? <style>{customFontCSS}</style> : null}
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

                        --header-background: ${hexToRgb(headerTheme.backgroundColor.light)};
                        --header-link: ${hexToRgb(headerTheme.linkColor.light)};
                    }

                    .dark {
                        ${generateColorVariable('primary', customization.styling.primaryColor.dark, { darkMode: true })}
                        ${generateColorVariable('tint', tintColor ? tintColor.dark : DEFAULT_TINT_COLOR, { darkMode: true, mix: mixColor && { color: mixColor?.color.dark, ratio: mixColor.ratio.dark } })}
                        ${generateColorVariable('neutral', DEFAULT_TINT_COLOR, { darkMode: true })}

                        --header-background: ${hexToRgb(headerTheme.backgroundColor.dark)};
                        --header-link: ${hexToRgb(headerTheme.linkColor.dark)};   
                    }
                `}</style>
            </head>
            <body
                className={tcls(
                    fontNotoColorEmoji.className,
                    hasCustomFont ? 'font-sans' : fonts[customization.styling.font].className,
                    `${ibmPlexMono.variable}`,
                    'bg-tint-base',
                    '[html.tint.sidebar-filled_&]:bg-tint-subtle', // TODO: Replace this with theme-muted:bg-tint-subtle once themes are available
                )}
            >
                <IconsProvider
                    assetsURL={process.env.GITBOOK_ICONS_URL ?? getStaticFileURL('icons')}
                    assetsURLToken={process.env.GITBOOK_ICONS_TOKEN}
                    assetsByStyles={{
                        'custom-icons': {
                            assetsURL: getStaticFileURL('icons'),
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
    customization: CustomizationSettings | SiteCustomizationSettings,
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
    tintColor: CustomizationTint['color'] | undefined,
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
    customization: CustomizationSettings | SiteCustomizationSettings,
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
 * Define the custom font faces and set the --font-content to the custom font name
 */
function generateCustomFontFaces(fontFamily: string, urls: FontUrls) {
    return `
        @font-face {
            font-family: ${fontFamily};
            font-style: normal;
            font-weight: 400;
            font-display: swap;
            src: url(${urls.regular});
        }
        @font-face {
            font-family: ${fontFamily};
            font-style: normal;
            font-weight: 600;
            font-display: swap;
            src: url(${urls.semiBold});
        }
        @font-face {
            font-family: ${fontFamily};
            font-style: normal;
            font-weight: 700;
            font-display: swap;
            src: url(${urls.bold});
        }
        :root {
            --font-content: ${fontFamily};
        }
    `;
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
    } = {},
) {
    const shades: Record<string, string> =
        typeof color === 'string'
            ? Object.fromEntries(
                  colorScale(color, options).map((shade, index) => [index + 1, shade]),
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

function generateHeaderTheme(customization: CustomizationSettings | SiteCustomizationSettings): {
    backgroundColor: { light: ColorInput; dark: ColorInput };
    linkColor: { light: ColorInput; dark: ColorInput };
} {
    const tintColor = getTintColor(customization);

    switch (customization.header.preset) {
        case CustomizationHeaderPreset.None:
        case CustomizationHeaderPreset.Default: {
            return {
                backgroundColor: {
                    light: LIGHT_BASE,
                    dark: DARK_BASE,
                },
                linkColor: {
                    light: customization.styling.primaryColor.light,
                    dark: customization.styling.primaryColor.dark,
                },
            };
        }
        case CustomizationHeaderPreset.Bold: {
            return {
                backgroundColor: {
                    light: tintColor?.light ?? customization.styling.primaryColor.light,
                    dark: tintColor?.dark ?? customization.styling.primaryColor.dark,
                },
                linkColor: {
                    light: colorContrast(
                        tintColor?.light ?? customization.styling.primaryColor.light,
                        [LIGHT_BASE, DARK_BASE],
                    ),
                    dark: colorContrast(
                        tintColor?.dark ?? customization.styling.primaryColor.dark,
                        [LIGHT_BASE, DARK_BASE],
                    ),
                },
            };
        }
        case CustomizationHeaderPreset.Contrast: {
            return {
                backgroundColor: {
                    light: DARK_BASE,
                    dark: LIGHT_BASE,
                },
                linkColor: {
                    light: LIGHT_BASE,
                    dark: DARK_BASE,
                },
            };
        }
        case CustomizationHeaderPreset.Custom: {
            return {
                backgroundColor: {
                    light:
                        customization.header.backgroundColor?.light ??
                        tintColor?.light ??
                        LIGHT_BASE,
                    dark:
                        customization.header.backgroundColor?.dark ?? tintColor?.dark ?? DARK_BASE,
                },
                linkColor: {
                    light:
                        customization.header.linkColor?.light ??
                        (tintColor?.light &&
                            colorContrast(tintColor.light, [LIGHT_BASE, DARK_BASE])) ??
                        customization.styling.primaryColor.light,
                    dark:
                        customization.header.linkColor?.dark ??
                        (tintColor?.dark &&
                            colorContrast(tintColor.dark, [LIGHT_BASE, DARK_BASE])) ??
                        customization.styling.primaryColor.dark,
                },
            };
        }
        default: {
            assertNever(customization.header.preset);
        }
    }
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
