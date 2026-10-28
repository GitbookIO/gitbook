import { de } from './de';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { ja } from './ja';
import { nl } from './nl';
import { no } from './no';
import { pt_br } from './pt-br';
import type { Translation } from './types';
import { zh } from './zh';

export * from './types';

export const translations = {
    en,
    de,
    es,
    fr,
    ja,
    nl,
    no,
    'pt-br': pt_br,
    zh,
} satisfies Record<string, Translation>;

export type TranslationLocale = keyof typeof translations;

/**
 * Check if the locale is valid.
 */
export function checkIsValidLocale(locale: string): locale is TranslationLocale {
    return Object.prototype.hasOwnProperty.call(translations, locale);
}
