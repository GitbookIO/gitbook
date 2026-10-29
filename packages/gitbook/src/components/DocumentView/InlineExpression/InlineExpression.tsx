import * as React from 'react';

import type { DocumentInlineExpression } from '@gitbook/api';

import type { InlineProps } from '../Inline';
import { InlineExpressionValueLazy } from './InlineExpressionValueLazy';

/**
 * Render an inline expression.
 */
export function InlineExpression(props: InlineProps<DocumentInlineExpression>) {
    const { context, inline } = props;

    const { data } = inline;

    const variables = context.contentContext
        ? {
              space: context.contentContext?.revision.variables,
              page:
                  'page' in context.contentContext
                      ? context.contentContext.page.variables
                      : undefined,
          }
        : {};

    return (
        <React.Suspense fallback={null}>
            <InlineExpressionValueLazy expression={data.expression} variables={variables} />
        </React.Suspense>
    );
}
