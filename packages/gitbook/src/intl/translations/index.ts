import { CustomizationLocale } from '@gitbook/api';

import { de } from './de';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { ja } from './ja';
import { ka } from './ka';
import { nl } from './nl';
import { no } from './no';
import { pt_br } from './pt-br';
import { TranslationLanguage } from './types';
import { zh } from './zh';

export * from './types';

export const languages: {
    [key: string]: TranslationLanguage;
} & {
    [locale in CustomizationLocale]: TranslationLanguage;
} = {
    de,
    en,
    fr,
    es,
    zh,
    ja,
    ka,
    nl,
    no,
    'pt-br': pt_br,
};
