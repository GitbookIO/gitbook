import { CustomizationFont } from '@gitbook/api';
import {
    Inter,
    Fira_Sans_Extra_Condensed,
    IBM_Plex_Serif,
    IBM_Plex_Mono,
    Lato,
    Merriweather,
    Noto_Sans,
    Open_Sans,
    Overpass,
    Poppins,
    Raleway,
    Roboto,
    Roboto_Slab,
    Source_Sans_3,
    Ubuntu,
    Noto_Color_Emoji,
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
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
    weight: ['400', '500', '600', '700'],
});

export const ibmPlexMono = IBM_Plex_Mono({
    weight: ['400', '500', '600', '700'],
    variable: '--font-mono',
    style: 'normal',
    display: 'swap',
    preload: false,
    fallback: ['monospace'],
    adjustFontFallback: false,
});

const firaSans = Fira_Sans_Extra_Condensed({
    weight: ['400', '500', '600', '700'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
});

const ibmPlexSerif = IBM_Plex_Serif({
    weight: ['400', '500', '700'],
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
    weight: ['400', '500', '700', '800'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
});

const openSans = Open_Sans({
    weight: ['400', '600', '700', '800'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
});

const overpass = Overpass({
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
    weight: ['400', '500', '700'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
});

const robotoSlab = Roboto_Slab({
    weight: ['400', '500', '700'],
    variable: '--font-content',
    preload: false,
    display: 'swap',
    fallback: ['system-ui', 'arial'],
});

const sourceSansPro = Source_Sans_3({
    weight: ['400', '600', '700'],
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

/**
 * Font definitions.
 */
export const fonts: { [fontName in CustomizationFont]: { className: string } } = {
    [CustomizationFont.Inter]: inter,
    [CustomizationFont.FiraSans]: firaSans,
    [CustomizationFont.IBMPlexSerif]: ibmPlexSerif,
    [CustomizationFont.Lato]: lato,
    [CustomizationFont.Merriweather]: merriweather,
    [CustomizationFont.NotoSans]: notoSans,
    [CustomizationFont.OpenSans]: openSans,
    [CustomizationFont.Overpass]: overpass,
    [CustomizationFont.Poppins]: poppins,
    [CustomizationFont.Raleway]: raleway,
    [CustomizationFont.Roboto]: roboto,
    [CustomizationFont.RobotoSlab]: robotoSlab,
    [CustomizationFont.SourceSansPro]: sourceSansPro,
    [CustomizationFont.Ubuntu]: ubuntu,
    [CustomizationFont.ABCFavorit]: abcFavorit,
};

export const googleFontsMap: { [fontName in CustomizationFont]: string } = {
    [CustomizationFont.Inter]: 'Inter',
    [CustomizationFont.FiraSans]: 'Fira Sans Extra Condensed',
    [CustomizationFont.IBMPlexSerif]: 'IBM Plex Serif',
    [CustomizationFont.Lato]: 'Lato',
    [CustomizationFont.Merriweather]: 'Merriweather',
    [CustomizationFont.NotoSans]: 'Noto Sans',
    [CustomizationFont.OpenSans]: 'Open Sans',
    [CustomizationFont.Overpass]: 'Overpass',
    [CustomizationFont.Poppins]: 'Poppins',
    [CustomizationFont.Raleway]: 'Raleway',
    [CustomizationFont.Roboto]: 'Roboto',
    [CustomizationFont.RobotoSlab]: 'Roboto Slab',
    [CustomizationFont.SourceSansPro]: 'Source Sans 3',
    [CustomizationFont.Ubuntu]: 'Ubuntu',
    [CustomizationFont.ABCFavorit]: 'Inter',
};
