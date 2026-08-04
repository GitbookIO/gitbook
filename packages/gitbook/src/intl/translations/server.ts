import 'server-only';

import { getAssetURL } from '@/lib/assets';
import { getCloudflareContext } from '@/lib/data/cloudflare';

import {
    type TranslationLanguage,
    type TranslationLocale,
    defaultLanguage,
    isAvailableLanguage,
} from '.';

const assetPath = (locale: TranslationLocale) => `translations/${locale}.json`;

type CloudflareAssets = {
    fetch(input: URL): Promise<Response>;
};

const pendingLanguages = new Map<TranslationLocale, Promise<TranslationLanguage | null>>();

export async function loadLanguage(locale: TranslationLocale): Promise<TranslationLanguage | null>;
export async function loadLanguage(locale: string): Promise<TranslationLanguage | null>;
export async function loadLanguage(locale: string): Promise<TranslationLanguage | null> {
    if (!isAvailableLanguage(locale)) {
        return null;
    }

    if (locale === 'en') {
        return defaultLanguage;
    }

    let pending = pendingLanguages.get(locale);
    if (!pending) {
        pending = loadLanguageAsset(locale).catch(() => null);
        pendingLanguages.set(locale, pending);
    }

    return pending;
}

async function loadLanguageAsset(locale: TranslationLocale): Promise<TranslationLanguage> {
    const path = assetPath(locale);
    const cloudflareAssets = getCloudflareAssets();
    const response = cloudflareAssets
        ? await cloudflareAssets.fetch(new URL(`/~gitbook/static/${path}`, 'http://assets.local'))
        : await fetch(getAssetURL(path));

    if (!response.ok) {
        throw new Error(`Unable to load translations for ${locale}: ${response.status}`);
    }

    const language: unknown = await response.json();
    if (!isTranslationLanguage(language)) {
        throw new Error(`Translations for ${locale} have an invalid shape`);
    }

    return language;
}

function getCloudflareAssets(): CloudflareAssets | null {
    try {
        return getCloudflareContext()?.env.ASSETS ?? null;
    } catch {
        return null;
    }
}

function isTranslationLanguage(value: unknown): value is TranslationLanguage {
    if (!value || typeof value !== 'object') {
        return false;
    }

    return Object.keys(defaultLanguage).every(
        (key) => typeof (value as Record<string, unknown>)[key] === 'string'
    );
}
