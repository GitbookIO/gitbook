'use client';
import type { ClassValue } from '@/lib/tailwind';

import { RecordCardStyles } from '../DocumentView/Table/styles';
import {
    PageLinkItemStyles,
    ToggleableLinkItemActiveStyles,
    ToggleableLinkItemStyles,
} from '../TableOfContents/styles';
import { ButtonStyles, CardStyles, LinkStyles } from './styles';

const styles = {
    LinkStyles,
    CardStyles,
    ButtonStyles,
    RecordCardStyles,
    PageLinkItemStyles,
    ToggleableLinkItemStyles,
    ToggleableLinkItemActiveStyles,
};

export type DesignTokenName = keyof typeof styles;

/**
 * Get the class names for the given design token names.
 * TODO: remove this once we figure out a better solution. Likely with TW4.
 * @param names The design token names to get class names for.
 * @returns The class names for the given design token names.
 */
export function useClassnames(names: DesignTokenName[]): ClassValue[] {
    return names.flatMap((name) => styles[name] || []);
}
