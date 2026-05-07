import { afterEach, describe, expect, it } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Icon } from './Icon';
import { IconsProvider } from './IconsProvider';
import { clearRegisteredServerIconSymbols, getRegisteredServerIconSymbols } from './symbols';
import { IconStyle } from './types';

afterEach(() => {
    clearRegisteredServerIconSymbols();
});

function RegisteredSymbolsSummary() {
    const symbols = getRegisteredServerIconSymbols();
    return (
        <output
            data-testid="registered-symbols"
            data-count={symbols.length}
            data-symbol-ids={symbols.map((symbol) => symbol.symbolId).join(',')}
        />
    );
}

describe('Icon', () => {
    it('renders the mask-image path when symbol mode is disabled', () => {
        const html = renderToStaticMarkup(
            <IconsProvider assetsURL="https://icons.example.test" iconStyle={IconStyle.Regular}>
                <Icon icon="github" className="size-4" />
            </IconsProvider>
        );

        expect(html).toContain('data-testid="mask-image"');
        expect(html).toContain('https://icons.example.test/svgs/brands/github.svg?v=2');
        expect(html).not.toContain('data-testid="symbol-use"');
    });

    it('renders inline symbol references and deduplicates SSR registrations', () => {
        const html = renderToStaticMarkup(
            <IconsProvider
                assetsURL="https://icons.example.test"
                iconStyle={IconStyle.Regular}
                renderMode="symbol"
                symbolLoaderURL="/~gitbook/icons/symbol"
            >
                <>
                    <Icon icon="github" />
                    <Icon icon="github" />
                    <Icon icon="gitbook" />
                    <RegisteredSymbolsSummary />
                </>
            </IconsProvider>
        );

        expect(html).toContain('data-testid="symbol-use"');
        expect(html).toContain('href="#gb-icon-brands-github"');
        expect(html).toContain('href="#gb-icon-custom-icons-gitbook"');
        expect(html).toContain('data-testid="registered-symbols"');
        expect(html).toContain('data-count="2"');
        expect(html).toContain(
            'data-symbol-ids="gb-icon-brands-github,gb-icon-custom-icons-gitbook"'
        );
    });
});
