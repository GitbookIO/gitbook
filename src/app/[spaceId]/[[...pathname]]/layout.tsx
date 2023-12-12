import { CustomizationHeaderPreset, CustomizationSettings } from '@gitbook/api';
import assertNever from 'assert-never';
import { Inter } from 'next/font/google';
import colors from 'tailwindcss/colors';

import { getSpaceCustomization } from '@/lib/api';
import { hexToRgb, shadesOfColor } from '@/lib/colors';
import { tcls } from '@/lib/tailwind';

import { PagePathParams } from '../fetch';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default async function SpaceRootLayout(props: {
    children: React.ReactNode;
    params: PagePathParams;
}) {
    const { params, children } = props;

    const customization = await getSpaceCustomization(params.spaceId);
    const headerTheme = generateHeaderTheme(customization);

    return (
        <html lang={customization.internationalization.locale}>
            <head>
                <style>{`
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
            <body className={tcls(`${inter.className}`, 'bg-light', 'dark:bg-dark')}>
                {children}
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
