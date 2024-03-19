import katex from 'katex';
import React from 'react';

const KaTeXCSS = React.lazy(() => import('./KaTeXCSS'));

/**
 * Server component to compile the KaTeX formula to HTML.
 */
export function KaTeX(props: {
    formula: string;
    inline: boolean;
    className?: string;
    fallback?: React.ReactNode;
}) {
    const { formula, inline, className } = props;

    try {
        const html = katex.renderToString(formula, {
            displayMode: !inline,
            output: 'htmlAndMathml',
            throwOnError: true,
            strict: false,
        });

        const Tag = inline ? 'span' : 'div';
        return (
            <>
                <KaTeXCSS />
                <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
            </>
        );
    } catch (error) {
        return <>{props.fallback}</>;
    }
}
