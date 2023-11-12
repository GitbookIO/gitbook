import { CustomizationHeaderPreset, CustomizationSettings } from '@gitbook/api';
import assertNever from 'assert-never';
import { Inter } from 'next/font/google';
import shadesOf from 'tailwind-shades';
import colors from 'tailwindcss/colors';

import { tcls } from '@/lib/tailwind';

import { ClientLayout } from './ClientLayout';
import { PagePathParams, fetchPageData } from '../fetch';

const inter = Inter({ subsets: ['latin'] });

export default async function SpaceRootLayout(props: {
    children: React.ReactNode;
    params: PagePathParams;
}) {
    const { children, params } = props;
    const { customization } = await fetchPageData(params);
    const headerTheme = generateHeaderTheme(customization);

    return (
        <html lang={customization.internationalization.locale}>
            <head>
                <style>{`
                    :root {
                        ${generateCSSVariable(
                            'primary-color',
                            customization.styling.primaryColor.light,
                        )}
                        ${generateCSSVariable(
                            'header-background',
                            headerTheme.backgroundColor.light,
                        )}
                        ${generateCSSVariable('header-link', headerTheme.linkColor.light)}
                    }
                    .dark {
                        ${generateCSSVariable(
                            'primary-color',
                            customization.styling.primaryColor.dark,
                        )}
                        ${generateCSSVariable(
                            'header-background',
                            headerTheme.backgroundColor.dark,
                        )}
                        ${generateCSSVariable('header-link', headerTheme.linkColor.dark)}
                    }
                `}</style>
            </head>
            <body className={tcls(inter.className, 'bg-white', 'dark:bg-slate-950')}>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}

type ColorInput = string | Record<string, string>;
function generateCSSVariable(name: string, color: ColorInput) {
    const shades: Record<string, string> = typeof color === 'string' ? shadesOf(color) : color;

    return Object.entries(shades)
        .map(([key, value]) => {
            return `--${name}-${key}: ${value};`;
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
