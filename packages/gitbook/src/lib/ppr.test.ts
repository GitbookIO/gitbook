import { describe, expect, it } from 'bun:test';

import { getPPRRouteType } from './ppr';

describe('getPPRRouteType', () => {
    it('routes opted-in static document pages through PPR', () => {
        expect(getPPRRouteType('static', true, true)).toBe('ppr');
    });

    it('keeps special static routes on their existing route', () => {
        expect(getPPRRouteType('static', false, true)).toBe('static');
    });

    it('keeps dynamic pages dynamic even when PPR is requested', () => {
        expect(getPPRRouteType('dynamic', true, true)).toBe('dynamic');
    });

    it('does not opt in without the PPR cookie', () => {
        expect(getPPRRouteType('static', true, false)).toBe('static');
    });
});
