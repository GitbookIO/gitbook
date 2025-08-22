import type {
    Node as AcornNode,
    AnyNode,
    BinaryExpression,
    Expression,
    Identifier,
    Literal,
    MemberExpression,
    PrivateIdentifier,
    Super,
} from 'acorn';
import { isDummy } from 'acorn-loose';
import * as walk from 'acorn-walk';

import assertNever from 'assert-never';

import { type ExtractSymbolDef, SymbolType, SymbolsTable } from './symbols';
import {
    type AutocompleteLiteralValueSuggestion,
    type AutocompleteOperatorSuggestion,
    type AutocompleteSuggestions,
    type AutocompleteSymbolSuggestion,
    type DirectLiteralValueSuggestion,
    type ExpressionParserResult,
    type Logger,
    SUPPORTED_BINARY_OPERATORS,
    SUPPORTED_CONDITIONAL_OPERATORS,
    SUPPORTED_LOGICAL_OPERATORS,
} from './types';

interface ExpressionParser {
    parse(expr: string, options: { loose?: boolean }): ExpressionParserResult;
}

export class AutoComplete {
    #parser: ExpressionParser;
    #logger: Logger;

    constructor(parser: ExpressionParser, logger: Logger = console) {
        this.#parser = parser;
        this.#logger = logger;
    }

    /**
     * Generates autocomplete suggestions based on the input expression and cursor offset position.
     */
    public getSuggestions(
        expr: string,
        cursorOffset: number,
        context: SymbolsTable
    ): AutocompleteSuggestions {
        if (!expr.length) {
            return [];
        }

        try {
            const { result, invalidNodes } = this.#parser.parse(expr, { loose: true });

            // Locate the node at the cursor position.
            const nodeAtCursorFound = walk.findNodeAround(result, cursorOffset, (_type, node) =>
                isNodeAtCursor(node, cursorOffset)
            );

            if (!nodeAtCursorFound) {
                // When we can't find one we might be in the boundary of the program/expression.
                // We could possibly be in a whitespace at the end of the expression or in a situation where the parsed
                // tree may contain 2 top level ExpressionStatement (second one returned as invalid node by the parser).
                //
                // In this case we want to provide operators as suggestions and refine the search of the "cursor" node to either:
                //   - using the end position of the whole expression AST (e.g white space at the very end of the expression string)
                //   - or using the second top level ExpressionStatement node found by the parser as the cursor is at the end of that node.
                if (cursorOffset > result.end) {
                    const ast = invalidNodes.length > 0 ? invalidNodes[0]?.expression : result;

                    if (!ast) {
                        return [];
                    }

                    const lastNodeFound = walk.findNodeAround(ast, ast.end, (_type, node) =>
                        isNodeAtCursor(node, ast.end)
                    );
                    if (!lastNodeFound) {
                        return [];
                    }
                    const { node } = lastNodeFound;

                    if (!isAnyNode(node)) {
                        throw Error(`Unexpected node type ${node.type}`);
                    }

                    return this.getOperatorSuggestionsForNode(ast, node, result.end, context);
                }
                return [];
            }

            const { node } = nodeAtCursorFound;

            if (!isAnyNode(node)) {
                throw Error(`Unexpected node type ${node.type}`);
            }

            return this.getSuggestionsForNode(result, node, expr, cursorOffset, context);
        } catch (error) {
            this.#logger.error('Error while computing autocomplete suggestions', error);
            return [];
        }
    }

