declare module 'eval-estree-expression' {
    /**
     * Options for evaluation and compilation.
     */
    export interface EvalESTreeExpressionOptions {
        /**
         * Force logical operators to return a boolean result. Default: undefined
         */
        booleanLogicalOperators?: boolean;
        /**
         * Allow function calls to be evaluated. This is unsafe, please enable this option at your own risk. Default: false
         */
        functions?: boolean;
        /**
         * Enable support for function statements and expressions by enabling the functions option AND by passing the .generate() function from the escodegen library. Default: undefined
         */
        generate?: boolean | ((node: any) => string);
        /**
         * Enable the =~ regex operator to support testing values without using functions (example name =~ /^a.*c$/). Default: true
         */
        regexOperator?: boolean;
        /**
         * Throw an error when variables are undefined. Default: false
         */
        strict?: boolean;
        /**
         * Used with the variables method to return nested variables (e.g., variables with dot notation, like foo.bar.baz). Default: undefined
         */
        withMembers?: boolean;
    }

    /**
     * Evaluates an ESTree expression asynchronously against a given context.
     * @param expression - An object representing an ESTree-compliant AST node.
     * @param context - An object containing variables and values to be used during evaluation.
     * @returns A promise resolving to the result of the evaluation.
     */
    export function evaluate<ASTNode>(
        ast: ASTNode,
        context: object,
        options?: EvalESTreeExpressionOptions
    ): Promise<any>;

    /**
     * Evaluates an ESTree expression synchronously against a given context.
     * @param expression - An object representing an ESTree-compliant AST node.
     * @param context - An object containing variables and values to be used during evaluation.
     * @returns The result of the evaluation.
     */
    export namespace evaluate {
        function sync<ASTNode>(
            expression: ASTNode,
            context: object,
            options?: EvalESTreeExpressionOptions
        ): any;
    }
}
