import type { FontDefinitions } from './types';

import rawFonts from './data/fonts.json' with { type: 'json' };

export const fonts: FontDefinitions = rawFonts;
