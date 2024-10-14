'use client';

import React from 'react';
import { RecoilRoot } from 'recoil';

import { TranslateContext } from '@/intl/client';
import { TranslationLanguage } from '@/intl/translations';

export function ClientContexts(props: {
    language: TranslationLanguage;
    children: React.ReactNode;
}) {
    const { children, language } = props;

    return (
        <RecoilRoot>
            <TranslateContext.Provider value={language}>{children}</TranslateContext.Provider>
        </RecoilRoot>
    );
}
