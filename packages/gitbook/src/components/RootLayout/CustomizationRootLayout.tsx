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
                <style
                    nonce={
                        //Since I can't get the nonce to work for inline styles, we need to allow unsafe-inline
                        undefined
                    }
                >{`
                    :root {
                        ${generateColorVariable('primary', customization.styling.primaryColor.light)}
                        ${generateColorVariable('tint', tintColor ? tintColor.light : DEFAULT_TINT_COLOR, { mix: { color: mixColor.color.light, ratio: mixColor.ratio?.light } })}
                        ${generateColorVariable('neutral', DEFAULT_TINT_COLOR)}

                        --header-background: ${hexToRgb(headerTheme.backgroundColor.light)};
                        --header-link: ${hexToRgb(headerTheme.linkColor.light)};
                    }

                    .dark {
                        ${generateColorVariable('primary', customization.styling.primaryColor.dark, { darkMode: true })}
                        ${generateColorVariable('tint', tintColor ? tintColor.dark : DEFAULT_TINT_COLOR, { darkMode: true, mix: { color: mixColor?.color.dark, ratio: mixColor?.ratio?.dark } })}
                        ${generateColorVariable('neutral', DEFAULT_TINT_COLOR, { darkMode: true })}

                        --header-background: ${hexToRgb(headerTheme.backgroundColor.dark)};
                        --header-link: ${hexToRgb(headerTheme.linkColor.dark)};   
                    }
                `}</style>
            </head>
            <body
                className={tcls(
                    fontNotoColorEmoji.className,
                    `${fonts[customization.styling.font].className}`,
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
    color: { light: string | undefined; dark: string | undefined };
    ratio?: { light: number; dark: number };
} {
    if (!tintColor) {
        return {
            color: primaryColor,
        };
    }

    return {
        color: {
            light: tintColor.light === primaryColor.light ? DEFAULT_TINT_COLOR : undefined,
            dark: tintColor.dark === primaryColor.dark ? DEFAULT_TINT_COLOR : undefined,
        },
        ratio: {
            light: tintColor.light === primaryColor.light ? 0.4 : 0.2,
            dark: tintColor.dark === primaryColor.dark ? 0.4 : 0.2,
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
