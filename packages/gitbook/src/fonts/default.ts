import { CustomizationDefaultFont, CustomizationDefaultMonospaceFont } from '@gitbook/api';
import {
    DM_Mono,
    Fira_Code,
    Fira_Sans_Extra_Condensed,
    IBM_Plex_Mono,
    IBM_Plex_Serif,
    Inconsolata,
    Inter,
    JetBrains_Mono,
    Lato,
    Merriweather,
    Noto_Color_Emoji,
    Noto_Sans,
    Open_Sans,
    Overpass,
    Poppins,
    Raleway,
    Roboto,
    Roboto_Mono,
    Roboto_Slab,
    Source_Code_Pro,
    Source_Sans_3,
    Space_Mono,
    Ubuntu,
} from 'next/font/google';
import localFont from 'next/font/local';

export const fontNotoColorEmoji = Noto_Color_Emoji({
    variable: '--font-noto-color-emoji',
    weight: ['400'],
    preload: false,
    display: 'swap',
});

/*
    Fonts are downloaded and loaded by next/font.

    We can't use "preload: true" as otherwise Next will preload all the fonts on the page
    while spaces only use one font at a time.
 */

const inter = Inter({
    weight: ['400', '500', '600', '700'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
});

const firaSans = Fira_Sans_Extra_Condensed({
    weight: ['400', '500', '600', '700'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
});

const ibmPlexSerif = IBM_Plex_Serif({
    weight: ['400', '500', '600', '700'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['serif'],
});

const lato = Lato({
    weight: ['400', '700', '900'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
});

const merriweather = Merriweather({
    weight: ['400', '700', '900'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['serif'],
});

const notoSans = Noto_Sans({
    weight: ['400', '500', '600', '700'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
});

const openSans = Open_Sans({
    weight: ['400', '500', '600', '700'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
});

const overpass = Overpass({
    weight: ['400', '500', '600', '700'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
});

const poppins = Poppins({
    weight: ['400', '500', '600', '700'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
});

const raleway = Raleway({
    weight: ['400', '500', '600', '700'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
});

const roboto = Roboto({
    weight: ['400', '500', '600', '700'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
});

const robotoSlab = Roboto_Slab({
    weight: ['400', '500', '600', '700'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
});

const sourceSansPro = Source_Sans_3({
    weight: ['400', '500', '600', '700'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
});

const ubuntu = Ubuntu({
    weight: ['400', '500', '700'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
});

const abcFavorit = localFont({
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
    src: [
        {
            path: './ABCFavorit/ABCFavorit-Variable.woff2',
            weight: '400 700',
            style: 'normal',
        },
        {
            path: './ABCFavorit/ABCFavorit-BoldItalic.woff2',
            weight: '700',
            style: 'italic',
        },
        {
            path: './ABCFavorit/ABCFavorit-MediumItalic.woff2',
            weight: '500',
            style: 'italic',
        },
        {
            path: './ABCFavorit/ABCFavorit-RegularItalic.woff2',
            weight: '400',
            style: 'italic',
        },
    ],
    declarations: [{ prop: 'ascent-override', value: '100%' }],
});

const ibmPlexMono = IBM_Plex_Mono({
    weight: ['400', '500', '600', '700'],
    variable: '--font-mono',
    style: 'normal',
    display: 'swap',
    preload: false,
    fallback: ['monospace'],
    adjustFontFallback: false,
});

const dmMono = DM_Mono({
    weight: ['400', '500'],
    variable: '--font-mono',
    style: 'normal',
    display: 'swap',
    preload: false,
    fallback: ['monospace'],
    adjustFontFallback: false,
});

const firaCode = Fira_Code({
    weight: ['400', '500', '600', '700'],
    variable: '--font-mono',
    style: 'normal',
    display: 'swap',
    preload: false,
    fallback: ['monospace'],
    adjustFontFallback: false,
});

const inconsolata = Inconsolata({
    weight: ['400', '500', '600', '700'],
    variable: '--font-mono',
    style: 'normal',
    display: 'swap',
    preload: false,
    fallback: ['monospace'],
    adjustFontFallback: false,
});

const jetBrainsMono = JetBrains_Mono({
    weight: ['400', '500', '600', '700'],
    variable: '--font-mono',
    style: 'normal',
    display: 'swap',
    preload: false,
    fallback: ['monospace'],
    adjustFontFallback: false,
});

const robotoMono = Roboto_Mono({
    weight: ['400', '500', '600', '700'],
    variable: '--font-mono',
    style: 'normal',
    display: 'swap',
    preload: false,
    fallback: ['monospace'],
    adjustFontFallback: false,
});

const sourceCodePro = Source_Code_Pro({
    weight: ['400', '500', '600', '700'],
    variable: '--font-mono',
    style: 'normal',
    display: 'swap',
    preload: false,
    fallback: ['monospace'],
    adjustFontFallback: false,
});

const spaceMono = Space_Mono({
    weight: ['400', '700'],
    variable: '--font-mono',
    style: 'normal',
    display: 'swap',
    preload: false,
    fallback: ['monospace'],
    adjustFontFallback: false,
});

/**
 * Font definitions.
 */
export const fonts: {
    [fontName in CustomizationDefaultFont | CustomizationDefaultMonospaceFont]: {
        variable: string;
    };
} = {
    [CustomizationDefaultFont.Inter]: inter,
    [CustomizationDefaultFont.FiraSans]: firaSans,
    [CustomizationDefaultFont.IBMPlexSerif]: ibmPlexSerif,
    [CustomizationDefaultFont.Lato]: lato,
    [CustomizationDefaultFont.Merriweather]: merriweather,
    [CustomizationDefaultFont.NotoSans]: notoSans,
    [CustomizationDefaultFont.OpenSans]: openSans,
    [CustomizationDefaultFont.Overpass]: overpass,
    [CustomizationDefaultFont.Poppins]: poppins,
    [CustomizationDefaultFont.Raleway]: raleway,
    [CustomizationDefaultFont.Roboto]: roboto,
    [CustomizationDefaultFont.RobotoSlab]: robotoSlab,
    [CustomizationDefaultFont.SourceSansPro]: sourceSansPro,
    [CustomizationDefaultFont.Ubuntu]: ubuntu,
    [CustomizationDefaultFont.ABCFavorit]: abcFavorit,
    [CustomizationDefaultMonospaceFont.IBMPlexMono]: ibmPlexMono,
    [CustomizationDefaultMonospaceFont.DMMono]: dmMono,
    [CustomizationDefaultMonospaceFont.FiraCode]: firaCode,
    [CustomizationDefaultMonospaceFont.Inconsolata]: inconsolata,
    [CustomizationDefaultMonospaceFont.JetBrainsMono]: jetBrainsMono,
    [CustomizationDefaultMonospaceFont.RobotoMono]: robotoMono,
    [CustomizationDefaultMonospaceFont.SourceCodePro]: sourceCodePro,
    [CustomizationDefaultMonospaceFont.SpaceMono]: spaceMono,
};
