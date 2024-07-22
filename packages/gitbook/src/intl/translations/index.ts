import { CustomizationLocale } from '@gitbook/api';

import { de } from './de';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { ja } from './ja';
import { pt_br } from './pt-br';
import { TranslationLanguage } from './types';
import { zh } from './zh';

export * from './types';

export const languages: {
    [locale in CustomizationLocale]: TranslationLanguage;
} = {
    de,
    en,
    fr,
    es,
    zh,
    ja,
    'pt-br': pt_br,
};
