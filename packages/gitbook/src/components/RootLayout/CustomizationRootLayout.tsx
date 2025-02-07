import {
    CustomizationCorners,
    CustomizationHeaderPreset,
    CustomizationIconsStyle,
    type CustomizationSettings,
    CustomizationSidebarBackgroundStyle,
    CustomizationSidebarListStyle,
    type CustomizationThemedColor,
    CustomizationTheme,
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

    const language = getSpaceLanguage(customization);
    const tintColor = getTintColor(customization);
    const mixColor = getTintMixColor(customization.styling.primaryColor, tintColor);
    console.log(
        '===customization',
        customization.header.preset,
        'theme' in customization.styling && customization.styling.theme,
        tintColor,
    );
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
                'theme' in customization.styling && `theme-${customization.styling.theme}`,
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
                        ${generateColorVariable('tint', tintColor ? tintColor.light : DEFAULT_TINT_COLOR, { mix: mixColor && { color: mixColor.color.light, ratio: mixColor.ratio.light } })}
                        ${generateColorVariable('neutral', DEFAULT_TINT_COLOR)}

                        --header-background: ${hexToRgb(tintColor?.light ?? customization.styling.primaryColor.light)};
                        --header-link: ${hexToRgb(customization.header.linkColor?.light ?? colorContrast(tintColor?.light ?? customization.styling.primaryColor.light))};
                    }

                    .dark {
                        ${generateColorVariable('primary', customization.styling.primaryColor.dark, { darkMode: true })}
                        ${generateColorVariable('tint', tintColor ? tintColor.dark : DEFAULT_TINT_COLOR, { darkMode: true, mix: mixColor && { color: mixColor?.color.dark, ratio: mixColor.ratio.dark } })}
                        ${generateColorVariable('neutral', DEFAULT_TINT_COLOR, { darkMode: true })}

                        --header-background: ${hexToRgb(tintColor?.dark ?? customization.styling.primaryColor.dark)};
                        --header-link: ${hexToRgb(customization.header.linkColor?.dark ?? colorContrast(tintColor?.dark ?? customization.styling.primaryColor.dark))};
                    }
                `}</style>
            </head>
            <body
                className={tcls(
                    fontNotoColorEmoji.className,
                    `${fonts[customization.styling.font].className}`,
                    `${ibmPlexMono.variable}`,
                    'bg-tint-base',
                    'theme-muted:bg-tint-subtle',
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
    // ignore space customization (used for the PDF renderer)
    if (!('theme' in customization.styling)) {
        return undefined;
    }

    // These overridings of tint here are only temporary to start implementing the new themes in GBO
    // while we fully support the new themes in the API/GBX. As soon as that happens we should port this logic to the API/GBX
    // only when required for backward compatibility.
    if (
        customization.styling.theme === CustomizationTheme.Bold &&
        customization.header.preset === CustomizationHeaderPreset.Contrast
    ) {
        return {
            light: DARK_BASE,
            dark: LIGHT_BASE,
        };
    }

    // if (
    //     customization.styling.theme === CustomizationTheme.Bold &&
    //     customization.header.preset === CustomizationHeaderPreset.Bold
    // ) {
    //     return customization.styling.primaryColor;
    // }

    if (
        customization.styling.theme === CustomizationTheme.Bold &&
        customization.header.preset === CustomizationHeaderPreset.Custom
    ) {
        return customization.header.backgroundColor ?? customization.styling.primaryColor;
    }

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
                  colorScale(color, options)
                      .map((shade, index) => [index + 1, shade])
                      .concat([['original', color]]),
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
