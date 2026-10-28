import type { en } from './en';

export type TranslationKey = keyof typeof en;

export type TranslationLanguage = {
    [key in TranslationKey]: string;
};
