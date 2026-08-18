import * as React from 'react';

import type { Variables } from '@gitbook/api';
import { ExpressionRuntime, formatExpressionResult } from '@gitbook/expr';

import {
    type AdaptiveVisitorClaims,
    createExpressionEvaluationContext,
} from '@/components/Adaptive';

/**
 * Hook that returns a callback to evaluate an inline expression with visitor data
 * and space/page variables as context.
 */
export function useEvaluateInlineExpression(args: {
    visitorClaims: AdaptiveVisitorClaims | null;
    variables: {
        space?: Variables;
        page?: Variables;
    };
}) {
    const { visitorClaims, variables } = args;
    const evaluateInlineExpression = React.useMemo(() => {
        const runtime = new ExpressionRuntime();
        const evaluationContext = createExpressionEvaluationContext({
            visitorClaims,
            variables,
        });

        return (expression: string) => {
            try {
                return formatExpressionResult(
                    runtime.evaluate(expression, evaluationContext) ?? ''
                );
            } catch (err) {
                console.error('Failed to evaluate expression:', expression, err);
                return `{{${expression}}}`;
            }
        };
    }, [variables, visitorClaims]);

    return evaluateInlineExpression;
}
