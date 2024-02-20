import { emojiCodepoints } from '@gitbook/emoji-codepoints';
import localFont from 'next/font/local';

import { ClassValue, tcls } from '@/lib/tailwind';

import './emoji.css';

/* Load the 3 variants of the font as CSS variables and let the emoji.css decide on the best one to use */

const svgFont = localFont({
    src: './svg.woff2',
    preload: false,
    variable: '--font-emojis-svg',
});

const sbixFont = localFont({
    src: './sbix.woff2',
    preload: false,
    variable: '--font-emojis-sbix',
});

const cbdtFont = localFont({
    src: './cbdt.woff2',
    preload: false,
    variable: '--font-emojis-cbdt',
});

/**
 * Class name to set on the <html> tag to use the emoji font.
 */
export const emojiFontClassName = [svgFont.variable, sbixFont.variable, cbdtFont.variable].join(
    ' ',
);

/**
 * Render an emoji by its codepoint.
 * It renders the UTF-8 character and use the emojione font to display it (fallbacking to default browser font).
 */
export async function Emoji(props: { code: string; style?: ClassValue }) {
    const { code, style } = props;

    const fullCode = emojiCodepoints[code] ?? code;
    const fallback = getEmojiForCodepoint(fullCode);

    return <span className={'emoji ' + tcls(style)}>{fallback}</span>;
}

function getEmojiForCodepoint(unicode: string): string {
    if (!unicode) {
        return '';
    }

    const codePoints = unicode.split('-').map((elt) => parseInt(elt, 16));
    return String.fromCodePoint(...codePoints);
}
