import { ClassValue, tcls } from '@/lib/tailwind';

/**
 * Render an emoji by its UTF-8 codepoint.
 */
export async function Emoji(props: { code: string; style?: ClassValue }) {
    const { code, style } = props;

    const emojiCodepointDecimal = parseInt(code, 16);
    const emoji = String.fromCodePoint(emojiCodepointDecimal);

    return <span className={tcls(style)}>{emoji}</span>;
}
