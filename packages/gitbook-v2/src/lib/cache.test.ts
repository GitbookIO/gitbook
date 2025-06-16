import { describe, expect, it } from 'bun:test';
import { withStableRef } from './cache';

describe('withStableRef', () => {
    it('should return primitive values as is', () => {
        const toStableRef = withStableRef();

        expect(toStableRef(42)).toBe(42);
        expect(toStableRef('hello')).toBe('hello');
        expect(toStableRef(true)).toBe(true);
        expect(toStableRef(null)).toBe(null);
        expect(toStableRef(undefined)).toBe(undefined);
    });

    it('should return the same reference for identical objects', () => {
        const toStableRef = withStableRef();

        const obj1 = { a: 1, b: 2 };
        const obj2 = { a: 1, b: 2 };

        const ref1 = toStableRef(obj1);
        const ref2 = toStableRef(obj2);

        expect(ref1).toBe(ref2);
        expect(ref1).toBe(obj1);
        expect(ref1).not.toBe(obj2);
    });

    it('should return the same reference for identical arrays', () => {
        const toStableRef = withStableRef();

        const arr1 = [1, 2, 3];
        const arr2 = [1, 2, 3];

        const ref1 = toStableRef(arr1);
        const ref2 = toStableRef(arr2);

        expect(ref1).toBe(ref2);
        expect(ref1).toBe(arr1);
        expect(ref1).not.toBe(arr2);
    });

    it('should return the same reference for identical nested objects', () => {
        const toStableRef = withStableRef();

        const obj1 = { a: { b: 1 }, c: [2, 3] };
        const obj2 = { a: { b: 1 }, c: [2, 3] };

        const ref1 = toStableRef(obj1);
        const ref2 = toStableRef(obj2);

        expect(ref1).toBe(ref2);
        expect(ref1).toBe(obj1);
        expect(ref1).not.toBe(obj2);
    });

    it('should return different references for different objects', () => {
        const toStableRef = withStableRef();

        const obj1 = { a: 1 };
        const obj2 = { a: 2 };

        const ref1 = toStableRef(obj1);
        const ref2 = toStableRef(obj2);

        expect(ref1).not.toBe(ref2);
    });

    it('should maintain reference stability across multiple calls', () => {
        const toStableRef = withStableRef();

        const obj = { a: 1 };
        const ref1 = toStableRef(obj);
        const ref2 = toStableRef(obj);
        const ref3 = toStableRef(obj);

        expect(ref1).toBe(ref2);
        expect(ref2).toBe(ref3);
    });
});
