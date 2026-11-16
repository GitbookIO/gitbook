'use client';
import type { ClassValue } from '@/lib/classnames';

// Each design token is a single class, styled in `RootLayout/styles/*.css`, so the client
// bundle and the HTML only carry a short name instead of the full utility list.
const styles = {
    LinkStyles: 'link',
    CardStyles: 'card',
    ButtonStyles: 'button',
    RecordCardStyles: 'record-card',
    RecordCardLinkStyles: 'record-card-link',
    ToCLinkItemStyles: 'toclink',
    ToCLinkItemActiveStyles: 'toclink-active',
} as const;

export type DesignTokenName = keyof typeof styles;

/**
 * Get the class names for the given design token names.
 * @param names The design token names to get class names for.
 * @returns The class names for the given design token names.
 */
export function useClassnames(names: DesignTokenName[]): ClassValue[] {
    return names.map((name) => styles[name]);
}
