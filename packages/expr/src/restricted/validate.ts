import type { AnyNode, CallExpression, Identifier } from 'acorn';

import {
    ALLOWED_METHODS,
    CALLBACK_METHODS,
    UNSAFE_KEYS,
    getCallbackParams,
    unsupported,
} from './rules';

/**
 * Check an expression against the restrictions without evaluating it, so that editors can report
 * violations. Rules depending on values (receiver types, inherited properties, limits) are only
 * enforced by `evaluateRestricted`.
 */
export function validateExpression(node: AnyNode): void {
    switch (node.type) {
        case 'Literal':
            if (node.regex || typeof node.value === 'bigint') {
                throw unsupported(
                    node,
                    'Regular expressions and BigInt literals are not supported'
                );
            }
            return;
        case 'Identifier':
            return assertSafeKey(node.name, node);
        case 'TemplateLiteral':
            return node.expressions.forEach(validateExpression);
        case 'ArrayExpression':
            for (const element of node.elements) {
                if (element) {
                    validateExpression(
                        element.type === 'SpreadElement' ? element.argument : element
                    );
                }
            }
            return;
        case 'UnaryExpression':
            if (node.operator === 'delete') {
                throw unsupported(node, '"delete" is not supported');
            }
            return validateExpression(node.argument);
        case 'BinaryExpression':
        case 'LogicalExpression':
            validateExpression(node.left);
            return validateExpression(node.right);
        case 'ConditionalExpression':
            validateExpression(node.test);
            validateExpression(node.consequent);
            return validateExpression(node.alternate);
        case 'SequenceExpression':
            return node.expressions.forEach(validateExpression);
        case 'MemberExpression':
            validateExpression(node.object);
            if (!node.computed) {
                return assertSafeKey((node.property as Identifier).name, node.property);
            }
            if (node.property.type === 'Literal') {
                return assertSafeKey(String(node.property.value), node.property);
            }
            if (node.property.type === 'ArrayExpression') {
                throw unsupported(node.property, 'Property keys must be strings or numbers');
            }
            return validateExpression(node.property);
        case 'CallExpression':
            return validateCall(node);
        case 'ArrowFunctionExpression':
            throw unsupported(node, 'Arrow functions are only supported as callbacks');
        case 'ObjectExpression':
            throw unsupported(node, 'Object literals are not supported');
        case 'AssignmentExpression':
            // `a =~ /regex/` parses as an assignment of `~/regex/`.
            throw unsupported(
                node,
                node.right.type === 'UnaryExpression' && node.right.operator === '~'
                    ? 'The "=~" regex operator is not supported'
                    : 'Assignments are not supported'
            );
        default:
            throw unsupported(
                node,
                UNSUPPORTED_SYNTAX[node.type] ?? `${node.type} is not supported`
            );
    }
}

/**
 * Errors shown to authors for rejected syntax.
 */
const UNSUPPORTED_SYNTAX: Partial<Record<AnyNode['type'], string>> = {
    AwaitExpression: '"await" is not supported',
    ChainExpression: 'Optional chaining ("?.") is not supported',
    ClassExpression: 'Classes are not supported',
    FunctionExpression: 'Functions are not supported',
    ImportExpression: '"import" is not supported',
    NewExpression: '"new" is not supported',
    TaggedTemplateExpression: 'Tagged templates are not supported',
    ThisExpression: '"this" is not supported',
    UpdateExpression: '"++" and "--" are not supported',
    YieldExpression: '"yield" is not supported',
};

function validateCall(node: CallExpression): void {
    const callee = node.callee;
    if (callee.type !== 'MemberExpression' || callee.computed || node.optional) {
        throw unsupported(node, 'Only method calls are supported');
    }
    validateExpression(callee.object);

    const method = (callee.property as Identifier).name;
    if (!ALLOWED_METHODS.string.has(method) && !ALLOWED_METHODS.array.has(method)) {
        throw unsupported(callee.property, `Method "${method}" is not supported`);
    }

    if (CALLBACK_METHODS.has(method)) {
        const [callback] = node.arguments;
        if (node.arguments.length !== 1 || callback?.type !== 'ArrowFunctionExpression') {
            throw unsupported(node, `"${method}" only accepts an arrow function`);
        }
        getCallbackParams(callback);
        return validateExpression(callback.body);
    }

    for (const arg of node.arguments) {
        if (arg.type === 'SpreadElement') {
            throw unsupported(arg, 'Spread arguments are not supported');
        }
        validateExpression(arg);
    }
}

function assertSafeKey(key: string, node: AnyNode): void {
    if (UNSAFE_KEYS.has(key)) {
        throw unsupported(node, `"${key}" is not accessible`);
    }
}
