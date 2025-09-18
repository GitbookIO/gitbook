'use client';
import { useAdaptiveVisitor } from '@/components/Adaptive';
import { useMemo } from 'react';
import type { InlineExpressionVariables } from './types';
import { useEvaluateInlineExpression } from './useEvaluateInlineExpression';

export function InlineExpressionValue(props: {
    expression: string;
    variables: InlineExpressionVariables;
}) {
    const { expression, variables } = props;

    const getAdaptiveVisitorClaims = useAdaptiveVisitor();
    const visitorClaims = getAdaptiveVisitorClaims();
    const evaluateInlineExpression = useEvaluateInlineExpression({
        visitorClaims,
        variables,
    });

    const result = useMemo(
        () => evaluateInlineExpression(expression),
        [expression, evaluateInlineExpression]
    );

    return <>{result}</>;
}
