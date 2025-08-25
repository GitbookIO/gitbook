import type { BinaryOperator, Expression, ExpressionStatement, LogicalOperator } from 'acorn';

import type { ArraySymbolDef, SymbolInfo, SymbolType } from './symbols';

export interface ExpressionGenerator {
    /**
     * Converts an ESTree compatible AST node into a string representing the corresponding expression.
     */
    generate(node: Expression): string;
}

export interface ExpressionParserResult {
    /**
     * The expression statement from the valid portion of the parsed expression.
     *
     * It is undefined when no valid expression statements could be found.
     */
    result: Expression;

    /**
     * The information of the invalid (non-expression) nodes found from the other portions of the parsed expression.
     */
    invalidNodes: Array<ExpressionStatement>;
}

export interface ExpressionAutocompleteResults {
    suggestions: AutocompleteSuggestions;
}

type ConditionalOperator = '?';

export const SUPPORTED_BINARY_OPERATORS = [
    {
        operator: '==',
        description: 'Checks whether two values are equal.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality',
    },
    {
        operator: '!=',
        description: 'Checks whether two values are unequal.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Inequality',
    },
    {
        operator: '===',
        description: 'Checks whether two values are equal (strict comparison).',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality',
    },
    {
        operator: '!==',
        description: 'Checks whether two values are unequal (strict comparison).',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_inequality',
    },
    {
        operator: '<',
        description: 'Checks if the left value is less than the right value.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than',
    },
    {
        operator: '<=',
        description: 'Checks if the left value is less than or equal to the right value.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than_or_equal',
    },
    {
        operator: '>',
        description: 'Checks if the left value is greater than the right value.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Greater_than',
    },
    {
        operator: '>=',
        description: 'Checks if the left value is greater than or equal to the right value.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Greater_than_or_equal',
    },
    {
        operator: 'in',
        description: 'Checks if a property exists in an object or if a value is in an array.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/in',
    },
] as const;

export const SUPPORTED_LOGICAL_OPERATORS = [
    {
        operator: '&&',
        description: 'Logical AND operator; returns true if both operands are true.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND',
    },
    {
        operator: '||',
        description: 'Logical OR operator; returns true if at least one operand is true.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR',
    },
] as const;

export const SUPPORTED_CONDITIONAL_OPERATORS = [
    {
        operator: '?',
        description:
            'Conditional (ternary) operator; returns one of two values based on a condition.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator',
    },
] as const;

type DirectLiteralValue = {
    kind: 'direct';
} & (
    | {
          type: SymbolType.Boolean;
          data: boolean;
      }
    | {
          type: SymbolType.Number;
          data: number;
      }
    | {
          type: SymbolType.String;
          data: string;
      }
    | {
          type: SymbolType.Null;
          data: null;
      }
);

type InArrayLiteralValue = {
    kind: 'in-array';
    srcSymbol: ArraySymbolDef;
    matchedLiteralString: string;
};

export type DirectLiteralValueSuggestion = {
    type: 'literal-value';
    value: DirectLiteralValue;
};

export type InArrayLiteralValueSuggestion = {
    type: 'literal-value';
    value: InArrayLiteralValue;
};

export type AutocompleteLiteralValueSuggestion =
    | DirectLiteralValueSuggestion
    | InArrayLiteralValueSuggestion;

export interface AutocompleteOperatorSuggestion {
    type: 'operator';
    operator:
        | Extract<BinaryOperator, (typeof SUPPORTED_BINARY_OPERATORS)[number]['operator']>
        | Extract<LogicalOperator, (typeof SUPPORTED_LOGICAL_OPERATORS)[number]['operator']>
        | Extract<
              ConditionalOperator,
              (typeof SUPPORTED_CONDITIONAL_OPERATORS)[number]['operator']
          >;
    description: string;
    link: string;
}

export interface AutocompleteSymbolSuggestion {
    type: 'symbol';
    symbol: SymbolInfo;
}

export type AutocompleteSuggestions = Array<
    | AutocompleteSymbolSuggestion
    | AutocompleteLiteralValueSuggestion
    | AutocompleteOperatorSuggestion
>;

type LoggerFn = (message: string, ...args: any[]) => void;

/**
 * A logger that can be passed to the runtime.
 */
export interface Logger {
    debug: LoggerFn;
    info: LoggerFn;
    error: LoggerFn;
}
