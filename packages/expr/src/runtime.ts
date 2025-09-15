import {
    type Options as AcornOptions,
    type Expression,
    type ExpressionStatement,
    type Position,
    type Program,
    type Token,
    parse,
    tokenizer,
} from 'acorn';
import { parse as parseLoose } from 'acorn-loose';
import escodegen from 'escodegen';
import evalESTreeExpr from 'eval-estree-expression';
const { evaluate } = evalESTreeExpr;

import { AutoComplete } from './autocomplete';
import { ExpressionError } from './errors';
import type { SymbolsTable } from './symbols';
import type { TemplatePart } from './template';
import { parseTemplate as parseTemplateParts } from './template';
import type { ExpressionAutocompleteResults, ExpressionParserResult, Logger } from './types';
import { formatExpressionResult } from './utils';

export class ExpressionRuntime {
    #parserOptions: AcornOptions;
    #autocompleter: AutoComplete;
    #logger: Logger;

    constructor(logger: Logger = console) {
        this.#parserOptions = {
            ecmaVersion: 'latest',
            sourceType: 'script',
            allowHashBang: false,
            locations: true,
        };
        this.#autocompleter = new AutoComplete(this, logger);
        this.#logger = logger;
    }

    /**
     * Evaluates an expression based on the given inputs/context.
     */
    public evaluate(expr: string, inputs: object): unknown {
        try {
            const parsed = this.parse(expr);

            if (parsed.invalidNodes.length > 0) {
                throw new ExpressionError('Invalid nodes found when parsing');
            }

            return evaluate.sync<Expression>(parsed.result, inputs, {
                functions: true,
                withMembers: true,
                generate: escodegen.generate,
            });
        } catch (error) {
            throw error instanceof Error
                ? new ExpressionError(error.message)
                : new ExpressionError('Unexpected error');
        }
    }

    /**
     * Evaluates an expression safely by returning the error instead of throwing when invalid.
     */
    public safeEvaluate(
        expr: string,
        inputs: object
    ): { value: unknown; error?: undefined } | { value?: undefined; error: ExpressionError } {
        try {
            const value = this.evaluate(expr, inputs);
            return {
                value,
            };
        } catch (error) {
            this.#logger.error(`Error while evaluating expression ${expr}`, error);

            if (error instanceof ExpressionError) {
                return {
                    value: undefined,
                    error,
                };
            }

            return {
                value: undefined,
                error:
                    error instanceof Error
                        ? new ExpressionError(error.message)
                        : new ExpressionError('Unexpected error'),
            };
        }
    }

    /**
     * Evaluates a condition safely to a boolean.
     */
    public evaluateBoolean(expr: string, inputs: object): boolean {
        if (expr.trim().length === 0) {
            return true;
        }

        const evalResult = this.safeEvaluate(expr, inputs);

        if (typeof evalResult.error !== 'undefined') {
            return false;
        }

        return Boolean(evalResult.value);
    }

    /**
     * Evaluates an array of conditions as a single logical expression.
     * The function treats the conditions as if they were joined by an AND operator,
     * meaning the evaluation returns `true` only if all conditions are truthy.
     */
    public evaluateBooleanAll(expressions: string[], inputs: object): boolean {
        if (expressions.length === 0) {
            return true;
        }

        return expressions.every((expression) => this.evaluateBoolean(expression, inputs));
    }

    /**
     * Parse a template and validate all embedded expressions.
     */
    public parseTemplate(template: string): { parts: TemplatePart[]; errors: ExpressionError[] } {
        const parts = parseTemplateParts(template);
        const errors: ExpressionError[] = [];

        for (const part of parts) {
            if (part.type === 'expression') {
                try {
                    const { invalidNodes } = this.parse(part.value);
                    if (invalidNodes.length > 0) {
                        errors.push(new ExpressionError('Invalid expression'));
                    }
                } catch (error) {
                    errors.push(error as ExpressionError);
                }
            }
        }

        return { parts, errors };
    }

    /**
     * Evaluate a template string containing `{{ expression }}` placeholders.
     */
    public evaluateTemplate(template: string, inputs: object): string {
        const { parts } = this.parseTemplate(template);

        return parts
            .map((part) => {
                if (part.type === 'text') {
                    return part.value;
                }
                const result = this.evaluate(part.value, inputs);
                return formatExpressionResult(result, '');
            })
            .join('');
    }

    /**
     * Parses a binary expression and returns an @ExpressionParserResult.
     */
    public parse(
        expr: string,
        options: { loose?: boolean } = {
            loose: false,
        }
    ): ExpressionParserResult {
        try {
            const ast = options.loose
                ? parseLoose(expr, { ...this.#parserOptions })
                : parse(expr, { ...this.#parserOptions });

            if (!ast.body || ast.body.length === 0) {
                throw new ExpressionError('Empty or invalid expression');
            }

            // Extract the first expression statement that we find
            const firstExprIndex = ast.body.findIndex((node) => isParsedExpressionStatement(node));
            const [statement] = ast.body.splice(firstExprIndex, 1);

            if (!statement || !isParsedExpressionStatement(statement)) {
                throw new ExpressionError('Empty or invalid expression');
            }

            // Return information on the other nodes as invalid nodes
            const invalidNodes = ast.body.filter(filterOutModuleDeclarationStatement);

            return {
                result: statement.expression,
                invalidNodes,
            };
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw createExpressionErrorFromSyntaxError(expr, error);
            }
            if (error instanceof ExpressionError) {
                throw error;
            }
            throw new ExpressionError('Unexpected error');
        }
    }

    /**
     * Provides autocomplete suggestions for the given expression at the provided cursor offset.
     */
    public autocomplete(
        expr: string,
        cursorOffset: number,
        context: SymbolsTable
    ): ExpressionAutocompleteResults {
        const suggestions = this.#autocompleter.getSuggestions(expr, cursorOffset, context);

        return { suggestions };
    }

    public generate(_node: Expression): string {
        throw new Error('Not yet implemented');
    }
}

function createExpressionErrorFromSyntaxError(
    code: string,
    error: SyntaxError & { loc?: Position }
): ExpressionError {
    const loc = error.loc;

    if (!loc) {
        return new ExpressionError(error.message);
    }

    const errorMessage = `${error.message.replace(/\s*\(\d+:\d+\)$/, '')} at ${code.split('\n').length > 1 ? `line ${loc.line}, ` : ''}char ${loc.column}`;
    const token = getTokenAtLoc(code, loc);

    if (!token) {
        return new ExpressionError(errorMessage, loc);
    }

    return new ExpressionError(errorMessage, loc, token);
}
function getTokenAtLoc(code: string, errorLoc: Position): Token | undefined {
    const tokens = tokenizer(code, {
        ecmaVersion: 'latest',
        locations: true,
    });

    try {
        for (const token of tokens) {
            if (!token.loc) {
                continue;
            }

            const { start, end } = token.loc;

            const onSameLine = errorLoc.line === start.line;
            const inColumnRange = errorLoc.column >= start.column && errorLoc.column < end.column;

            if (onSameLine && inColumnRange) {
                return token;
            }
        }
    } catch (_error) {
        return undefined;
    }

    return undefined;
}

function isParsedExpressionStatement(
    statement: Program['body'][number]
): statement is ExpressionStatement {
    return statement.type === 'ExpressionStatement';
}

export function filterOutModuleDeclarationStatement(
    statement: Program['body'][number]
): statement is ExpressionStatement {
    return ![
        'ImportDeclaration',
        'ExportNamedDeclaration',
        'ExportDefaultDeclaration',
        'ExportAllDeclaration',
    ].includes(statement.type);
}
