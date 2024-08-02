import { IconName, IconStyle } from './types';
import rawIcons from './data/icons.json';

export interface IconStyleDefinition {
    title: string;
    style: IconStyle;
}

export interface IconDefinition {
    icon: IconName;
    label: string;
    search?: string[];
}

/**
 * List of all icons available in the library.
 */
// @ts-ignore
export const icons: IconDefinition[] = rawIcons;

let iconNamesSet: Set<string> | null = null;

/**
 * Validate that the icon name is valid.
 */
export function validateIconName(icon: IconName | string): icon is IconName {
    if (!iconNamesSet) {
        iconNamesSet = new Set(icons.map((icon) => icon.icon));
    }

    return iconNamesSet.has(icon);
}
