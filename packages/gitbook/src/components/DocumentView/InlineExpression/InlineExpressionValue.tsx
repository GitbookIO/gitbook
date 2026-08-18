'use client';
import { useMemo } from 'react';

import type { InlineExpressionVariables } from './types';
import { useEvaluateInlineExpression } from './useEvaluateInlineExpression';
import { useAdaptiveVisitor } from '@/components/Adaptive';

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
