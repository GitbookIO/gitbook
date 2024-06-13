import { CustomizationLocale } from '@gitbook/api';

import { br } from './br';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { ja } from './ja';
import { TranslationLanguage } from './types';
import { zh } from './zh';

export * from './types';

//@ts-ignore
export const languages: {
    [locale in CustomizationLocale]: TranslationLanguage;
} = {
    en,
    fr,
    es,
    zh,
    ja,
    br,
};
