import type { Variables } from '@gitbook/api';
import type { AdaptiveVisitorClaims } from './types';

/**
 * Return an evaluation context to evaluate expressions.
 */
export function createExpressionEvaluationContext(args: {
    visitorClaims: AdaptiveVisitorClaims | null;
    variables: {
        space?: Variables;
        page?: Variables;
    };
}) {
    const { visitorClaims, variables } = args;
    return {
        ...(visitorClaims ? visitorClaims : {}),
        space: {
            vars: variables.space ?? {},
        },
        ...(variables.page
            ? {
                  page: {
                      vars: variables.page ?? {},
                  },
              }
            : {}),
    };
}
