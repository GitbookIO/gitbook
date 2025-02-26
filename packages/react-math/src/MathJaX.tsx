'use client';

import React from 'react';

declare let MathJax: {
    startup: {
        promise: Promise<void>;
    };
    tex2chtml: (formula: string, options: { display: boolean }) => any;
    typesetPromise: (promise: void | Promise<void>) => Promise<void>;
};

export interface MathJaXFormulaProps {
    formula: string;
    inline: boolean;
    fallback?: React.ReactNode;
    className?: string;
    mathJaxUrl: string;
}

/**
 * Client component that loads MathJax and renders the formula.
 */
export default function MathJaXFormula(props: MathJaXFormulaProps) {
    const { formula, inline, className, mathJaxUrl } = props;

    // @ts-ignore - React.use doesn't seem define in typing
    React.use(loadMathJaxScript(mathJaxUrl));
    const [html, setHTML] = React.useState('');

    const containerRef = React.useRef<HTMLDivElement>(null);

    // Typeset the formula
    React.useEffect(() => {
        let cancelled = false;

        typeset(() => {
            if (cancelled) {
                return;
            }

            const domNode = MathJax.tex2chtml(formula, { display: !inline });
            setHTML(domNode.outerHTML);
        });

        return () => {
            cancelled = true;
        };
    }, [inline, formula]);

    const Component = inline ? 'span' : 'div';

    return (
        <Component
            ref={containerRef}
            className={className}
            aria-busy={!html ? true : undefined}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

let mathJaxPromise: Promise<void> | null = null;

function loadMathJaxScript(url: string) {
    if (mathJaxPromise) {
        return mathJaxPromise;
    }

    mathJaxPromise = new Promise<void>((resolve, reject) => {
        if (typeof window === 'undefined') {
            resolve();
            return;
        }
        // @ts-ignore
        window.MathJax = {
            tex: {
                inlineMath: [],
            },
            options: {
                enableMenu: false,
            },
            startup: {
                elements: null,
                typeset: false,
            },
        };

        const script = document.createElement('script');
        script.src = url;
        script.id = 'MathJax-script';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            resolve();
        };
        script.onerror = () => {
            reject(new Error('Failed to load MathJax'));
        };
    });

    return mathJaxPromise;
}

function typeset(code: () => void | Promise<void>) {
    MathJax.startup.promise = MathJax.startup.promise
        .then(() => MathJax.typesetPromise(code()))
        .catch((_err) => {});
    return MathJax.startup.promise;
}
