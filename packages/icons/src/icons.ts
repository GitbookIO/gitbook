import { IconStyle } from "./types";
import rawIcons from '../icons.json';

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
        title: 'Solid',
        style: IconStyle.Solid
    },
    {
        title: 'Outline',
        style: IconStyle.Outline
    }
];

/**
 * List of all icons available in the library.
 */
export const icons: IconDefinition[] = rawIcons;

