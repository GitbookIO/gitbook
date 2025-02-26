'use client';

import type React from 'react';

import { TranslateContext } from '@/intl/client';
import type { TranslationLanguage } from '@/intl/translations';

export function ClientContexts(props: {
    language: TranslationLanguage;
    children: React.ReactNode;
}) {
    const { children, language } = props;

    return <TranslateContext.Provider value={language}>{children}</TranslateContext.Provider>;
}
