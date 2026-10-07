import { CustomizationDefaultFont, CustomizationDefaultMonospaceFont } from '@gitbook/api';

/** The emoji font is always loaded, alongside whichever content and monospace fonts a site picked. */
export const EMOJI_FONT = 'NotoColorEmoji';

export type FontName =
    | CustomizationDefaultFont
    | CustomizationDefaultMonospaceFont
    | typeof EMOJI_FONT;

export interface FontDefinition {
    /** `font-family` to declare the faces under. */
    family: string;
    /** Family id on Google Fonts, or `null` for the fonts we ship ourselves. */
    googleId: string | null;
    weights: string[];
    /** CSS variable the family is exposed as. */
    variable: '--font-content' | '--font-mono' | '--font-noto-color-emoji';
    /** Families appended after the (metric-adjusted) fallback. */
    fallback: string[];
    /** Declare a `<family> Fallback` face with metric overrides, so the swap shifts layout as
     * little as possible. Monospace fonts opt out, as they did under `next/font`. */
    adjustFallback: boolean;
}

const content = (
    family: string,
    googleId: string,
    weights: string[],
    fallback: string[] = ['system-ui', 'arial']
): FontDefinition => ({
    family,
    googleId,
    weights,
    variable: '--font-content',
    fallback,
    adjustFallback: true,
});

const mono = (family: string, googleId: string, weights: string[]): FontDefinition => ({
    family,
    googleId,
    weights,
    variable: '--font-mono',
    fallback: ['monospace'],
    adjustFallback: false,
});

export const FONT_DEFINITIONS: Record<FontName, FontDefinition> = {
    [CustomizationDefaultFont.Inter]: content('Inter', 'inter', ['400', '500', '600', '700']),
    [CustomizationDefaultFont.FiraSans]: content(
        'Fira Sans Extra Condensed',
        'fira-sans-extra-condensed',
        ['400', '500', '600', '700']
    ),
    [CustomizationDefaultFont.IBMPlexSerif]: content(
        'IBM Plex Serif',
        'ibm-plex-serif',
        ['400', '500', '600', '700'],
        ['serif']
    ),
    [CustomizationDefaultFont.Lato]: content('Lato', 'lato', ['400', '700', '900']),
    [CustomizationDefaultFont.Merriweather]: content(
        'Merriweather',
        'merriweather',
        ['400', '700', '900'],
        ['serif']
    ),
    [CustomizationDefaultFont.NotoSans]: content('Noto Sans', 'noto-sans', [
        '400',
        '500',
        '600',
        '700',
    ]),
    [CustomizationDefaultFont.OpenSans]: content('Open Sans', 'open-sans', [
        '400',
        '500',
        '600',
        '700',
    ]),
    [CustomizationDefaultFont.Overpass]: content('Overpass', 'overpass', [
        '400',
        '500',
        '600',
        '700',
    ]),
    [CustomizationDefaultFont.Poppins]: content('Poppins', 'poppins', ['400', '500', '600', '700']),
    [CustomizationDefaultFont.Raleway]: content('Raleway', 'raleway', ['400', '500', '600', '700']),
    [CustomizationDefaultFont.Roboto]: content('Roboto', 'roboto', ['400', '500', '600', '700']),
    [CustomizationDefaultFont.RobotoSlab]: content('Roboto Slab', 'roboto-slab', [
        '400',
        '500',
        '600',
        '700',
    ]),
    [CustomizationDefaultFont.SourceSansPro]: content('Source Sans 3', 'source-sans-3', [
        '400',
        '500',
        '600',
        '700',
    ]),
    [CustomizationDefaultFont.Ubuntu]: content('Ubuntu', 'ubuntu', ['400', '500', '700']),
    [CustomizationDefaultFont.ABCFavorit]: {
        family: 'abcFavorit',
        googleId: null,
        weights: [],
        variable: '--font-content',
        fallback: ['system-ui', 'arial'],
        adjustFallback: true,
    },

    [CustomizationDefaultMonospaceFont.IBMPlexMono]: mono('IBM Plex Mono', 'ibm-plex-mono', [
        '400',
        '500',
        '600',
        '700',
    ]),
    [CustomizationDefaultMonospaceFont.DMMono]: mono('DM Mono', 'dm-mono', ['400', '500']),
    [CustomizationDefaultMonospaceFont.FiraCode]: mono('Fira Code', 'fira-code', [
        '400',
        '500',
        '600',
        '700',
    ]),
    [CustomizationDefaultMonospaceFont.Inconsolata]: mono('Inconsolata', 'inconsolata', [
        '400',
        '500',
        '600',
        '700',
    ]),
    [CustomizationDefaultMonospaceFont.JetBrainsMono]: mono('JetBrains Mono', 'jetbrains-mono', [
        '400',
        '500',
        '600',
        '700',
    ]),
    [CustomizationDefaultMonospaceFont.RobotoMono]: mono('Roboto Mono', 'roboto-mono', [
        '400',
        '500',
        '600',
        '700',
    ]),
    [CustomizationDefaultMonospaceFont.SourceCodePro]: mono('Source Code Pro', 'source-code-pro', [
        '400',
        '500',
        '600',
        '700',
    ]),
    [CustomizationDefaultMonospaceFont.SpaceMono]: mono('Space Mono', 'space-mono', ['400', '700']),

    [EMOJI_FONT]: {
        family: 'Noto Color Emoji',
        googleId: 'noto-color-emoji',
        weights: ['400'],
        variable: '--font-noto-color-emoji',
        fallback: [],
        adjustFallback: true,
    },
};

// `abcFavorit` is licensed, so it ships in the repo instead of coming from Google Fonts. The
// fallback metrics are the ones `next/font/local` measured from these exact files with fontkit.
export const ABC_FAVORIT = {
    sources: [
        { file: 'ABCFavorit-Variable.woff2', weight: '400 700', style: 'normal' },
        { file: 'ABCFavorit-BoldItalic.woff2', weight: '700', style: 'italic' },
        { file: 'ABCFavorit-MediumItalic.woff2', weight: '500', style: 'italic' },
        { file: 'ABCFavorit-RegularItalic.woff2', weight: '400', style: 'italic' },
    ],
    /** The design sits low in its em box; without this the fallback swap jumps vertically. */
    ascentOverride: '100%',
    fallbackMetrics: {
        ascentOverride: '90.97%',
        descentOverride: '37.34%',
        lineGapOverride: '0.00%',
        sizeAdjust: '104.43%',
    },
} as const;
