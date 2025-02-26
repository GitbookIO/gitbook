'use client';

import React from 'react';

import { TranslateContext } from '@/intl/client';
import { TranslationLanguage } from '@/intl/translations';

export function ClientContexts(props: {
    language: TranslationLanguage;
    children: React.ReactNode;
}) {
    const { children, language } = props;

    return <TranslateContext.Provider value={language}>{children}</TranslateContext.Provider>;
}
