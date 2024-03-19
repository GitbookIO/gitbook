'use client';

import React from 'react';
import type { MathJaXFormulaProps } from './MathJaX';

const MathJaXFormula = React.lazy(() => import('./MathJaX'));

/**
 * Lazy component that loads MathJax and renders the formula.
 */
export function MathJaXLazy(props: MathJaXFormulaProps) {
    return (
        <React.Suspense fallback={props.fallback}>
            <MathJaXFormula {...props} />
        </React.Suspense>
    );
}
