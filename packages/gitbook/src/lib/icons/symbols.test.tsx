import { afterEach, describe, expect, it } from 'bun:test';
import { Icon, IconStyle, IconsProvider, clearRegisteredServerIconSymbols } from '@gitbook/icons';
import type { NextRequest } from 'next/server';
import { renderToStaticMarkup } from 'react-dom/server';

import { GET } from '@/app/~gitbook/icons/symbol/[style]/[icon]/route';
import { IconSpriteDefinitions } from '@/components/RootLayout/IconSpriteDefinitions';

import { getIconSymbol } from './symbols';

afterEach(() => {
    clearRegisteredServerIconSymbols();
});

describe('icon symbols', () => {
    it('loads symbol markup for multiple families', async () => {
        const regular = await getIconSymbol('regular', 'jar', 'gb-icon-regular-jar');
        const brand = await getIconSymbol('brands', 'github', 'gb-icon-brands-github');
        const custom = await getIconSymbol(
            'custom-icons',
            'gitbook',
            'gb-icon-custom-icons-gitbook'
        );
        const sharp = await getIconSymbol(
            'sharp-solid',
            'download',
            'gb-icon-sharp-solid-download'
        );

        expect(regular?.symbol).toContain('id="gb-icon-regular-jar"');
        expect(regular?.symbol).toContain('viewBox="0 0 320 512"');
        expect(brand?.symbol).toContain('id="gb-icon-brands-github"');
        expect(custom?.symbol).toContain('id="gb-icon-custom-icons-gitbook"');
        expect(sharp?.symbol).toContain('id="gb-icon-sharp-solid-download"');
    });

    it('emits only the registered subset sprite definitions', async () => {
        renderToStaticMarkup(
            <IconsProvider
                assetsURL="https://icons.example.test"
                iconStyle={IconStyle.Regular}
                renderMode="symbol"
                symbolLoaderURL="/~gitbook/icons/symbol"
            >
                <>
                    <Icon icon="jar" iconStyle={IconStyle.Regular} />
                    <Icon icon="jar" iconStyle={IconStyle.Regular} />
                    <Icon icon="github" />
                    <Icon icon="download" iconStyle={IconStyle.SharpSolid} />
                    <Icon icon="gitbook" />
                </>
            </IconsProvider>
        );

        const sprite = await IconSpriteDefinitions();
        const html = sprite ? renderToStaticMarkup(sprite) : '';

        expect(html).toContain('data-testid="icon-sprite-root"');
        expect(html).toContain('id="gb-icon-regular-jar"');
        expect(html).toContain('id="gb-icon-brands-github"');
        expect(html).toContain('id="gb-icon-sharp-solid-download"');
        expect(html).toContain('id="gb-icon-custom-icons-gitbook"');
        expect(html.match(/id="gb-icon-regular-jar"/g)?.length).toBe(1);
    });

    it('eagerly seeds search chrome icons into the sprite', async () => {
        const sprite = await IconSpriteDefinitions();
        const html = sprite ? renderToStaticMarkup(sprite) : '';

        expect(html).toContain('id="gb-icon-regular-search"');
        expect(html).toContain('id="gb-icon-regular-chevron-right"');
        expect(html).toContain('id="gb-icon-regular-arrow-turn-down-left"');
        expect(html).toContain('id="gb-icon-regular-xmark"');
    });

    it('serves symbols from the internal route', async () => {
        const response = await GET(
            new Request(
                'http://localhost/~gitbook/icons/symbol/brands/github'
            ) as unknown as NextRequest,
            {
                params: Promise.resolve({
                    style: 'brands',
                    icon: 'github',
                }),
            }
        );

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toBe('image/svg+xml; charset=utf-8');
        expect(await response.text()).toContain('id="gb-icon-brands-github"');
    });

    it('serves alias-based symbols from the internal route', async () => {
        const response = await GET(
            new Request(
                'http://localhost/~gitbook/icons/symbol/regular/search'
            ) as unknown as NextRequest,
            {
                params: Promise.resolve({
                    style: 'regular',
                    icon: 'search',
                }),
            }
        );

        expect(response.status).toBe(200);
        expect(await response.text()).toContain('id="gb-icon-regular-search"');
    });
});
