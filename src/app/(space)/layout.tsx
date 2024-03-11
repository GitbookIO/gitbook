import {
    CustomizationBackground,
    CustomizationCorners,
    CustomizationHeaderPreset,
    CustomizationSettings,
} from '@gitbook/api';
import assertNever from 'assert-never';
import colors from 'tailwindcss/colors';

import { emojiFontClassName } from '@/components/primitives';
import { fonts, ibmPlexMono } from '@/fonts';
import { getSpaceLanguage } from '@/intl/server';
import { getSpaceLayoutData } from '@/lib/api';
import { hexToRgb, shadesOfColor } from '@/lib/colors';
import { getContentSecurityPolicyNonce } from '@/lib/csp';
import { tcls } from '@/lib/tailwind';

import { ClientContexts } from './ClientContexts';
import './globals.css';
import { getContentPointer } from './fetch';

/**
 * Layout shared between the content and the PDF renderer.
 * It takes care of setting the theme and the language.
 */
export default async function SpaceRootLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    const { customization } = await getSpaceLayoutData(getContentPointer().spaceId);
    const headerTheme = generateHeaderTheme(customization);
    const language = getSpaceLanguage(customization);
    const nonce = getContentSecurityPolicyNonce();

    return (
        <html
            suppressHydrationWarning
            lang={customization.internationalization.locale}
            className={
                tcls(
                    customization.header.preset === CustomizationHeaderPreset.None
                        ? null
                        : [
                              // Take the sticky header in consideration for the scrolling
                              `scroll-pt-[76px]`,
                          ],
                ) +
                (customization.styling.corners === CustomizationCorners.Straight
                    ? ' straight-corners'
                    : '') +
                (customization.styling.background === CustomizationBackground.Plain
                    ? ' plain-background'
                    : '')
            }
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
                            'primary-base',
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
                            'primary-base',
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
                    emojiFontClassName,
                    `${fonts[customization.styling.font].className}`,
                    `${ibmPlexMono.variable}`,
                    'bg-light',
                    'dark:bg-dark',
                )}
            >
                <ClientContexts
                    nonce={nonce}
                    language={language}
                    forcedTheme={
                        customization.themes.toggeable ? undefined : customization.themes.default
                    }
                >
                    {children}
                </ClientContexts>
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
