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
 * List of all icon styles available in the library.
 */
export const iconStyles: IconStyleDefinition[] = [
    {
        title: 'Regular',
        style: IconStyle.Regular,
    },
    {
        title: 'Duotone',
        style: IconStyle.Duotone,
    },
    {
        title: 'Light',
        style: IconStyle.Light,
    },
    {
        title: 'Thin',
        style: IconStyle.Thin,
    },
    {
        title: 'Solid',
        style: IconStyle.Solid,
    },
];

/**
 * List of all icons available in the library.
 */
// @ts-ignore
export const icons: IconDefinition[] = rawIcons;

let iconNamesSet: Set<IconName> | null = null;

/**
 * Validate that the icon name is valid.
 */
export function validateIconName(icon: IconName): boolean {
    if (!iconNamesSet) {
        iconNamesSet = new Set(icons.map((icon) => icon.icon));
    }

    return iconNamesSet.has(icon);
}
