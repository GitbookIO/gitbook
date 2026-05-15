import { en } from './en';
import type { TranslationLanguage } from './types';

export * from './types';

export type TranslationLanguageMetadata = Pick<TranslationLanguage, 'locale' | 'language' | 'flag'>;

type LanguageDefinition = {
    metadata: TranslationLanguageMetadata;
    load: () => Promise<TranslationLanguage>;
};

export const defaultLanguage = en;

const languageDefinitions = {
    en: {
        metadata: {
            locale: 'en',
            language: defaultLanguage.language,
            flag: defaultLanguage.flag,
        },
        load: async () => defaultLanguage,
    },
    fr: {
        metadata: { locale: 'fr', language: 'Français', flag: '🇫🇷' },
        load: () => import('./fr').then((module) => module.fr),
    },
    de: {
        metadata: { locale: 'de', language: 'Deutsch', flag: '🇩🇪' },
        load: () => import('./de').then((module) => module.de),
    },
    es: {
        metadata: { locale: 'es', language: 'Español', flag: '🇪🇸' },
        load: () => import('./es').then((module) => module.es),
    },
    it: {
        metadata: { locale: 'it', language: 'Italiano', flag: '🇮🇹' },
        load: () => import('./it').then((module) => module.it),
    },
    pt: {
        metadata: { locale: 'pt', language: 'Português', flag: '🇵🇹' },
        load: () => import('./pt').then((module) => module.pt),
    },
    'pt-br': {
        metadata: { locale: 'pt-br', language: 'Português (Brasil)', flag: '🇧🇷' },
        load: () => import('./pt-br').then((module) => module.pt_br),
    },
    ru: {
        metadata: { locale: 'ru', language: 'Русский', flag: '🇷🇺' },
        load: () => import('./ru').then((module) => module.ru),
    },
    ja: {
        metadata: { locale: 'ja', language: '日本語', flag: '🇯🇵' },
        load: () => import('./ja').then((module) => module.ja),
    },
    zh: {
        metadata: { locale: 'zh', language: '中文', flag: '🇨🇳' },
        load: () => import('./zh').then((module) => module.zh),
    },
    'zh-tw': {
        metadata: { locale: 'zh-tw', language: '繁體中文', flag: '🇹🇼' },
        load: () => import('./zh-tw').then((module) => module.zh_tw),
    },
    yue: {
        metadata: { locale: 'yue', language: '粵語', flag: '🇭🇰' },
        load: () => import('./yue').then((module) => module.yue),
    },
    ko: {
        metadata: { locale: 'ko', language: '한국어', flag: '🇰🇷' },
        load: () => import('./ko').then((module) => module.ko),
    },
    ar: {
        metadata: { locale: 'ar', language: 'العربية', flag: '🇸🇦' },
        load: () => import('./ar').then((module) => module.ar),
    },
    hi: {
        metadata: { locale: 'hi', language: 'हिन्दी', flag: '🇮🇳' },
        load: () => import('./hi').then((module) => module.hi),
    },
    nl: {
        metadata: { locale: 'nl', language: 'Nederlands', flag: '🇳🇱' },
        load: () => import('./nl').then((module) => module.nl),
    },
    pl: {
        metadata: { locale: 'pl', language: 'Polski', flag: '🇵🇱' },
        load: () => import('./pl').then((module) => module.pl),
    },
    tr: {
        metadata: { locale: 'tr', language: 'Türkçe', flag: '🇹🇷' },
        load: () => import('./tr').then((module) => module.tr),
    },
    sv: {
        metadata: { locale: 'sv', language: 'Svenska', flag: '🇸🇪' },
        load: () => import('./sv').then((module) => module.sv),
    },
    no: {
        metadata: { locale: 'no', language: 'Norsk', flag: '🇳🇴' },
        load: () => import('./no').then((module) => module.no),
    },
    da: {
        metadata: { locale: 'da', language: 'Dansk', flag: '🇩🇰' },
        load: () => import('./da').then((module) => module.da),
    },
    fi: {
        metadata: { locale: 'fi', language: 'Suomi', flag: '🇫🇮' },
        load: () => import('./fi').then((module) => module.fi),
    },
    el: {
        metadata: { locale: 'el', language: 'Ελληνικά', flag: '🇬🇷' },
        load: () => import('./el').then((module) => module.el),
    },
    cs: {
        metadata: { locale: 'cs', language: 'Čeština', flag: '🇨🇿' },
        load: () => import('./cs').then((module) => module.cs),
    },
    hu: {
        metadata: { locale: 'hu', language: 'Magyar', flag: '🇭🇺' },
        load: () => import('./hu').then((module) => module.hu),
    },
    ro: {
        metadata: { locale: 'ro', language: 'Română', flag: '🇷🇴' },
        load: () => import('./ro').then((module) => module.ro),
    },
    th: {
        metadata: { locale: 'th', language: 'ไทย', flag: '🇹🇭' },
        load: () => import('./th').then((module) => module.th),
    },
    vi: {
        metadata: { locale: 'vi', language: 'Tiếng Việt', flag: '🇻🇳' },
        load: () => import('./vi').then((module) => module.vi),
    },
    id: {
        metadata: { locale: 'id', language: 'Bahasa Indonesia', flag: '🇮🇩' },
        load: () => import('./id').then((module) => module.id),
    },
    ms: {
        metadata: { locale: 'ms', language: 'Bahasa Melayu', flag: '🇲🇾' },
        load: () => import('./ms').then((module) => module.ms),
    },
    he: {
        metadata: { locale: 'he', language: 'עברית', flag: '🇮🇱' },
        load: () => import('./he').then((module) => module.he),
    },
    uk: {
        metadata: { locale: 'uk', language: 'Українська', flag: '🇺🇦' },
        load: () => import('./uk').then((module) => module.uk),
    },
    sk: {
        metadata: { locale: 'sk', language: 'Slovenčina', flag: '🇸🇰' },
        load: () => import('./sk').then((module) => module.sk),
    },
    bg: {
        metadata: { locale: 'bg', language: 'Български', flag: '🇧🇬' },
        load: () => import('./bg').then((module) => module.bg),
    },
    hr: {
        metadata: { locale: 'hr', language: 'Hrvatski', flag: '🇭🇷' },
        load: () => import('./hr').then((module) => module.hr),
    },
    lt: {
        metadata: { locale: 'lt', language: 'Lietuvių', flag: '🇱🇹' },
        load: () => import('./lt').then((module) => module.lt),
    },
    lv: {
        metadata: { locale: 'lv', language: 'Latviešu', flag: '🇱🇻' },
        load: () => import('./lv').then((module) => module.lv),
    },
    et: {
        metadata: { locale: 'et', language: 'Eesti', flag: '🇪🇪' },
        load: () => import('./et').then((module) => module.et),
    },
    sl: {
        metadata: { locale: 'sl', language: 'Slovenščina', flag: '🇸🇮' },
        load: () => import('./sl').then((module) => module.sl),
    },
} satisfies Record<string, LanguageDefinition>;

export type TranslationLocale = keyof typeof languageDefinitions;

export const languages = Object.fromEntries(
    Object.entries(languageDefinitions).map(([locale, definition]) => [locale, definition.metadata])
) as {
    [Locale in TranslationLocale]: (typeof languageDefinitions)[Locale]['metadata'];
};

export const languageLocales = Object.keys(languageDefinitions) as TranslationLocale[];

export function isAvailableLanguage(locale: string): locale is TranslationLocale {
    return locale in languageDefinitions;
}

export async function loadLanguage(locale: TranslationLocale): Promise<TranslationLanguage>;
export async function loadLanguage(locale: string): Promise<TranslationLanguage | null>;
export async function loadLanguage(locale: string): Promise<TranslationLanguage | null> {
    if (!isAvailableLanguage(locale)) {
        return null;
    }

    return languageDefinitions[locale].load();
}
