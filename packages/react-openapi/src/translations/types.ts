import type { en } from './en';

export type TranslationKey = keyof typeof en;

export type Translation = {
    [key in TranslationKey]: string;
};
