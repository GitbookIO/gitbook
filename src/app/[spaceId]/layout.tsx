import { CustomizationHeaderPreset, CustomizationSettings } from '@gitbook/api';
import assertNever from 'assert-never';
import colors from 'tailwindcss/colors';

import { fonts, ibmPlexMono } from '@/fonts';
import { getSpaceLanguage } from '@/intl/server';
import { getSpaceContent } from '@/lib/api';
import { hexToRgb, shadesOfColor } from '@/lib/colors';
import { tcls } from '@/lib/tailwind';

import { ClientContexts } from './ClientContexts';
import { SpaceParams } from './fetch';
import './globals.css';

/**
 * Layout shared between the content and the PDF renderer.
 * It takes care of setting the theme and the language.
 */
export default async function SpaceRootLayout(props: {
    children: React.ReactNode;
    params: SpaceParams;
}) {
    const { params, children } = props;

    const { customization } = await getSpaceContent({
        spaceId: params.spaceId,
    });
    const headerTheme = generateHeaderTheme(customization);
    const language = getSpaceLanguage(customization);

    return (
        <html
            lang={customization.internationalization.locale}
            className={tcls(
                customization.header.preset === CustomizationHeaderPreset.None
                    ? null
                    : [
                          // Take the sticky header in consideration for the scrolling
                          `scroll-pt-[76px]`,
                      ],
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
                        ${generateColorVariable(
                            'header-background',
                            headerTheme.backgroundColor.light,
                        )}
                        ${generateColorVariable('header-link', headerTheme.linkColor.light)}
                        ${generateColorVariable('yellow', '#f4e28d')}
                        ${generateColorVariable('teal', '#3f89a1')}
                        ${generateColorVariable('pomegranate', '#f25b3a')}
                    }
                    .dark {
                        ${generateColorVariable(
                            'primary-color',
                            customization.styling.primaryColor.dark,
                        )}
                        ${generateColorVariable(
                            'header-background',
                            headerTheme.backgroundColor.dark,
                        )}
                        ${generateColorVariable('header-link', headerTheme.linkColor.dark)}
                    }
                `}</style>
            </head>
            <body
                className={tcls(
                    `${fonts[customization.styling.font].className}`,
                    `${ibmPlexMono.variable}`,
                    'bg-light',
                    'dark:bg-dark',
                )}
            >
                <ClientContexts language={language}>{children}</ClientContexts>
            </body>
        </html>
    );
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

function generateHeaderTheme(customization: CustomizationSettings): {
    backgroundColor: { light: ColorInput; dark: ColorInput };
    linkColor: { light: ColorInput; dark: ColorInput };
} {
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
                    light: customization.styling.primaryColor.light,
                    dark: customization.styling.primaryColor.dark,
                },
                linkColor: {
                    // TODO: should depend on the color of the background
                    light: colors.white,
                    dark: colors.black,
                },
            };
        }
        case CustomizationHeaderPreset.Contrast: {
            return {
                backgroundColor: {
                    light: customization.styling.primaryColor.dark,
                    dark: customization.styling.primaryColor.light,
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
                    light: customization.header.backgroundColor?.light ?? colors.white,
                    dark: customization.header.backgroundColor?.dark ?? colors.black,
                },
                linkColor: {
                    light:
                        customization.header.linkColor?.light ??
                        customization.styling.primaryColor.light,
                    dark:
                        customization.header.linkColor?.dark ??
                        customization.styling.primaryColor.dark,
                },
            };
        }
        default: {
            assertNever(customization.header.preset);
        }
    }
}
