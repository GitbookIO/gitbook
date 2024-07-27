import { IconStyle } from './types';
import rawIcons from './data/icons.json';

export interface IconStyleDefinition {
    title: string;
    style: IconStyle;
}

export interface IconDefinition {
    icon: string;
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
export const icons: IconDefinition[] = rawIcons;
