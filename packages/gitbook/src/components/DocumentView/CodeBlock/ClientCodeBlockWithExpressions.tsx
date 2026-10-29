'use client';

import { ClientCodeBlock, type ClientBlockProps } from './ClientCodeBlock';
import { useAdaptiveVisitor } from '@/components/Adaptive';
import { useEvaluateInlineExpression } from '@/components/DocumentView/InlineExpression/useEvaluateInlineExpression';

/**
 * Code block with inline expressions; its own module because it pulls in `@gitbook/expr`.
 */
export function ClientCodeBlockWithExpressions(props: ClientBlockProps) {
    const getAdaptiveVisitorClaims = useAdaptiveVisitor();
    const evaluateInlineExpression = useEvaluateInlineExpression({
        visitorClaims: getAdaptiveVisitorClaims(),
        variables: props.inlineExprVariables,
    });

    return <ClientCodeBlock {...props} evaluateInlineExpression={evaluateInlineExpression} />;
}
