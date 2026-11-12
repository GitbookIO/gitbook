import { describe, expect, it } from 'bun:test';

import { isForeignHandshake } from './channel';

describe('isForeignHandshake', () => {
    const parent = {} as MessageEventSource;
    const other = {} as MessageEventSource;

    it('accepts a handshake from the expected window', () => {
        expect(isForeignHandshake({ data: { type: 'bidc-connect' }, source: parent }, parent)).toBe(
            false
        );
    });

    it('rejects a handshake from another window', () => {
        expect(isForeignHandshake({ data: { type: 'bidc-connect' }, source: other }, parent)).toBe(
            true
        );
    });

    it('ignores messages that are not handshakes', () => {
        expect(isForeignHandshake({ data: { type: 'other' }, source: other }, parent)).toBe(false);
        expect(isForeignHandshake({ data: null, source: other }, parent)).toBe(false);
    });
});
