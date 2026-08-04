import { en } from './en';
import type { TranslationLanguage } from './types';

export * from './types';

export type TranslationLanguageMetadata = Pick<TranslationLanguage, 'locale' | 'language' | 'flag'>;

export const defaultLanguage = en;

const languageDefinitions = {
    en: { locale: 'en', language: defaultLanguage.language, flag: defaultLanguage.flag },
    fr: { locale: 'fr', language: 'Français', flag: '🇫🇷' },
    de: { locale: 'de', language: 'Deutsch', flag: '🇩🇪' },
    es: { locale: 'es', language: 'Español', flag: '🇪🇸' },
    it: { locale: 'it', language: 'Italiano', flag: '🇮🇹' },
    pt: { locale: 'pt', language: 'Português', flag: '🇵🇹' },
    'pt-br': { locale: 'pt-br', language: 'Português (Brasil)', flag: '🇧🇷' },
    ru: { locale: 'ru', language: 'Русский', flag: '🇷🇺' },
    ja: { locale: 'ja', language: '日本語', flag: '🇯🇵' },
    zh: { locale: 'zh', language: '中文', flag: '🇨🇳' },
    'zh-tw': { locale: 'zh-tw', language: '繁體中文', flag: '🇹🇼' },
    yue: { locale: 'yue', language: '粵語', flag: '🇭🇰' },
    ko: { locale: 'ko', language: '한국어', flag: '🇰🇷' },
    ar: { locale: 'ar', language: 'العربية', flag: '🇸🇦' },
    hi: { locale: 'hi', language: 'हिन्दी', flag: '🇮🇳' },
    nl: { locale: 'nl', language: 'Nederlands', flag: '🇳🇱' },
    pl: { locale: 'pl', language: 'Polski', flag: '🇵🇱' },
    tr: { locale: 'tr', language: 'Türkçe', flag: '🇹🇷' },
    sv: { locale: 'sv', language: 'Svenska', flag: '🇸🇪' },
    no: { locale: 'no', language: 'Norsk', flag: '🇳🇴' },
    da: { locale: 'da', language: 'Dansk', flag: '🇩🇰' },
    fi: { locale: 'fi', language: 'Suomi', flag: '🇫🇮' },
    el: { locale: 'el', language: 'Ελληνικά', flag: '🇬🇷' },
    cs: { locale: 'cs', language: 'Čeština', flag: '🇨🇿' },
    hu: { locale: 'hu', language: 'Magyar', flag: '🇭🇺' },
    ro: { locale: 'ro', language: 'Română', flag: '🇷🇴' },
    th: { locale: 'th', language: 'ไทย', flag: '🇹🇭' },
    vi: { locale: 'vi', language: 'Tiếng Việt', flag: '🇻🇳' },
    id: { locale: 'id', language: 'Bahasa Indonesia', flag: '🇮🇩' },
    ms: { locale: 'ms', language: 'Bahasa Melayu', flag: '🇲🇾' },
    he: { locale: 'he', language: 'עברית', flag: '🇮🇱' },
    uk: { locale: 'uk', language: 'Українська', flag: '🇺🇦' },
    sk: { locale: 'sk', language: 'Slovenčina', flag: '🇸🇰' },
    bg: { locale: 'bg', language: 'Български', flag: '🇧🇬' },
    hr: { locale: 'hr', language: 'Hrvatski', flag: '🇭🇷' },
    lt: { locale: 'lt', language: 'Lietuvių', flag: '🇱🇹' },
    lv: { locale: 'lv', language: 'Latviešu', flag: '🇱🇻' },
    et: { locale: 'et', language: 'Eesti', flag: '🇪🇪' },
    sl: { locale: 'sl', language: 'Slovenščina', flag: '🇸🇮' },
} satisfies Record<string, TranslationLanguageMetadata>;

export type TranslationLocale = keyof typeof languageDefinitions;

export const languages = languageDefinitions;

export const languageLocales = Object.keys(languageDefinitions) as TranslationLocale[];

export function isAvailableLanguage(locale: string): locale is TranslationLocale {
    return locale in languageDefinitions;
}
