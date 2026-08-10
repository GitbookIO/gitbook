import { describe, expect, it } from 'bun:test';
import { getOpenAPISchemaAnchorId } from './schemas';

describe('getOpenAPISchemaAnchorId', () => {
    it('lowercases a simple name', () => {
        expect(getOpenAPISchemaAnchorId('User')).toBe('user');
    });

    it('replaces non-alphanumeric runs with a single dash', () => {
        expect(getOpenAPISchemaAnchorId('Pet Store')).toBe('pet-store');
        expect(getOpenAPISchemaAnchorId('User.Profile_v2')).toBe('user-profile-v2');
    });

    it('trims leading and trailing dashes', () => {
        expect(getOpenAPISchemaAnchorId('#User#')).toBe('user');
        expect(getOpenAPISchemaAnchorId('  spaced  ')).toBe('spaced');
    });
});
