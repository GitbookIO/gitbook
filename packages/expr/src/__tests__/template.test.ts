import { describe, expect, it } from 'bun:test';

import { ExpressionRuntime, parseTemplate } from '../';

describe('template expressions', () => {
    it('should parse template into parts', () => {
        const parts = parseTemplate('Hello {{ user.name }}!');
        expect(parts).toEqual([
            { type: 'text', value: 'Hello ', start: 0, end: 6 },
            { type: 'expression', value: 'user.name', start: 8, end: 19 },
            { type: 'text', value: '!', start: 21, end: 22 },
        ]);
    });

    it('should parse template starting with an expression', () => {
        const parts = parseTemplate('{{ user.name }} is cool');
        expect(parts).toEqual([
            { type: 'expression', value: 'user.name', start: 2, end: 13 },
            { type: 'text', value: ' is cool', start: 15, end: 23 },
        ]);
    });

    it('should parse template without expressions', () => {
        const parts = parseTemplate('Hello world');
        expect(parts).toEqual([{ type: 'text', value: 'Hello world', start: 0, end: 11 }]);
    });

    it('should evaluate template', () => {
        const runtime = new ExpressionRuntime();
        const result = runtime.evaluateTemplate('Hello {{ user.name }}!', {
            user: { name: 'John' },
        });
        expect(result).toBe('Hello John!');
    });
});
