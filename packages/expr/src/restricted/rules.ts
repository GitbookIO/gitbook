import type { AnyNode, ArrowFunctionExpression } from 'acorn';

import { ExpressionError } from '../errors';

/**
 * Methods that expressions are allowed to call, per receiver type.
 * Must include the standard library offered in the editor (see `symbols.ts`). Only add methods
 * after review: they must not mutate their receiver, and their output must stay bounded by their input.
 */
export const ALLOWED_METHODS = {
    string: new Set([
        'at',
        'endsWith',
        'includes',
        'startsWith',
        'toLowerCase',
        'toUpperCase',
        'trim',
    ]),
    array: new Set(['at', 'every', 'filter', 'includes', 'map', 'some']),
};

/**
 * Array methods taking a callback, the only place where arrow functions are allowed.
 */
export const CALLBACK_METHODS = new Set(['every', 'filter', 'map', 'some']);

/**
 * Maximum number of callback calls in a single evaluation, as nested callbacks multiply and
 * visitors control the size of unsigned claims. Enough for a pass over an identity provider's
 * group claim (capped around 200 entries), or a small nested pair of arrays.
 */
export const MAX_CALLBACK_CALLS = 250;

/**
 * Names never readable as variables or properties, even as own properties of the inputs.
 * Replaces (and extends) the library's own denylist, as our visitors override the ones applying it.
 */
export const UNSAFE_KEYS = new Set([
    '__defineGetter__',
    '__defineSetter__',
    '__lookupGetter__',
    '__lookupSetter__',
    '__proto__',
    'constructor',
    'prototype',
]);

/**
 * Thrown when an expression uses something the restrictions don't allow.
 */
export class UnsafeExpressionError extends ExpressionError {}

/**
 * Create an error pointing at the node, so that editors can highlight it.
 */
export function unsupported(node: AnyNode, message: string): UnsafeExpressionError {
    return new UnsafeExpressionError(message, node.loc?.start);
}

/**
 * Parameter names of an arrow function, if it has the shape allowed for callbacks.
 */
export function getCallbackParams(node: ArrowFunctionExpression): string[] {
    if (node.async) {
        throw unsupported(node, 'Async functions are not supported');
    }
    if (!node.expression) {
        throw unsupported(node, 'Only single-expression arrow functions are supported');
    }

    return node.params.map((param) => {
        if (param.type !== 'Identifier' || UNSAFE_KEYS.has(param.name)) {
            throw unsupported(param, 'Only simple arrow function parameters are supported');
        }
        return param.name;
    });
}
