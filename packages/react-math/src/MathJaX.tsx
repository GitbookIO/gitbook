'use client';

import * as React from 'react';

declare var MathJax: {
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

    const [html, setHTML] = React.useState('');

    const containerRef = React.useRef<HTMLDivElement | HTMLSpanElement>(null);

    if (typeof window !== 'undefined') {
        const promise = loadMathJaxScript(mathJaxUrl);
        if (promise) {
            React.use(promise);
        }
    }

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

    return React.createElement(inline ? 'span' : 'div', {
        className,
        ref: containerRef,
        dangerouslySetInnerHTML: { __html: html },
    });
}

let mathJaxPromise: Promise<void> | null = null;

function loadMathJaxScript(url: string) {
    if (mathJaxPromise) {
        return mathJaxPromise;
    }

    // @ts-ignore
    if (window.MathJax) {
        return;
    }

    mathJaxPromise = new Promise<void>((resolve, reject) => {
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
    }).finally(() => {
        mathJaxPromise = null;
    });

    return mathJaxPromise;
}

function typeset(code: () => void | Promise<void>) {
    MathJax.startup.promise = MathJax.startup.promise
        .then(() => MathJax.typesetPromise(code()))
        .catch((err) => console.log('Typeset failed: ' + err.message));
    return MathJax.startup.promise;
}
