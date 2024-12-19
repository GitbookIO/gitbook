import { getEmojiForCode } from '@/lib/emojis';
import { ClassValue, tcls } from '@/lib/tailwind';

/**
 * Render an emoji by its codepoint.
 * It renders the UTF-8 character and use the emojione font to display it (fallbacking to default browser font).
 */
export async function Emoji(props: { code: string; style?: ClassValue }) {
    const { code, style } = props;

    const fallback = getEmojiForCode(code);
    return <span className={tcls('emoji', style)}>{fallback}</span>;
}
