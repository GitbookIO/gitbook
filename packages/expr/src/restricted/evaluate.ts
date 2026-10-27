import type {
    ArrowFunctionExpression,
    CallExpression,
    Expression,
    Identifier,
    Literal,
    MemberExpression,
    Node,
    UnaryExpression,
} from 'acorn';
import evalESTreeExpr from 'eval-estree-expression';

import {
    ALLOWED_METHODS,
    CALLBACK_METHODS,
    MAX_CALLBACK_CALLS,
    UNSAFE_KEYS,
    UnsafeExpressionError,
    getCallbackParams,
} from './rules';

/**
 * Evaluate a parsed expression with the restrictions, enforcing the rules that depend on values.
 */
export function evaluateRestricted(expression: Expression, inputs: object): unknown {
    return evalESTreeExpr.evaluate.sync<Expression>(expression, inputs, {
        // The library's own function support compiles code with `Function()`: calls and
        // arrow functions are only handled by our visitors.
        functions: false,
        withMembers: true,
        visitors: RESTRICTED_VISITORS,
    });
}

/**
 * Callback calls so far, per evaluator (the library creates one per evaluation).
 */
const callbackCalls = new WeakMap<object, number>();

type Visit = (node: Node, context: object, parent?: Node) => unknown;
type Evaluator = { visit: Visit };

/**
 * Visitors overriding eval-estree-expression's defaults so that expressions can only read own
 * properties of plain data and call the methods of the standard library.
 */
const RESTRICTED_VISITORS = {
    Identifier(this: Evaluator, node: Identifier, context: object): unknown {
        return readVariable(context, node.name);
    },

    MemberExpression(this: Evaluator, node: MemberExpression, context: object): unknown {
        const object = this.visit(node.object, context, node);
        const key = node.computed
            ? this.visit(node.property, context, node)
            : (node.property as Identifier).name;

        // Reject rather than coerce, so that keys like `["constructor"]` can't slip through.
        if (typeof key !== 'string' && typeof key !== 'number') {
            throw new UnsafeExpressionError('Property keys must be strings or numbers');
        }
        return readOwnProperty(object, String(key));
    },

    CallExpression(this: Evaluator, node: CallExpression, context: object): unknown {
        const callee = node.callee;
        if (callee.type !== 'MemberExpression' || callee.computed || callee.optional) {
            throw new UnsafeExpressionError('Only method calls are supported');
        }

        const method = (callee.property as Identifier).name;
        const receiver = this.visit(callee.object, context, callee);
        const fn = getAllowedMethod(receiver, method);
        if (!fn) {
            throw new UnsafeExpressionError(`Method "${method}" is not supported`);
        }

        if (CALLBACK_METHODS.has(method)) {
            const [callback] = node.arguments;
            if (node.arguments.length !== 1 || callback?.type !== 'ArrowFunctionExpression') {
                throw new UnsafeExpressionError(`"${method}" only accepts an arrow function`);
            }
            return Reflect.apply(fn, receiver, [createCallback(this, callback, context)]);
        }

        const args = node.arguments.map((arg) => {
            if (arg.type === 'SpreadElement') {
                throw new UnsafeExpressionError('Spread arguments are not supported');
            }
            const value = this.visit(arg, context, node);
            if (!isPrimitive(value)) {
                throw new UnsafeExpressionError('Only primitive values can be arguments');
            }
            return value;
        });

        return Reflect.apply(fn, receiver, args);
    },

    ArrowFunctionExpression(): never {
        throw new UnsafeExpressionError('Arrow functions are only supported as callbacks');
    },

    FunctionExpression(): never {
        throw new UnsafeExpressionError('Functions are not supported');
    },

    ObjectExpression(): never {
        throw new UnsafeExpressionError('Object literals are not supported');
    },

    Literal(node: Literal): unknown {
        // Regexes are only useful to the library's `=~` operator, and BigInt exponentiation can hang.
        if (node.regex || typeof node.value === 'bigint') {
            throw new UnsafeExpressionError('Regex and BigInt literals are not supported');
        }
        return node.value;
    },

    UnaryExpression(this: Evaluator, node: UnaryExpression, context: object): unknown {
        // The library implements `delete` by mutating the inputs.
        if (node.operator === 'delete') {
            throw new UnsafeExpressionError('"delete" is not supported');
        }
        return Object.getPrototypeOf(this).UnaryExpression.call(this, node, context);
    },

    AssignmentExpression(): never {
        throw new UnsafeExpressionError('Assignments are not supported');
    },

    UpdateExpression(): never {
        throw new UnsafeExpressionError('Update expressions are not supported');
    },

    NewExpression(): never {
        throw new UnsafeExpressionError('"new" is not supported');
    },

    TaggedTemplateExpression(): never {
        throw new UnsafeExpressionError('Tagged templates are not supported');
    },

    ThisExpression(): never {
        throw new UnsafeExpressionError('"this" is not supported');
    },
};

/**
 * Create a callback evaluating the arrow function's body with the evaluator, instead of compiling it.
 */
function createCallback(evaluator: Evaluator, node: ArrowFunctionExpression, context: object) {
    const params = getCallbackParams(node);

    return (...args: unknown[]) => {
        const calls = (callbackCalls.get(evaluator) ?? 0) + 1;
        if (calls > MAX_CALLBACK_CALLS) {
            throw new UnsafeExpressionError('Too many callback calls');
        }
        callbackCalls.set(evaluator, calls);

        const variables = new Map(params.map((name, index) => [name, args[index]]));
        return evaluator.visit(node.body, new CallbackScope(variables, context), node);
    };
}

/**
 * Variables of a callback call, falling back to the enclosing scope.
 * A Map avoids copying the inputs on each call.
 */
class CallbackScope {
    constructor(
        readonly variables: Map<string, unknown>,
        readonly parent: object
    ) {}
}

function readVariable(scope: object, name: string): unknown {
    if (UNSAFE_KEYS.has(name)) {
        throw new UnsafeExpressionError(`"${name}" is not accessible`);
    }
    if (scope instanceof CallbackScope) {
        return scope.variables.has(name)
            ? scope.variables.get(name)
            : readVariable(scope.parent, name);
    }
    return readOwnProperty(scope, name);
}

/**
 * Read an own property, treating any attempt to reach an inherited one (e.g. `constructor`) as unsafe.
 */
function readOwnProperty(object: unknown, key: string): unknown {
    if (UNSAFE_KEYS.has(key)) {
        throw new UnsafeExpressionError(`Property "${key}" is not accessible`);
    }
    if (object === null || object === undefined) {
        return undefined;
    }
    if (typeof object === 'function') {
        throw new UnsafeExpressionError('Functions are not accessible');
    }

    // Wrapping primitives exposes string indexes and `length` as own properties.
    const target = Object(object);
    if (Object.hasOwn(target, key)) {
        return target[key];
    }
    if (key in target) {
        throw new UnsafeExpressionError(`Property "${key}" is not accessible`);
    }
    return undefined;
}

function getAllowedMethod(receiver: unknown, method: string): Function | null {
    if (typeof receiver === 'string' && ALLOWED_METHODS.string.has(method)) {
        return Reflect.get(String.prototype, method);
    }
    if (Array.isArray(receiver) && ALLOWED_METHODS.array.has(method)) {
        return Reflect.get(Array.prototype, method);
    }
    return null;
}

function isPrimitive(value: unknown): boolean {
    return value === null || (typeof value !== 'object' && typeof value !== 'function');
}
