import {
    type LanguageRegistration,
    createHighlighterCore,
    makeSingletonHighlighterCore,
} from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import { type BundledTheme, bundledThemes } from 'shiki/themes';

import { customThemes } from '../src/components/DocumentView/CodeBlock/customThemes';

type HighlightOptions = {
    code: string;
    language: string;
    themes: { light: string; dark: string };
    runtimeURL: string;
    tokenizeMaxLineLength: number;
};

const getSingletonHighlighter = makeSingletonHighlighterCore(createHighlighterCore);
const loadedLanguages = new Map<string, Promise<LanguageRegistration[] | null>>();
const languageAliases = new Map<string, Promise<Record<string, string>>>();

export async function highlight(options: HighlightOptions) {
    const { code, language, themes, runtimeURL, tokenizeMaxLineLength } = options;
    const registration = await loadLanguage(language, runtimeURL);
    if (!registration) {
        return null;
    }

    const highlighter = await getSingletonHighlighter({
        langs: [registration],
        themes: [getTheme(themes.light), getTheme(themes.dark)],
        engine: createJavaScriptRegexEngine({ forgiving: true, target: 'ES2018' }),
    });
    const resolvedThemes = {
        light: highlighter.getTheme(themes.light),
        dark: highlighter.getTheme(themes.dark),
    };
    const result = highlighter.codeToTokens(code, {
        lang: language,
        themes: resolvedThemes,
        defaultColor: 'light-dark()',
        tokenizeMaxLineLength,
    });

    return {
        bg: result.bg,
        fg: result.fg,
        themes: resolvedThemes,
        tokens: result.tokens,
    };
}

function getTheme(theme: string) {
    const registration = customThemes[theme] ?? bundledThemes[theme as BundledTheme];
    if (!registration) {
        throw new Error(`Unknown Shiki theme: ${theme}`);
    }
    return registration;
}

async function loadLanguage(language: string, runtimeURL: string) {
    const aliases = await loadLanguageAliases(runtimeURL);
    const canonicalLanguage = aliases[language];
    if (!canonicalLanguage) {
        return null;
    }

    const languageURL = new URL(`langs/${canonicalLanguage}.mjs`, runtimeURL).href;
    let loaded = loadedLanguages.get(languageURL);
    if (!loaded) {
        loaded = import(/* webpackIgnore: true */ languageURL)
            .then((module: { default: LanguageRegistration[] }) => module.default)
            .catch(() => null);
        loadedLanguages.set(languageURL, loaded);
    }
    return loaded;
}

function loadLanguageAliases(runtimeURL: string) {
    let aliases = languageAliases.get(runtimeURL);
    if (!aliases) {
        aliases = import(/* webpackIgnore: true */ new URL('languages.mjs', runtimeURL).href).then(
            (module: { default: Record<string, string> }) => module.default
        );
        languageAliases.set(runtimeURL, aliases);
    }
    return aliases;
}