    /**
     * Provides autocomplete suggestions for a specific node in the AST.
     */
    private getSuggestionsForNode(
        ast: Expression,
        node: AnyNode,
        expr: string,
        cursorOffset: number,
        context: SymbolsTable
    ): AutocompleteSuggestions {
        // When the node is an identifier look up the parent to get more context for the suggestions.
        let inferNode: AnyNode = node;
        if (node.type === 'Identifier' || node.type === 'Literal') {
            const parent = findParentNode(node, ast);
            inferNode =
                parent &&
                !['ExpressionStatement', 'LogicalExpression', 'ConditionalExpression'].includes(
                    parent.type
                )
                    ? parent
                    : node;
        }

        switch (inferNode.type) {
            case 'Identifier':
            case 'MemberExpression': {
                const pathParts = this.getSymbolsPathPartsForMemberExpressionNode(
                    inferNode,
                    cursorOffset
                );

                // Fetch suggestions from the symbol table
                const candidatesKeys = context.getMatchingSymbolsKeys(pathParts);

                const suggestions: AutocompleteSymbolSuggestion[] = [];
                for (const candidate of candidatesKeys) {
                    const symbolInfo = context.getSymbolInfo(candidate);
                    if (symbolInfo) {
                        suggestions.push({ type: 'symbol', symbol: symbolInfo });
                    }
                }

                if (suggestions.length === 1) {
                    const lastPathSegment = pathParts.at(-1)?.replace(/\*$/, '');

                    // Return no suggestion when the only match is an exact match of the
                    // typed token.
                    return lastPathSegment !== suggestions[0]?.symbol.definition.name
                        ? suggestions
                        : [];
                }

                return suggestions;
            }
            case 'AssignmentExpression':
            case 'UnaryExpression': {
                // Provide suggestions for binary or logical operators based on the parsed operator
                // of the partial expression (e.g suggest "==" when typing "=" (parsed as AssignmentExpression)).
                return this.getOperatorSuggestionsForNode(ast, inferNode, cursorOffset, context);
            }
            case 'BinaryExpression': {
                const { left, right } = inferNode;

                const isOperatorBinaryOp = SUPPORTED_BINARY_OPERATORS.some(
                    (op) => op.operator === inferNode.operator
                );

                const operatorIndex = expr.indexOf(inferNode.operator, left.end);
                const operatorOffset = operatorIndex + inferNode.operator.length;
                const isCursorAfterOperator = cursorOffset > operatorOffset;

                const shouldSuggestValues =
                    isCursorAfterOperator &&
                    isOperatorBinaryOp &&
                    isNodeAtCursor(right, cursorOffset);

                if (shouldSuggestValues) {
                    return this.getLiteralValueSuggestionsForNode(inferNode, cursorOffset, context);
                }

                // Provide suggestions for binary operators based on the parsed operator
                return this.getOperatorSuggestionsForNode(ast, inferNode, cursorOffset, context);
            }
            case 'ConditionalExpression': {
                const { consequent, alternate } = inferNode;

                if (isNodeAtCursor(consequent, cursorOffset)) {
                    return this.getSuggestionsForNode(ast, consequent, expr, cursorOffset, context);
                }

                if (isNodeAtCursor(alternate, cursorOffset)) {
                    return this.getSuggestionsForNode(ast, alternate, expr, cursorOffset, context);
                }
            }
        }

        return [];
    }

    /**
     * Return a path corresponding to the MemberExpression node that can be used to lookup matching symbols in the symbol table.
     */
    private getSymbolsPathPartsForMemberExpressionNode(
        node: MemberExpression | Identifier,
        cursorOffset: number,
        options?: { withWildcardMatches: boolean }
    ): string[] {
        const withWildcardMatches = options?.withWildcardMatches ?? true;
        const pathParts: string[] = [];

        switch (node.type) {
            case 'MemberExpression':
                {
                    const memberProperty = node.property;

                    // Only support identifier or literal expressions as member properties.
                    if (!isSupportedMemberProperty(memberProperty)) {
                        return [];
                    }

                    // Push the path part corresponding to the member property (e.g b in a.b or a['b'])
                    const propertyPathPart = this.getSymbolsPathPartFromMemberProperty(
                        memberProperty,
                        cursorOffset
                    );

                    if (propertyPathPart) {
                        pathParts.push(
                            withWildcardMatches ? `${propertyPathPart}*` : propertyPathPart
                        );
                    }

                    // Go through the parent(s) in the chain and add their path parts as well
                    let parent: Expression | Super | undefined = node.object;
                    while (parent) {
                        const parentProperty = 'property' in parent ? parent.property : parent;

                        // Only support identifier or literal expressions as parent property.
                        const parentPropertyPathPart = isSupportedMemberProperty(parentProperty)
                            ? this.getSymbolsPathPartFromMemberProperty(
                                  parentProperty,
                                  cursorOffset
                              )
                            : undefined;

                        if (parentPropertyPathPart) {
                            pathParts.unshift(parentPropertyPathPart);
                        }

                        parent = 'object' in parent ? parent.object : undefined;
                    }
                }
                break;
            case 'Identifier': {
                const propertyPathPart = this.getSymbolsPathPartFromMemberProperty(
                    node,
                    cursorOffset
                );
                if (propertyPathPart) {
                    pathParts.push(withWildcardMatches ? `${propertyPathPart}*` : propertyPathPart);
                }
                break;
            }
            default:
                assertNever(node);
        }

        return pathParts;
    }

