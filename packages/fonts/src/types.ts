import type { CustomizationDefaultFont } from '@gitbook/api';

export type FontWeight = '400' | '700';

export type FontDefinition = {
    unicodeRange: {
        [script: string]: string;
    };
    variants: {
        [weight in FontWeight]: {
            [script: string]: string;
        };
    };
};

export type FontDefinitions = { [fontName in CustomizationDefaultFont]: FontDefinition };
