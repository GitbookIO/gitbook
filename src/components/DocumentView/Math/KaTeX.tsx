import katex from 'katex';
import dynamic from 'next/dynamic';
import React from 'react';

/**
 * Server component to compile the KaTeX formula to HTML.
 */
export function KaTeX(props: { formula: string; inline: boolean; className?: string }) {
    const { formula, inline, className } = props;

    const html = katex.renderToString(formula, {
        displayMode: !inline,
        output: 'htmlAndMathml',
    });

    // While loading the CSS, we fallback to rendering the MathML.
    const mathml = katex.renderToString(formula, {
        displayMode: !inline,
        output: 'mathml',
    });
    const fallback = inline ? (
        <span className={className} dangerouslySetInnerHTML={{ __html: mathml }} />
    ) : (
        <div className={className} dangerouslySetInnerHTML={{ __html: mathml }} />
    );

    const KaTeXCSS = dynamic(() => import('./KaTeXCSS'), { ssr: false, loading: () => fallback });
    return (
        <KaTeXCSS>
            {inline ? (
                <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
                <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
            )}
        </KaTeXCSS>
    );
}
