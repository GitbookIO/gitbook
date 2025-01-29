import {
    CustomizationCorners,
    CustomizationHeaderPreset,
    CustomizationIconsStyle,
    CustomizationSettings,
    CustomizationSidebarBackgroundStyle,
    CustomizationSidebarListStyle,
    CustomizationTint,
    SiteCustomizationSettings,
} from '@gitbook/api';
import { IconsProvider, IconStyle } from '@gitbook/icons';
import assertNever from 'assert-never';
import colors from 'tailwindcss/colors';

import { fontNotoColorEmoji, fonts, ibmPlexMono } from '@/fonts';
import { getSpaceLanguage } from '@/intl/server';
import { getStaticFileURL } from '@/lib/assets';
import { colorContrast, colorScale, hexToRgb, shadesOfColor } from '@/lib/colors';
import { tcls } from '@/lib/tailwind';

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
                sidebarStyles.background && ' sidebar-' + sidebarStyles.background,
                sidebarStyles.list && ' sidebar-list-' + sidebarStyles.list,
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
                        --primary-original: ${hexToRgb(customization.styling.primaryColor.light)};
                        ${generateColorVariable('primary', Object.fromEntries(colorScale(customization.styling.primaryColor.light).map((shade, index) => [index + 1, shade])))}
                        --contrast-primary-original: ${hexToRgb(colorContrast(customization.styling.primaryColor.light))};
                        ${generateColorVariable('contrast-primary', Object.fromEntries(colorScale(customization.styling.primaryColor.light).map((shade, index) => [index + 1, colorContrast(shade)])))}

                        --tint-original: ${hexToRgb(tintColor?.light ?? customization.styling.primaryColor.light ?? DEFAULT_TINT_COLOR)};
                        ${generateColorVariable('tint', Object.fromEntries(colorScale(tintColor?.light ?? customization.styling.primaryColor.light ?? DEFAULT_TINT_COLOR).map((shade, index) => [index + 1, shade])))}
                        --contrast-tint-original: ${hexToRgb(colorContrast(tintColor?.light ?? customization.styling.primaryColor.light ?? DEFAULT_TINT_COLOR))};
                        ${generateColorVariable('contrast-tint', Object.fromEntries(colorScale(tintColor?.light ?? customization.styling.primaryColor.light ?? DEFAULT_TINT_COLOR).map((shade, index) => [index + 1, colorContrast(shade)])))}

                        --gray-original: ${hexToRgb(DEFAULT_TINT_COLOR)};
                        ${generateColorVariable('gray', Object.fromEntries(colorScale(DEFAULT_TINT_COLOR).map((shade, index) => [index + 1, shade])))}
                        --contrast-tint-original: ${hexToRgb(colorContrast(DEFAULT_TINT_COLOR))};
                        ${generateColorVariable('contrast-gray', Object.fromEntries(colorScale(DEFAULT_TINT_COLOR).map((shade, index) => [index + 1, colorContrast(shade)])))}

                        --header-backround: ${headerTheme.backgroundColor.light}
                        --header-link: ${headerTheme.linkColor.light}
                    }

                    .dark {
                        --primary-original: ${hexToRgb(customization.styling.primaryColor.dark)};
                        ${generateColorVariable('primary', Object.fromEntries(colorScale(customization.styling.primaryColor.dark, {darkMode: true}).map((shade, index) => [index + 1, shade])))}
                        --contrast-primary-original: ${hexToRgb(colorContrast(customization.styling.primaryColor.dark))};
                        ${generateColorVariable('contrast-primary', Object.fromEntries(colorScale(customization.styling.primaryColor.dark, {darkMode: true}).map((shade, index) => [index + 1, colorContrast(shade)])))}

                        --tint-original: ${hexToRgb(tintColor?.dark ?? customization.styling.primaryColor.dark ?? DEFAULT_TINT_COLOR)};
                        ${generateColorVariable('tint', Object.fromEntries(colorScale(tintColor?.dark ?? customization.styling.primaryColor.dark ?? DEFAULT_TINT_COLOR, {darkMode: true}).map((shade, index) => [index + 1, shade])))}
                        --contrast-tint-original: ${hexToRgb(colorContrast(tintColor?.dark ?? customization.styling.primaryColor.dark ?? DEFAULT_TINT_COLOR))};
                        ${generateColorVariable('contrast-tint', Object.fromEntries(colorScale(tintColor?.dark ?? customization.styling.primaryColor.dark ?? DEFAULT_TINT_COLOR, {darkMode: true}).map((shade, index) => [index + 1, colorContrast(shade)])))}

                        --gray-original: ${hexToRgb(DEFAULT_TINT_COLOR)};
                        ${generateColorVariable('gray', Object.fromEntries(colorScale(DEFAULT_TINT_COLOR, {darkMode: true}).map((shade, index) => [index + 1, shade])))}
                        --contrast-tint-original: ${hexToRgb(colorContrast(DEFAULT_TINT_COLOR))};
                        ${generateColorVariable('contrast-gray', Object.fromEntries(colorScale(DEFAULT_TINT_COLOR, {darkMode: true}).map((shade, index) => [index + 1, colorContrast(shade)])))}

                        --header-backround: ${headerTheme.backgroundColor.light}
                        --header-link: ${headerTheme.linkColor.light}
                    }
                `}</style>
            </head>
            <body
                className={tcls(
                    fontNotoColorEmoji.className,
                    `${fonts[customization.styling.font].className}`,
                    `${ibmPlexMono.variable}`,
                    'bg-gray-base',
                )}
            >
                <div className="flex gap-4">
                    <div>
                        Light original:{' '}
                        <span style={{ color: customization.styling.primaryColor.light }}>
                            {customization.styling.primaryColor.light}
                        </span>
                        <ol>
                            {colorScale(customization.styling.primaryColor.light).map((color, index) => (
                                <li
                                    className="list-item"
                                    key={index}
                                    style={{
                                        backgroundColor: color,
                                        color: colorContrast(color)
                                    }}
                                >
                                    {color}
                                </li>
                            ))}
                        </ol>
                    </div>
                    <div>
                        Dark original:{' '}
                        <span style={{ color: customization.styling.primaryColor.dark }}>
                            {customization.styling.primaryColor.dark}
                        </span>
                        <ol>
                            {colorScale(customization.styling.primaryColor.dark, {darkMode: true}).map((color, index) => (
                                <li
                                    className="list-item"
                                    key={index}
                                    style={{
                                        backgroundColor: color,
                                        color: colorContrast(color)
                                    }}
                                >
                                    {color}
                                </li>
                            ))}
                        </ol>
                    </div>
                    <div>
                        Light gray:{' '}
                        <span style={{ color: DEFAULT_TINT_COLOR }}>
                            {DEFAULT_TINT_COLOR}
                        </span>
                        <ol>
                            {colorScale(DEFAULT_TINT_COLOR).map((color, index) => (
                                <li
                                    className="list-item"
                                    key={index}
                                    style={{
                                        backgroundColor: color,
                                        color: colorContrast(color)
                                    }}
                                >
                                    {color}
                                </li>
                            ))}
                        </ol>
                    </div>
                    <div>
                        Dark gray:{' '}
                        <span style={{ color: DEFAULT_TINT_COLOR }}>
                            {DEFAULT_TINT_COLOR}
                        </span>
                        <ol>
                            {colorScale(DEFAULT_TINT_COLOR, {darkMode: true}).map((color, index) => (
                                <li
                                    className="list-item"
                                    key={index}
                                    style={{
                                        backgroundColor: color,
                                        color: colorContrast(color)
                                    }}
                                >
                                    {color}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
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
function generateColorVariable(name: string, color: ColorInput | Record<string, string>) {
    const shades: Record<string, string> =
        typeof color === 'string'
            ? Object.fromEntries(colorScale(color).map((shade, index) => [index + 1, shade]))
            : color;

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
                    ),
                    dark: colorContrast(
                        tintColor?.dark ?? customization.styling.primaryColor.dark,
                        [colors.white, colors.black],
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
                            colorContrast(tintColor.light, [colors.white, colors.black])) ??
                        customization.styling.primaryColor.light,
                    dark:
                        customization.header.linkColor?.dark ??
                        (tintColor?.dark &&
                            colorContrast(tintColor.dark, [colors.white, colors.black])) ??
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
