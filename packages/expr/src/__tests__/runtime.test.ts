import { parseExpressionAt } from 'acorn';
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

import { ExpressionError } from '../errors';
import {
    ALLOWED_METHODS,
    MAX_CALLBACK_CALLS,
    UnsafeExpressionError,
    evaluateRestricted,
} from '../restricted';
import { ExpressionRuntime } from '../runtime';
import { SymbolArray, SymbolString } from '../symbols';
import type { Logger } from '../types';

const SILENT_LOGGER: Logger = {
    debug: () => {},
    info: () => {},
    error: () => {},
};

const getInputs = () => ({ user: { role: 'editor' }, tags: ['b', 'a'], count: 1 });

// Returns the thrown error instead of throwing, so that side effects can be asserted first.
const attempt = (fn: () => unknown) => {
    try {
        return fn();
    } catch (error) {
        return error;
    }
};

describe('ExpressionRuntime', () => {
    const runtime = new ExpressionRuntime(SILENT_LOGGER);

    describe('evaluate', () => {
        it.each([
            {
                scenario: 'simple condition',
                condition: 'isBetaUser === true',
                inputs: { isBetaUser: false },
                expectedResult: false,
            },
            {
                scenario: 'simple condition with multiple inputs variables',
                condition: 'useProductA && !isBetaUser',
                inputs: {
                    useProductA: true,
                    isBetaUser: false,
                },
                expectedResult: true,
            },
            {
                scenario: 'condition with objects in inputs variables',
                condition: 'products.includes("productA") && userSegments.alpha',
                inputs: {
                    products: ['productA', 'productB'],
                    userSegments: {
                        alpha: true,
                        beta: false,
                    },
                },
                expectedResult: true,
            },
            {
                scenario: 'array method',
                condition: 'reviews.every(review => !!review.status)',
                inputs: { reviews: [{ status: 'approved' }, { status: 'approved' }] },
                expectedResult: true,
            },
            {
                scenario: 'array every',
                condition: 'reviews.every(review => review.status === "approved")',
                inputs: { reviews: [{ status: 'approved' }, { status: 'approved' }] },
                expectedResult: true,
            },
            {
                scenario: 'array includes',
                condition: 'reviews.includes("approved")',
                inputs: { reviews: ['pending', 'approved'] },
                expectedResult: true,
            },
            {
                scenario: 'array map',
                condition: '[1, 2, 3].map(n => n * x)',
                inputs: { x: 2 },
                expectedResult: [2, 4, 6],
            },
            {
                scenario: 'array filter',
                condition: 'reviews.filter(review => review.status === "approved").length >= 2',
                inputs: {
                    reviews: [
                        { status: 'approved' },
                        { status: 'pending' },
                        { status: 'approved' },
                    ],
                },
                expectedResult: true,
            },
            {
                scenario: 'array some',
                condition: 'tags.some(tag => tag.startsWith("b") && tag.length === x)',
                inputs: { tags: ['a', 'bb'], x: 2 },
                expectedResult: true,
            },
            {
                scenario: 'nested callbacks reading outer parameters',
                condition: 'required.every(id => reviews.some(review => review.reviewer === id))',
                inputs: {
                    required: ['u1', 'u2'],
                    reviews: [{ reviewer: 'u2' }, { reviewer: 'u1' }],
                },
                expectedResult: true,
            },
            {
                scenario: 'callback parameter shadowing an input',
                condition: 'tags.some(role => role === "b") && role === "admin"',
                inputs: { tags: ['a', 'b'], role: 'admin' },
                expectedResult: true,
            },
            {
                scenario: 'array literal includes',
                condition: '["admin", "editor"].includes(user.role)',
                inputs: { user: { role: 'admin' } },
                expectedResult: true,
            },
            {
                scenario: 'array and string at',
                condition: 'tags.at(-1).at(0)',
                inputs: { tags: ['a', 'bc'] },
                expectedResult: 'b',
            },
            {
                scenario: 'string startsWith',
                condition: 'user.role.startsWith("ad")',
                inputs: { user: { role: 'admin' } },
                expectedResult: true,
            },
            {
                scenario: 'string endsWith',
                condition: 'user.role.endsWith("min")',
                inputs: { user: { role: 'admin' } },
                expectedResult: true,
            },
            {
                scenario: 'string includes',
                condition: 'user.role.includes("dm")',
                inputs: { user: { role: 'admin' } },
                expectedResult: true,
            },
            {
                scenario: 'string toLowerCase',
                condition: 'user.role.toLowerCase() === "admin"',
                inputs: { user: { role: 'ADMIN' } },
                expectedResult: true,
            },
            {
                scenario: 'string toUpperCase',
                condition: 'user.role.toUpperCase() === "ADMIN"',
                inputs: { user: { role: 'admin' } },
                expectedResult: true,
            },
            {
                scenario: 'string trim',
                condition: 'user.role.trim() === "admin"',
                inputs: { user: { role: '  admin  ' } },
                expectedResult: true,
            },
            {
                scenario: 'string length and index',
                condition: 'user.role.length === 5 && user.role[0] === "a"',
                inputs: { user: { role: 'admin' } },
                expectedResult: true,
            },
            {
                scenario: 'missing property',
                condition: 'user.plan === undefined && missing === undefined',
                inputs: { user: { role: 'admin' } },
                expectedResult: true,
            },
        ])(
            'should properly evaluate/safeEvaluate a valid conditional expression: $scenario',
            ({ condition, inputs, expectedResult }) => {
                expect(runtime.evaluate(condition, inputs)).toEqual(expectedResult);
                expect(runtime.safeEvaluate(condition, inputs).value).toEqual(expectedResult);
            }
        );

        const INVALID_EXPRESSSIONS = [
            {
                scenario: 'invalid syntax',
                condition: 't}=d',
                inputs: {},
            },
            {
                scenario: 'non conditional expression',
                condition: 'const a = 1;',
                inputs: {},
            },
            {
                scenario: 'unsafe expression',
                condition: 'while (1) {}',
                inputs: {},
            },
        ];

        it.each(INVALID_EXPRESSSIONS)(
            'should return an object with the error for non conditional expression or syntax errors when using safeEvaluate is on (default): $scenario',
            ({ condition, inputs }) => {
                const result = runtime.safeEvaluate(condition, inputs);
                expect(result.value).toBeUndefined();
                expect(result.error instanceof ExpressionError).toBe(true);
            }
        );

        it.each(INVALID_EXPRESSSIONS)(
            'should throw an error when using evaluate with invalid expressions',
            ({ condition, inputs }) => {
                expect(() => runtime.evaluate(condition, inputs)).toThrowError(ExpressionError);
            }
        );
    });

    describe('unsafe expressions', () => {
        // Each expression tries to call this function, which only an escape from the restrictions can reach.
        const PAYLOAD = '__expressionPayload';
        const CALL_PAYLOAD = `globalThis.${PAYLOAD}()`;
        const payload = mock(() => true);

        beforeEach(() => {
            payload.mockClear();
            Reflect.set(globalThis, PAYLOAD, payload);
        });

        afterEach(() => {
            Reflect.deleteProperty(globalThis, PAYLOAD);
        });

        const UNSAFE_EXPRESSIONS = [
            {
                scenario: 'array key bypassing the constructor check',
                condition: `({})[["constructor"]][["constructor"]]("${CALL_PAYLOAD}")()`,
            },
            {
                scenario: 'array key on an input value',
                condition: `user.role[["constructor"]][["constructor"]]("${CALL_PAYLOAD}")()`,
            },
            {
                scenario: 'array key on a method',
                condition: `"".includes[["constructor"]]("${CALL_PAYLOAD}")()`,
            },
            {
                scenario: 'global access in a callback',
                condition: `[1].some(() => ${CALL_PAYLOAD})`,
            },
            {
                scenario: 'computed constructor key in a callback',
                condition: `[1].some(x => x["constr" + "uctor"]["constr" + "uctor"]("${CALL_PAYLOAD}")())`,
            },
            {
                scenario: 'computed constructor key in a map callback',
                condition: `[1].map(x => x["constr" + "uctor"]["constr" + "uctor"]("${CALL_PAYLOAD}")())`,
            },
            {
                scenario: 'arrow function called through implicit toString',
                condition: `({ toString: () => ${CALL_PAYLOAD} }) + ""`,
            },
            { scenario: 'inherited property', condition: 'user.constructor' },
            {
                scenario: 'inherited property with an array key',
                condition: 'user[["constructor"]]',
            },
            {
                scenario: 'inherited property of a string',
                condition: 'user.role.toString',
                runtimeOnly: true,
            },
            { scenario: 'inherited property of a number', condition: 'count.constructor' },
            { scenario: 'prototype access', condition: 'user.__proto__' },
            { scenario: 'inherited variable', condition: 'toString', runtimeOnly: true },
            { scenario: 'arrow function outside a callback', condition: '[() => 1].length' },
            {
                scenario: 'block-bodied arrow function',
                condition: '[1, 2, 3].some(() => { while (1) {} })',
            },
            { scenario: 'function expression', condition: '[1].some(function () { return 1 })' },
            { scenario: 'async arrow callback', condition: 'tags.some(async t => t)' },
            {
                scenario: 'async function callback',
                condition: 'tags.some(async function (t) { return t })',
            },
            { scenario: 'immediately invoked async arrow', condition: '(async () => 1)()' },
            { scenario: 'object literal', condition: '({ role: "admin" }).role' },
            { scenario: 'constructor call', condition: 'new Date()' },
            { scenario: 'method outside the standard library', condition: '"a".padStart(1e9)' },
            { scenario: 'string repeat', condition: 'user.role.repeat(1e9)' },
            { scenario: 'string repeat in a callback', condition: 'tags.map(t => t.repeat(1e9))' },
            { scenario: 'mutating array method', condition: 'tags.reverse()' },
            {
                scenario: 'callback for a method not taking one',
                condition: 'tags.includes(t => t)',
            },
            {
                scenario: 'inherited variable in a callback',
                condition: 'tags.some(t => toString)',
                runtimeOnly: true,
            },
            {
                scenario: 'callback parameter named __proto__',
                condition: 'tags.some(__proto__ => 1)',
            },
            {
                scenario: 'callback parameter named constructor',
                condition: 'tags.some(constructor => 1)',
            },
            {
                scenario: 'expression deeper than the library limit',
                condition: `${'!'.repeat(60)}true`,
                runtimeOnly: true,
            },
            {
                scenario: 'array literal longer than the library limit',
                condition: `[${'1,'.repeat(10_001)}].length`,
                runtimeOnly: true,
            },
            {
                scenario: 'inherited property of a callback parameter',
                condition: 'tags.some(t => t.constructor)',
            },
            { scenario: 'non-arrow callback', condition: 'tags.map(Function)' },
            { scenario: 'callback with an extra argument', condition: 'tags.some(t => t, "a")' },
            { scenario: 'missing callback', condition: 'tags.some()' },
            {
                scenario: 'too many nested callback calls',
                condition:
                    '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(a => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(b => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(d => d))))',
                runtimeOnly: true,
            },
            { scenario: 'method on a plain object', condition: 'user.hasOwnProperty("role")' },
            { scenario: 'method on a function', condition: '[1].some.call([1], n => n)' },
            {
                scenario: 'non-primitive argument',
                condition: '[user].includes(user)',
                runtimeOnly: true,
            },
            { scenario: 'regex operator', condition: 'user.role =~ /^ed/' },
            { scenario: 'regex argument', condition: 'user.role.includes(/(a+)+b/)' },
            { scenario: 'BigInt literal', condition: '2n ** 64n' },
            {
                scenario: 'BigInt literal in a callback',
                condition: '[1, 2, 3, 4].some((n) => 9n ** 9n ** 9n)',
            },
            { scenario: 'BigInt literal in an array', condition: '[9n][0] ** 9n' },
            { scenario: 'BigInt literal in a template', condition: '`${9n ** 9n ** 9n}`' },
            { scenario: 'delete', condition: 'delete user.role' },
            { scenario: 'assignment', condition: 'user.role = "admin"' },
            { scenario: 'update', condition: 'count++' },
        ];

        it.each(UNSAFE_EXPRESSIONS)(
            'should throw with evaluate and return the error with safeEvaluate: $scenario',
            ({ condition }) => {
                const evaluated = attempt(() => runtime.evaluate(condition, getInputs()));
                const safeEvaluated = runtime.safeEvaluate(condition, getInputs());

                expect(payload).not.toHaveBeenCalled();
                expect(evaluated).toBeInstanceOf(ExpressionError);
                expect(safeEvaluated.value).toBeUndefined();
                expect(safeEvaluated.error).toBeInstanceOf(ExpressionError);
            }
        );

        it.each(UNSAFE_EXPRESSIONS)(
            'should evaluate to false with evaluateBoolean/evaluateBooleanAll: $scenario',
            ({ condition }) => {
                const evaluated = runtime.evaluateBoolean(condition, getInputs());
                const evaluatedAll = runtime.evaluateBooleanAll(['true', condition], getInputs());

                expect(payload).not.toHaveBeenCalled();
                expect(evaluated).toBe(false);
                expect(evaluatedAll).toBe(false);
            }
        );

        it.each(UNSAFE_EXPRESSIONS)(
            'should throw without executing code with evaluateTemplate: $scenario',
            ({ condition }) => {
                const evaluated = attempt(() =>
                    runtime.evaluateTemplate(`Hello {{ ${condition} }}`, getInputs())
                );

                expect(payload).not.toHaveBeenCalled();
                expect(evaluated).toBeInstanceOf(ExpressionError);
            }
        );

        it.each(UNSAFE_EXPRESSIONS)('should not mutate the inputs: $scenario', ({ condition }) => {
            const inputs = getInputs();
            attempt(() => runtime.evaluate(condition, inputs));
            expect(inputs).toEqual(getInputs());
        });

        it.each(UNSAFE_EXPRESSIONS)(
            'should report the error when parsing, for editors: $scenario',
            ({ condition, runtimeOnly }) => {
                const parsed = attempt(() => runtime.parse(condition));
                const { errors } = runtime.parseTemplate(`Hello {{ ${condition} }}`);

                if (runtimeOnly) {
                    // Depends on the values, so only enforced when evaluating.
                    expect(parsed).not.toBeInstanceOf(Error);
                    expect(errors).toEqual([]);
                } else {
                    expect(parsed).toBeInstanceOf(ExpressionError);
                    expect((parsed as ExpressionError).location).toBeDefined();
                    expect(errors).toHaveLength(1);
                }
            }
        );

        it.each(UNSAFE_EXPRESSIONS)(
            'should not execute code when evaluating without validating first: $scenario',
            ({ condition }) => {
                const expression = parseExpressionAt(condition, 0, { ecmaVersion: 'latest' });
                const evaluated = attempt(() => evaluateRestricted(expression, getInputs()));

                expect(payload).not.toHaveBeenCalled();
                expect(
                    evaluated instanceof UnsafeExpressionError || evaluated instanceof RangeError
                ).toBe(true);
            }
        );

        it('should point the parse error at the offending token', () => {
            const condition = 'user.role.padStart(10)';
            const error = attempt(() => runtime.parse(condition)) as ExpressionError;

            expect(error.message).toBe('Method "padStart" is not supported');
            expect(error.location).toEqual({ line: 1, column: 10 });
            expect(condition.slice(error.token?.start, error.token?.end)).toBe('padStart');
        });

        it('should keep the location of the error when evaluating', () => {
            const condition = 'user.role.padStart(10)';
            const error = attempt(() => runtime.evaluate(condition, getInputs()));

            expect(error).toBeInstanceOf(UnsafeExpressionError);
            expect((error as ExpressionError).location).toEqual({ line: 1, column: 10 });
        });

        it('should explain why async callbacks are rejected', () => {
            const error = attempt(() => runtime.parse('tags.some(async t => t)'));

            expect((error as ExpressionError).message).toBe('Async functions are not supported');
        });

        it('should not validate when parsing loosely for autocomplete', () => {
            expect(() => runtime.parse('user.constructor', { loose: true })).not.toThrow();
        });

        it.each(['constructor', '__proto__', 'prototype', '__defineGetter__', '__lookupGetter__'])(
            'should not read an own "%s" key of the inputs',
            (key) => {
                // JSON.parse creates own properties, even for `__proto__`.
                const inputs = JSON.parse(`{ "data": { "${key}": "value" }, "${key}": "value" }`);

                expect(() => runtime.evaluate(`data["${key}"]`, inputs)).toThrow(ExpressionError);
                expect(() => runtime.evaluate(key, inputs)).toThrow(ExpressionError);
                expect(runtime.evaluateBoolean(`data["${key}"] === "value"`, inputs)).toBe(false);
            }
        );

        it('should limit the number of callback calls per evaluation', () => {
            const condition = 'items.map(item => item).length > 0';
            const atLimit = { items: Array.from({ length: MAX_CALLBACK_CALLS }, (_, i) => i) };
            const overLimit = { items: [...atLimit.items, MAX_CALLBACK_CALLS] };

            expect(runtime.evaluate(condition, atLimit)).toBe(true);
            // The budget is per evaluation, not shared across evaluations.
            expect(runtime.evaluate(condition, atLimit)).toBe(true);
            expect(() => runtime.evaluate(condition, overLimit)).toThrow(ExpressionError);
            expect(runtime.evaluateBoolean(condition, overLimit)).toBe(false);
        });

        it('should only allow the standard library offered in the editor and reviewed additions', () => {
            const stringMethods = SymbolString().methods.map((method) => method.name);
            const arrayMethods = SymbolArray({ items: SymbolString() }).methods.map(
                (method) => method.name
            );

            // Extend only after reviewing that a method is safe (see `ALLOWED_METHODS`).
            expect(ALLOWED_METHODS.string).toEqual(new Set(stringMethods));
            expect(ALLOWED_METHODS.array).toEqual(new Set([...arrayMethods, 'filter', 'map']));
        });
    });

    describe('parse', () => {
        it('should produce a valid ESTree compatible AST node for conditional expressions', () => {
            const ast = runtime.parse('isBetaUser === true');

            expect(ast.result).toEqual({
                type: 'BinaryExpression',
                start: 0,
                end: 19,
                loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 19 } },
                left: {
                    type: 'Identifier',
                    start: 0,
                    end: 10,
                    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
                    name: 'isBetaUser',
                },
                operator: '===',
                right: {
                    type: 'Literal',
                    start: 15,
                    end: 19,
                    loc: { start: { line: 1, column: 15 }, end: { line: 1, column: 19 } },
                    value: true,
                    raw: 'true',
                },
            });
        });

        it.each([
            {
                scenario: 'invalid syntax',
                condition: 't}=d',
            },
            {
                scenario: 'non conditional expression',
                condition: 'const a = 1;',
            },
        ])(
            'should throw an error for non conditional expressions or syntax errors: $scenario',
            ({ condition }) => {
                expect(() => runtime.parse(condition)).toThrowError(ExpressionError);
            }
        );
    });

    describe('getVariables', () => {
        it.each([
            {
                scenario: 'single variable',
                condition: 'isBetaUser === true',
                expectedVariables: ['isBetaUser'],
            },
            {
                scenario: 'multiple variables',
                condition: 'useProductA && !isBetaUser',
                expectedVariables: ['useProductA', 'isBetaUser'],
            },
            {
                scenario: 'member expression',
                condition: 'user.role === "admin"',
                expectedVariables: ['user.role'],
            },
            {
                scenario: 'nested member expression with method call',
                condition: 'products.includes("productA") && userSegments.alpha',
                expectedVariables: ['products.includes', 'userSegments.alpha'],
            },
        ])(
            'should return variables used in expression: $scenario',
            ({ condition, expectedVariables }) => {
                expect(runtime.getVariables(condition)).toEqual(expectedVariables);
            }
        );

        it.each([
            {
                scenario: 'invalid syntax',
                condition: 't}=d',
            },
            {
                scenario: 'non conditional expression',
                condition: 'const a = 1;',
            },
        ])('should return an empty array for invalid expressions: $scenario', ({ condition }) => {
            expect(runtime.getVariables(condition)).toEqual([]);
        });
    });

    describe.skip('generate', () => {
        it.each([
            {
                scenario: 'simple condition',
                condition: 'isBetaUser === true',
            },
            {
                scenario: 'simple condition with multiple inputs variables',
                condition: 'useProductA && !isBetaUser',
            },
            {
                scenario: 'condition with objects in inputs variables',
                condition: 'products.includes("productA") && userSegments.alpha',
            },
        ])(
            'should produce the original expression using an AST node produced by parse: $scenario',
            ({ condition }) => {
                const { result } = runtime.parse(condition);
                expect(runtime.generate(result)).toStrictEqual(condition);
            }
        );
    });
});
