import { describe, expect, it, mock } from 'bun:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { IconsProvider } from '@gitbook/icons';

import { TranslateContext } from '@/intl/client';
import { en } from '@/intl/translations/en';

mock.module('./RecordCard', () => ({
    RecordCard: () => <div data-testid="record-card" />,
}));

mock.module('./TableSearch', () => ({
    TableSearchRecord: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const { ViewCards } = await import('./ViewCards');

function makeProps(wrap: boolean) {
    return {
        block: { data: { fullWidth: false } },
        view: { type: 'cards', wrap, cardSize: 'medium' },
        records: [
            ['record-1', {}],
            ['record-2', {}],
            ['record-3', {}],
        ] as any,
        context: { mode: 'default' },
        style: undefined,
    } as any;
}

function renderWithContext(children: React.ReactNode) {
    return renderToStaticMarkup(
        <IconsProvider assetsURL="https://icons.example.com">
            <TranslateContext.Provider value={en}>{children}</TranslateContext.Provider>
        </IconsProvider>
    );
}

describe('ViewCards', () => {
    it('renders the carousel with a symmetric peek and conditional edge masks', () => {
        const markup = renderWithContext(<ViewCards {...makeProps(false)} />);

        // Gutter-sized peek, the full 3rem from `2xl`.
        expect(markup).toContain('-mx-4 sm:-mx-6 md:-mx-8 2xl:-mx-12');
        expect(markup).toContain('scroll-px-4');
        expect(markup).toContain('2xl:scroll-px-12');
        expect(markup).toContain('left-0');
        expect(markup).toContain('2xl:ml-8');
        expect(markup).toContain('right-0');
        expect(markup).toContain('2xl:mr-8');
        expect(markup).not.toContain('before:bg-linear-to-r');
        expect(markup).not.toContain('after:bg-linear-to-l');
        expect(markup).toContain('snap-mandatory');
    });

    it('renders the wrapping grid by default', () => {
        const markup = renderWithContext(<ViewCards {...makeProps(true)} />);

        expect(markup).toContain('inline-grid');
    });
});
