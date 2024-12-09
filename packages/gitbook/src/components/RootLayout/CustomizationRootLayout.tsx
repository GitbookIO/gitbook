import {
    CustomizationCorners,
    CustomizationHeaderPreset,
    CustomizationIconsStyle,
    CustomizationSettings,
    CustomizationTint,
    SiteCustomizationSettings,
} from '@gitbook/api';
import { IconsProvider, IconStyle } from '@gitbook/icons';
import assertNever from 'assert-never';
import colorContrast from 'postcss-color-contrast/js';
import colors from 'tailwindcss/colors';

import { fonts, ibmPlexMono } from '@/fonts';
import { getSpaceLanguage } from '@/intl/server';
import { getStaticFileURL } from '@/lib/assets';
import { hexToRgb, shadesOfColor } from '@/lib/colors';
import { tcls } from '@/lib/tailwind';

import { emojiFontClassName } from '../primitives';
import { ClientContexts } from './ClientContexts';

import '@gitbook/icons/style.css';
import './globals.css';

const DEFAULT_TINT_COLOR = '#787878';

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
                        ${generateColorVariable(
                            'primary-color',
                            customization.styling.primaryColor.light,
                        )}
                        ${
                            // Generate the right contrast color for each shade of primary-color
                            generateColorVariable(
                                'contrast-primary',
                                Object.fromEntries(
                                    Object.entries(
                                        shadesOfColor(customization.styling.primaryColor.light),
                                    ).map(([index, color]) => [
                                        index,
                                        colorContrast(color, ['#000', '#fff']),
                                    ]),
                                ),
                            )
                        }

                        ${generateColorVariable('tint-color', tintColor?.light ?? DEFAULT_TINT_COLOR)}
                        ${
                            // Generate the right contrast color for each shade of tint-color
                            generateColorVariable(
                                'contrast-tint',
                                Object.fromEntries(
                                    Object.entries(
                                        shadesOfColor(tintColor?.light || DEFAULT_TINT_COLOR),
                                    ).map(([index, color]) => [
                                        index,
                                        colorContrast(color, ['#000', '#fff']),
                                    ]),
                                ),
                            )
                        }

                        ${generateColorVariable(
                            'header-background',
                            headerTheme.backgroundColor.light,
                        )}
                        ${generateColorVariable('header-link', headerTheme.linkColor.light)}
                        ${generateColorVariable('header-button-text', colorContrast(headerTheme.linkColor.light as string, ['#000', '#fff']))}
                    }
                    .dark {
                        ${generateColorVariable(
                            'primary-color',
                            customization.styling.primaryColor.dark,
                        )}
                        ${
                            // Generate the right contrast color for each shade of primary-color
                            generateColorVariable(
                                'contrast-primary',
                                Object.fromEntries(
                                    Object.entries(
                                        shadesOfColor(customization.styling.primaryColor.dark),
                                    ).map(([index, color]) => [
                                        index,
                                        colorContrast(color, ['#000', '#fff']),
                                    ]),
                                ),
                            )
                        }

                        ${generateColorVariable('tint-color', tintColor?.dark ?? DEFAULT_TINT_COLOR)}
                        ${
                            // Generate the right contrast color for each shade of tint-color
                            generateColorVariable(
                                'contrast-tint',
                                Object.fromEntries(
                                    Object.entries(
                                        shadesOfColor(tintColor?.dark || DEFAULT_TINT_COLOR),
                                    ).map(([index, color]) => [
                                        index,
                                        colorContrast(color, ['#000', '#fff']),
                                    ]),
                                ),
                            )
                        }

                        ${generateColorVariable(
                            'header-background',
                            headerTheme.backgroundColor.dark,
                        )}
                        ${generateColorVariable('header-link', headerTheme.linkColor.dark)}
                        ${generateColorVariable('header-button-text', colorContrast(headerTheme.linkColor.dark as string, ['#000', '#fff']))}
                    }
                `}</style>
            </head>
            <body
                className={tcls(
                    emojiFontClassName,
                    `${fonts[customization.styling.font].className}`,
                    `${ibmPlexMono.variable}`,
                    'bg-light',
                    'dark:bg-dark',
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
export function getTintColor(
    customization: CustomizationSettings | SiteCustomizationSettings,
): CustomizationTint['color'] | undefined {
    if ('tint' in customization.styling && customization.styling.tint) {
        return {
            light: customization.styling.tint?.color.light ?? DEFAULT_TINT_COLOR,
            dark: customization.styling.tint?.color.dark ?? DEFAULT_TINT_COLOR,
        };
    }
}

type ColorInput = string | Record<string, string>;
function generateColorVariable(name: string, color: ColorInput) {
    const shades: Record<string, string> = typeof color === 'string' ? shadesOfColor(color) : color;

    return Object.entries(shades)
        .map(([key, value]) => {
            // Check the original hex value
            const rgbValue = hexToRgb(value);
            return `--${name}-${key}: ${rgbValue};`;
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
                    light: colors.white,
                    dark: colors.black,
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
                        [colors.white, colors.black],
                        'aaa',
                    ),
                    dark: colorContrast(
                        tintColor?.dark ?? customization.styling.primaryColor.dark,
                        [colors.white, colors.black],
                        'aaa',
                    ),
                },
            };
        }
        case CustomizationHeaderPreset.Contrast: {
            return {
                backgroundColor: {
                    light: colors.black,
                    dark: colors.white,
                },
                linkColor: {
                    light: colors.white,
                    dark: colors.black,
                },
            };
        }
        case CustomizationHeaderPreset.Custom: {
            return {
                backgroundColor: {
                    light:
                        customization.header.backgroundColor?.light ??
                        tintColor?.light ??
                        colors.white,
                    dark:
                        customization.header.backgroundColor?.dark ??
                        tintColor?.dark ??
                        colors.black,
                },
                linkColor: {
                    light:
                        customization.header.linkColor?.light ??
                        (tintColor?.light &&
                            colorContrast(tintColor.light, [colors.white, colors.black], 'aaa')) ??
                        customization.styling.primaryColor.light,
                    dark:
                        customization.header.linkColor?.dark ??
                        (tintColor?.dark &&
                            colorContrast(tintColor.dark, [colors.white, colors.black], 'aaa')) ??
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