    /**
     * Return a part of a symbol path corresponding to a MemberExpression node property.
     */
    private getSymbolsPathPartFromMemberProperty(
        node: Identifier | Literal,
        cursorOffset: number
    ): string {
        switch (node.type) {
            case 'Identifier': {
                if (isDummy(node)) {
                    return '*';
                }

                return isNodeAtCursor(node, cursorOffset)
                    ? node.name.slice(0, cursorOffset)
                    : node.name;
            }
            case 'Literal': {
                if (isDummy(node) || !node.value) {
                    return '*';
                }
                const value = String(node.value);
                return isNodeAtCursor(node, cursorOffset) ? value.slice(0, cursorOffset) : value;
            }
            default:
                assertNever(node);
        }
    }

    /**
     * Provides autocomplete literal value suggestions for a specific node in the AST.
     */
    private getLiteralValueSuggestionsForNode(
        node: BinaryExpression,
        cursorOffset: number,
        context: SymbolsTable
    ): Array<AutocompleteLiteralValueSuggestion> {
        const { left, right } = node;

        if (left.type !== 'MemberExpression' && left.type !== 'Identifier') {
            return [];
        }

        if (right.type !== 'Identifier' && right.type !== 'Literal') {
            return [];
        }

        const leftSymbolPath = this.getSymbolsPathPartsForMemberExpressionNode(left, cursorOffset, {
            withWildcardMatches: false,
        });

        const isLeftComputedMember = left.type === 'MemberExpression' && left.computed;
        const leftSymbolInfo = context.getSymbolInfo(
            isLeftComputedMember ? leftSymbolPath.slice(0, -1) : leftSymbolPath
        );

        if (!leftSymbolInfo) {
            return [];
        }

        switch (leftSymbolInfo.definition.type) {
            case SymbolType.Boolean: {
                const suggestions: DirectLiteralValueSuggestion[] = [
                    {
                        type: 'literal-value',
                        value: { kind: 'direct', type: SymbolType.Boolean, data: true },
                    },
                    {
                        type: 'literal-value',
                        value: { kind: 'direct', type: SymbolType.Boolean, data: false },
                    },
                ];

                return isDummy(right)
                    ? suggestions
                    : suggestions.filter((literalValue) => {
                          const literalValueString = String(literalValue.value.data);
                          const rightNodeValue =
                              right.type === 'Identifier' ? right.name : (right.raw ?? '');
                          return (
                              literalValueString !== rightNodeValue &&
                              literalValueString.startsWith(rightNodeValue)
                          );
                      });
            }
            case SymbolType.String: {
                if (!leftSymbolInfo.definition.enum) {
                    return [];
                }

                const rightNodeValue = (() => {
                    if (right.type === 'Identifier') {
                        return right.name;
                    }

                    const nodeValue = right.raw ?? '';
                    if (/^(['"])(.*)\1$/.test(nodeValue)) {
                        return null;
                    }

                    return nodeValue.replaceAll(/["']/g, '');
                })();

                if (rightNodeValue === null) {
                    return [];
                }

                const suggestions = isDummy(right)
                    ? leftSymbolInfo.definition.enum
                    : leftSymbolInfo.definition.enum.filter((enumValue) =>
                          enumValue.startsWith(rightNodeValue)
                      );

                return suggestions.map((value) => ({
                    type: 'literal-value',
                    value: {
                        kind: 'direct',
                        type: SymbolType.String,
                        data: value,
                    },
                }));
            }
            case SymbolType.Array: {
                // Only return a literal in array value suggestion when the left hand side of the binary expression
                // is computed, e.g myArray[1]
                return isLeftComputedMember
                    ? [
                          {
                              type: 'literal-value',
                              value: {
                                  kind: 'in-array',
                                  srcSymbol: leftSymbolInfo.definition,
                                  matchedLiteralString: !isDummy(right)
                                      ? right.type === 'Identifier'
                                          ? right.name
                                          : (right.raw ?? '')
                                      : '',
                              },
                          },
                      ]
                    : [];
            }
            default:
                return [];
        }
    }

    /**
     * Provides autocomplete operator suggestions for a specific node in the AST.
     */
    private getOperatorSuggestionsForNode(
        ast: Expression,
        node: AnyNode,
        cursorOffset: number,
        context: SymbolsTable
    ): Array<AutocompleteOperatorSuggestion> {
        if (node.type === 'Literal') {
            const parent = findParentNode(node, ast);

            if (parent?.type === 'BinaryExpression') {
                return [...SUPPORTED_LOGICAL_OPERATORS, ...SUPPORTED_CONDITIONAL_OPERATORS].map(
                    (op) => ({
                        type: 'operator',
                        ...op,
                    })
                );
            }

            const literalSymbol = SymbolsTable.inferSymbolFromValue(node.raw);
            return this.getOperatorSuggestionsForSymbol(literalSymbol);
        }

        // When the node is an identifier look the parent to get more context for the suggestions
        let inferNode: AnyNode = node;
        if (node.type === 'Identifier') {
            const parent = findParentNode(node, ast);
            inferNode = parent && parent.type !== 'ExpressionStatement' ? parent : node;
        }

        switch (inferNode.type) {
            case 'MemberExpression': {
                const pathParts = this.getSymbolsPathPartsForMemberExpressionNode(
                    inferNode,
                    cursorOffset,
                    {
                        withWildcardMatches: false,
                    }
                );
                const symbolInfo = context.getSymbolInfo(pathParts);
                return symbolInfo
                    ? this.getOperatorSuggestionsForSymbol(symbolInfo.definition)
                    : [];
            }
            case 'AssignmentExpression':
            case 'BinaryExpression':
            case 'UnaryExpression': {
                // Starting to write a binary/logical operator so suggest operator matching the already
                // typed character as operator.
                const operator = inferNode.operator;
                return (
                    [...SUPPORTED_BINARY_OPERATORS, ...SUPPORTED_LOGICAL_OPERATORS]
                        .filter((op) => op.operator.startsWith(operator))
                        // No need to include the operator that match exactly
                        .filter((op) => op.operator !== operator)
                        .map((op) => ({
                            type: 'operator',
                            ...op,
                        }))
                );
            }
            default:
                return [];
        }
    }

    /**
     * Provides autocomplete operator suggestions based on the type of a symbol.
     */
    private getOperatorSuggestionsForSymbol(
        symbol: ExtractSymbolDef<SymbolType>
    ): Array<AutocompleteOperatorSuggestion> {
        switch (symbol.type) {
            case SymbolType.Number:
            case SymbolType.Boolean:
            case SymbolType.Null:
            case SymbolType.Undefined:
            case SymbolType.Object:
            case SymbolType.Array: {
                const equalityOps = SUPPORTED_BINARY_OPERATORS.slice(0, 4);
                const finalSuggestions =
                    symbol.type === SymbolType.Boolean
                        ? [
                              ...equalityOps,
                              ...SUPPORTED_LOGICAL_OPERATORS,
                              ...SUPPORTED_CONDITIONAL_OPERATORS,
                          ]
                        : equalityOps;
                return finalSuggestions.map((op) => ({
                    type: 'operator',
                    ...op,
                }));
            }
            case SymbolType.String:
                return SUPPORTED_BINARY_OPERATORS.map((op) => ({
                    type: 'operator',
                    ...op,
                }));
            case SymbolType.Function:
                return this.getOperatorSuggestionsForSymbol(symbol.returns);
            case SymbolType.Union: {
                return symbol.members.reduce<Array<AutocompleteOperatorSuggestion>>((prev, cur) => {
                    prev.push(...this.getOperatorSuggestionsForSymbol(cur));
                    return prev;
                }, []);
            }
            default:
                assertNever(symbol);
        }
    }
}

/**
 * Finds the parent of child node in the provided AST.
 */
function findParentNode(child: AnyNode, ast: Expression): AnyNode | undefined {
    let foundParent: AnyNode | undefined;

    walk.ancestor(ast, {
        [child.type]: (node: AcornNode, _state: undefined, ancestors: AnyNode[]) => {
            if (node.start === child.start && node.end === child.end) {
                // The parent is the second last ancestor in the stack (last one is the actual node)
                foundParent = ancestors[ancestors.length - 2];
            }
        },
    });

    return foundParent;
}

function isSupportedMemberProperty(node: Expression | PrivateIdentifier | Super) {
    return node.type === 'Identifier' || node.type === 'Literal';
}

function isNodeAtCursor(node: AcornNode, cursorOffset: number) {
    return cursorOffset >= node.start && cursorOffset <= node.end;
}

function isAnyNode(node: AcornNode): node is AnyNode {
    return 'type' in node;
}
