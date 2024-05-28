import { CustomizationLocale } from '@gitbook/api';

import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { ja } from './ja';
import { de } from './de';
import { TranslationLanguage } from './types';
import { zh } from './zh';

export * from './types';

export const languages: {
    [locale in CustomizationLocale]: TranslationLanguage;
} = {
    en,
    fr,
    es,
    zh,
    ja,
    de,
};
