import type { CustomizationDefaultFont } from '@gitbook/api';

export type FontWeight = 400 | 700;

export type FontDefinition = {
    font: string;
    unicodeRange: {
        [script: string]: string;
    };
    variants: {
        [weight in string]: {
            [script: string]: string;
        };
    };
};

export type FontDefinitions = { [fontName in CustomizationDefaultFont]: FontDefinition };
