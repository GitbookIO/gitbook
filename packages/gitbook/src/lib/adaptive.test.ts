import { describe, expect, it } from 'bun:test';

import { isVisitorAuthenticated } from './adaptive';

describe('isVisitorAuthenticated', () => {
    it('is false without claims', () => {
        expect(isVisitorAuthenticated({})).toBe(false);
    });

    it('is false with only unsigned claims', () => {
        expect(isVisitorAuthenticated({ unsigned: { plan: 'free' } })).toBe(false);
    });

    it('is true with signed claims', () => {
        expect(isVisitorAuthenticated({ role: 'admin', unsigned: {} })).toBe(true);
    });
});
