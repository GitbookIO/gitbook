import { getEmojiForCode } from '@/lib/emojis';
import { type ClassValue, tcls } from '@/lib/tailwind';

/**
 * Render an emoji by its codepoint.
 * It renders the UTF-8 character and use Emoji font defined in Tailwind CSS.
 */
export async function Emoji(props: { code: string; style?: ClassValue }) {
    const { code, style } = props;

    const fallback = getEmojiForCode(code);
    return <span className={tcls('font-emoji', style)}>{fallback}</span>;
}
