import { describe, expect, it } from 'bun:test';
import { toAbsoluteContentRefHref } from './utils';

describe('toAbsoluteContentRefHref', () => {
    it('normalizes relative hrefs to absolute URLs', () => {
        expect(
            toAbsoluteContentRefHref(
                {
                    href: 'marketplace-integration/supported-platforms/litcommerce-native/litcommerce-as-the-main-store',
                    text: 'LitCommerce as the Main Store',
                    active: false,
                },
                (href) => new URL(href, 'https://litcommerce.gitbook.io').toString()
            )
        ).toMatchObject({
            href: 'https://litcommerce.gitbook.io/marketplace-integration/supported-platforms/litcommerce-native/litcommerce-as-the-main-store',
        });
    });

    it('keeps already absolute hrefs unchanged', () => {
        expect(
            toAbsoluteContentRefHref(
                {
                    href: 'https://litcommerce.gitbook.io/litcommerce-helpdesk/marketplace-integration/supported-platforms/litcommerce-native/litcommerce-as-the-main-store',
                    text: 'LitCommerce as the Main Store',
                    active: false,
                },
                (href) => new URL(href, 'https://litcommerce.gitbook.io').toString()
            )
        ).toMatchObject({
            href: 'https://litcommerce.gitbook.io/litcommerce-helpdesk/marketplace-integration/supported-platforms/litcommerce-native/litcommerce-as-the-main-store',
        });
    });
});
