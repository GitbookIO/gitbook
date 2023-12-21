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
} from 'next/font/google';
import localFont from 'next/font/local';

const inter = Inter({
    variable: '--font-content',
    preload: false,
});

export const ibmPlexMono = IBM_Plex_Mono({
    weight: ['400'],
    variable: '--font-mono',
    style: 'normal',
    preload: false,
});

const firaSans = Fira_Sans_Extra_Condensed({
    weight: ['400', '500', '600', '700'],
    variable: '--font-content',
    preload: false,
});

const ibmPlexSerif = IBM_Plex_Serif({
    weight: ['400', '500', '700'],
    variable: '--font-content',
    preload: false,
});

const lato = Lato({
    weight: ['400', '700', '900'],
    variable: '--font-content',
    preload: false,
});

const merriweather = Merriweather({
    weight: ['400', '700', '900'],
    variable: '--font-content',
    preload: false,
});

const notoSans = Noto_Sans({
    weight: ['400', '500', '700', '800'],
    variable: '--font-content',
    preload: false,
});

const openSans = Open_Sans({
    weight: ['400', '600', '700', '800'],
    variable: '--font-content',
    preload: false,
});

const overpass = Overpass({
    variable: '--font-content',
    preload: false,
});

const poppins = Poppins({
    weight: ['400', '500', '600', '700'],
    variable: '--font-content',
    preload: false,
});

const raleway = Raleway({
    weight: ['400', '500', '600', '700'],
    variable: '--font-content',
    preload: false,
});

const roboto = Roboto({
    weight: ['400', '500', '700'],
    variable: '--font-content',
    preload: false,
});

const robotoSlab = Roboto_Slab({
    weight: ['400', '500', '700'],
    variable: '--font-content',
    preload: false,
});

const sourceSansPro = Source_Sans_3({
    weight: ['400', '600', '700'],
    variable: '--font-content',
    preload: false,
});

const ubuntu = Ubuntu({
    weight: ['400', '500', '700'],
    variable: '--font-content',
    preload: false,
});

const abcFavorit = localFont({
    variable: '--font-content',
    preload: false,
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
