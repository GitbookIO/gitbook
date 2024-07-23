import { IconStyle } from "./Icon";

export interface IconStyleDefinition {
    title: string;
    style: IconStyle;
}

export interface IconDefinition {
    icon: string;
    title: string;
    keywords: string[];
}

/**
 * List of all icon styles available in the library.
 */
export const iconStyles: IconStyleDefinition[] = [
    {
        title: 'Solid',
        style: 'solid'
    },
    {
        title: 'Outline',
        style: 'outline'
    }
];

/**
 * List of all icons available in the library.
 */
export const icons: IconDefinition[] = [];

