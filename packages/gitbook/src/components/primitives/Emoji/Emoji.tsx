import localFont from 'next/font/local';

import { getEmojiForCode } from '@/lib/emojis';
import { ClassValue, tcls } from '@/lib/tailwind';

/** 
COLRv1 font.
- lightweight, top quality
- widely supported by modern browsers
- currently not by Safari (or iOS)
*/
const colrv1Font = localFont({
    src: './joypixels-colrv1.woff2',
    preload: false,
    variable: '--font-emojis-colrv1',
});

/** 
SBIX font.
- narrowly supported
- currently required for Safari (or iOS)
- provide alternative font-family name (see below)
*/
const sbixFont = localFont({
    src: './joypixels-sbix.woff2',
    preload: false,
    variable: '--font-emojis-sbix',
});

/** 
CBDT font.
- widely supported
- currently not by Safari (or iOS)
- retain for legacy browser support
*/
const cbdtFont = localFont({
    src: './joypixels-cbdt.woff2',
    preload: false,
    variable: '--font-emojis-cbdt',
});

/**
 * Class name to set on the <html> tag to use the emoji font.
 */
export const emojiFontClassName = [colrv1Font.variable, sbixFont.variable, cbdtFont.variable].join(
    ' ',
);

/**
 * Render an emoji by its codepoint.
 * It renders the UTF-8 character and use the emojione font to display it (fallbacking to default browser font).
 */
export async function Emoji(props: { code: string; style?: ClassValue }) {
    const { code, style } = props;

    const fallback = getEmojiForCode(code);
    return <span className={tcls('emoji', style)}>{fallback}</span>;
}
