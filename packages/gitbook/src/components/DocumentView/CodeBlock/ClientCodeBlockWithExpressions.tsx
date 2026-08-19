'use client';

import { ClientCodeBlock, type ClientBlockProps } from './ClientCodeBlock';
import { useAdaptiveVisitor } from '@/components/Adaptive';
import { useEvaluateInlineExpression } from '@/components/DocumentView/InlineExpression/useEvaluateInlineExpression';

/**
 * Code block whose content contains inline expressions, so it needs the expression runtime.
 * Kept in its own module: importing it pulls `@gitbook/expr` and its JS parser.
 */
export function ClientCodeBlockWithExpressions(props: ClientBlockProps) {
    const getAdaptiveVisitorClaims = useAdaptiveVisitor();
    const evaluateInlineExpression = useEvaluateInlineExpression({
        visitorClaims: getAdaptiveVisitorClaims(),
        variables: props.inlineExprVariables,
    });

    return <ClientCodeBlock {...props} evaluateInlineExpression={evaluateInlineExpression} />;
}
