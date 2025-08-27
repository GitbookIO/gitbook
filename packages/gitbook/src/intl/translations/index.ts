import { de } from './de';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { ja } from './ja';
import { nl } from './nl';
import { no } from './no';
import { pt_br } from './pt-br';
import { ru } from './ru';
import type { TranslationLanguage } from './types';
import { zh } from './zh';

export * from './types';

export const languages = {
    de,
    en,
    fr,
    es,
    zh,
    ja,
    nl,
    no,
    'pt-br': pt_br,
    ru,
} satisfies {
    [key: string]: TranslationLanguage;
};
