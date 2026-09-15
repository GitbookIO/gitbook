import { describe, expect, it } from 'bun:test';

import { formatAgentFeedbackPageRef, parseAgentFeedbackPageURL } from './index';

const siteURL = 'https://docs.example.com/product';

describe('parseAgentFeedbackPageURL', () => {
    it('keeps an absolute URL', () => {
        expect(parseAgentFeedbackPageURL(`${siteURL}/getting-started`, siteURL)).toBe(
            `${siteURL}/getting-started`
        );
    });

    it('resolves a relative reference against the site', () => {
        expect(parseAgentFeedbackPageURL('getting-started', siteURL)).toBe(
            'https://docs.example.com/getting-started'
        );
    });

    it('accepts a URL outside of the site, which the caller then has to reject', () => {
        expect(parseAgentFeedbackPageURL('https://example.com/other', siteURL)).toBe(
            'https://example.com/other'
        );
    });

    it('rejects a non-HTTP protocol', () => {
        expect(parseAgentFeedbackPageURL('javascript:alert(1)', siteURL)).toBeNull();
        expect(parseAgentFeedbackPageURL('mailto:team@example.com', siteURL)).toBeNull();
    });

    it('rejects a relative reference when the site has no published URL', () => {
        expect(parseAgentFeedbackPageURL('getting-started', undefined)).toBeNull();
    });
});

describe('formatAgentFeedbackPageRef', () => {
    it('formats a page pointer as a content ref', () => {
        expect(formatAgentFeedbackPageRef({ spaceId: 'space-1', pageId: 'page-1' })).toBe(
            '/spaces/space-1/pages/page-1'
        );
    });
});
