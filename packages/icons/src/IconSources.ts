export interface InlineIconSource {
    /** The SVG viewBox for the icon. */
    viewBox: string;
    /** Trusted inner SVG markup for the icon. */
    markup: string;
}

/**
 * Get the lookup key for a server-resolved inline SVG source.
 */
export function getInlineIconSourceKey(style: string, icon: string): string {
    return `${style}/${icon}`;
}
