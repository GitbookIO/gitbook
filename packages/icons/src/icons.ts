import rawIcons from './data/icons.json' with { type: 'json' };
import type { IconName, IconStyle } from './types';

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

export { validateIconName } from './validateIconName';
