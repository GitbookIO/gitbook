import * as React from 'react';

import { TranslationLanguage } from './translations';

export * from './translate';

export const TranslateContext = React.createContext<TranslationLanguage | null>(null);

/**
 * Use the current language to translate a string.
 */
export function useLanguage(): TranslationLanguage {
    const language = React.useContext(TranslateContext);
    if (!language) {
        throw new Error('The hook useLanguage should be wrapped in a <TranslateContext>');
    }
    return language;
}
