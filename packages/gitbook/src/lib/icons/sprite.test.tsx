import { describe, expect, it } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Icon, IconStyle, IconsProvider } from '@gitbook/icons';

const hashtag = { viewBox: '0 0 448 512', markup: '<path d="M1 1h2"></path>' };
const star = { viewBox: '0 0 576 512', markup: '<path d="M3 3h4"></path>' };

describe('icon sprite', () => {
    it('defines each source once and references it from every icon', () => {
        const html = renderToStaticMarkup(
            <IconsProvider
                iconStyle={IconStyle.Regular}
                iconSources={{ 'regular/hashtag': hashtag }}
                sprite
            >
                <Icon icon="hashtag" />
                <Icon icon="hashtag" className="size-4" />
            </IconsProvider>
        );

        expect(html.split(hashtag.markup)).toHaveLength(2);
        expect(html).toContain('<g id="gb-icon-regular-hashtag">');
        expect(html.match(/<use href="#gb-icon-regular-hashtag"><\/use>/g)).toHaveLength(2);
        expect(html).toContain('viewBox="0 0 448 512"');
    });

    it('inlines the markup without a sprite', () => {
        const html = renderToStaticMarkup(
            <IconsProvider
                iconStyle={IconStyle.Regular}
                iconSources={{ 'regular/hashtag': hashtag }}
            >
                <Icon icon="hashtag" />
            </IconsProvider>
        );

        expect(html).not.toContain('<use');
        expect(html).not.toContain('data-gb-icon-sprite');
        expect(html).toContain(hashtag.markup);
    });

    it('inlines sources that only an outer provider defines', () => {
        const html = renderToStaticMarkup(
            <IconsProvider iconStyle={IconStyle.Regular} iconSources={{ 'regular/star': star }}>
                <IconsProvider iconSources={{ 'regular/hashtag': hashtag }} sprite>
                    <Icon icon="star" />
                    <Icon icon="hashtag" />
                </IconsProvider>
            </IconsProvider>
        );

        expect(html).toContain(`>${star.markup}</svg>`);
        expect(html).not.toContain('gb-icon-regular-star');
        expect(html).toContain('<use href="#gb-icon-regular-hashtag"></use>');
    });
});
