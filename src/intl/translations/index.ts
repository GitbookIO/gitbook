import en from './en.json';

export type TranslationKey = keyof typeof en;

export type TranslationLanguage = {
    [key in TranslationKey]: string;
};

export const languages = {
    en,
};
