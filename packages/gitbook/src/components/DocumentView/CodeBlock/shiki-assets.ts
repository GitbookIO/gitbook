import { bundledLanguagesInfo } from 'shiki/langs';

import { getAssetURL } from '@/lib/assets';
import { SHIKI_RUNTIME_PATH } from './shiki-runtime-path';
import { getShikiLanguage } from './shiki-syntax';

const languageAliases = new Map(
    bundledLanguagesInfo.flatMap<[string, string]>(({ id, aliases = [] }) => [
        [id, id],
        ...aliases.map((alias): [string, string] => [alias, id]),
    ])
);

export type ShikiAssets = {
    runtimeURL: string;
    languageAliasesURL: string;
    languageURL?: string;
};

type PreloadScript = (href: string, options: { as: 'script'; crossOrigin: 'anonymous' }) => void;

/**
 * Resolve the assets that the browser highlighter will load for a code-block syntax.
 */
export function getShikiAssets(syntax: string | undefined): ShikiAssets | null {
    const language = getShikiLanguage(syntax);
    if (!language || language === 'mermaid') {
        return null;
    }

    const canonicalLanguage = languageAliases.get(language);
    return {
        runtimeURL: getAssetURL(SHIKI_RUNTIME_PATH),
        languageAliasesURL: getAssetURL('shiki/languages.mjs'),
        languageURL: canonicalLanguage
            ? getAssetURL(`shiki/langs/${canonicalLanguage}.mjs`)
            : undefined,
    };
}

/**
 * Preload the assets that the browser highlighter will load for a code-block syntax.
 */
export function preloadShikiAssets(syntax: string | undefined, preload: PreloadScript) {
    const shikiAssets = getShikiAssets(syntax);
    if (!shikiAssets) {
        return;
    }

    preload(shikiAssets.runtimeURL, { as: 'script', crossOrigin: 'anonymous' });
    preload(shikiAssets.languageAliasesURL, { as: 'script', crossOrigin: 'anonymous' });
    if (shikiAssets.languageURL) {
        preload(shikiAssets.languageURL, { as: 'script', crossOrigin: 'anonymous' });
    }
}
