import type { MandateProps } from '../utils';

export enum SymbolType {
    Boolean = 'boolean',
    Number = 'number',
    String = 'string',
    Object = 'object',
    Array = 'array',
    Function = 'function',
    Union = 'union',
    Undefined = 'undefined',
    Null = 'null',
}

export interface SymbolMetadata {
    /**
     * Long description of the symbol.
     */
    description?: string;

    /**
     * Link to a documentation/manual page.
     */
    link?: string;
}

export interface GenericSymbolDef extends SymbolMetadata {
    /**
     * Type of the symbol.
     */
    type: SymbolType;

    /**
     * Name of the symbol.
     */
    name?: string;
}

export interface SymbolWithProperties extends GenericSymbolDef {
    /**
     * Properties on the symbol type.
     */
    properties: Record<string, GenericSymbolDef>;
}

export interface SymbolWithMethods extends GenericSymbolDef {
    /**
     * Methods that can be called on the symbol type.
     */
    methods: FunctionSymbolDef[];
}

export interface BooleanSymbolDef extends GenericSymbolDef {
    type: SymbolType.Boolean;
}

export interface NumberSymbolDef extends GenericSymbolDef {
    type: SymbolType.Number;
}

export interface StringSymbolDef extends SymbolWithProperties, SymbolWithMethods {
    type: SymbolType.String;

    /**
     * Set of enumerated values that the string symbol is retristred to.
     */
    enum?: string[];

    /**
     * Properties on strings.
     */
    properties: {
        length: NumberSymbolDef;
    };
}

export interface ObjectSymbolDef extends SymbolWithProperties, SymbolWithMethods {
    type: SymbolType.Object;
}

export interface ArraySymbolDef extends SymbolWithProperties, SymbolWithMethods {
    type: SymbolType.Array;

    /**
     * Symbol representing the type of the items of the array
     */
    items: ExtractSymbolDef<SymbolType>;

    /**
     * Properties on arrays.
     */
    properties: {
        length: NumberSymbolDef;
    };
}

export interface FunctionSymbolDef extends MandateProps<GenericSymbolDef, 'name'> {
    type: SymbolType.Function;

    /**
     * Symbols describing the arguments of the function.
     */
    args: (ExtractSymbolDef<SymbolType> & { optional?: boolean })[];

    /**
     * Symbol describing the returned value of the function.
     */
    returns: ExtractSymbolDef<SymbolType>;
}

export interface UnionSymbolDef extends GenericSymbolDef {
    type: SymbolType.Union;

    /**
     * Symbols composing the union.
     */
    members: ExtractSymbolDef<SymbolType>[];
}

export interface UndefinedSymbolDef extends GenericSymbolDef {
    type: SymbolType.Undefined;
}

export interface NullSymbolDef extends GenericSymbolDef {
    type: SymbolType.Null;
}

export type SymbolsWithPropertiesAndMethods = ArraySymbolDef | ObjectSymbolDef | StringSymbolDef;

export type ExtractSymbolDef<T extends SymbolType> = T extends SymbolType.String
    ? StringSymbolDef
    : T extends SymbolType.Number
      ? NumberSymbolDef
      : T extends SymbolType.Boolean
        ? BooleanSymbolDef
        : T extends SymbolType.Array
          ? ArraySymbolDef
          : T extends SymbolType.Object
            ? ObjectSymbolDef
            : T extends SymbolType.Function
              ? FunctionSymbolDef
              : T extends SymbolType.Union
                ? UnionSymbolDef
                : T extends SymbolType.Undefined
                  ? UndefinedSymbolDef
                  : T extends SymbolType.Null
                    ? NullSymbolDef
                    : never;

export function resolveSymbolDef(
    symbol: GenericSymbolDef
):
    | StringSymbolDef
    | NumberSymbolDef
    | BooleanSymbolDef
    | ArraySymbolDef
    | ObjectSymbolDef
    | FunctionSymbolDef
    | UnionSymbolDef
    | UndefinedSymbolDef
    | NullSymbolDef {
    switch (symbol.type) {
        case SymbolType.String:
            return symbol as StringSymbolDef;

        case SymbolType.Number:
            return symbol as NumberSymbolDef;

        case SymbolType.Boolean:
            return symbol as BooleanSymbolDef;

        case SymbolType.Array:
            return symbol as ArraySymbolDef;

        case SymbolType.Object:
            return symbol as ObjectSymbolDef;

        case SymbolType.Function:
            return symbol as FunctionSymbolDef;

        case SymbolType.Union:
            return symbol as UnionSymbolDef;

        case SymbolType.Undefined:
            return symbol as UndefinedSymbolDef;

        case SymbolType.Null:
            return symbol as NullSymbolDef;

        default:
            throw new Error(`Unknown symbol type: ${symbol.type}`);
    }
}
