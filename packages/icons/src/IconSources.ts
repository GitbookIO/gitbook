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

/**
 * Get the element id an icon's sprite entry is defined under, from its source key.
 */
export function getIconSpriteId(key: string): string {
    return `gb-icon-${key.replace(/[^a-z0-9-]/gi, '-')}`;
}
