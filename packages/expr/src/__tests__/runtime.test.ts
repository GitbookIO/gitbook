import { describe, expect, it } from 'bun:test';

import { ExpressionError } from '../errors';
import { ExpressionRuntime } from '../runtime';
import type { Logger } from '../types';

const SILENT_LOGGER: Logger = {
    debug: () => {},
    info: () => {},
    error: () => {},
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
                scenario: 'array map',
                condition: '[1, 2, 3].map(n => n * x)',
                inputs: { x: 2 },
                expectedResult: [2, 4, 6],
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
            {
                scenario: 'unsafe expression',
                condition: '[1, 2, 3].map(() => { while (1) {}})',
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
