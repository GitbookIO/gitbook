import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Server component to compile the KaTeX formula to HTML.
 * TODO: find way to lazy load KaTeX CSS.
 */
export function KaTeX(props: { formula: string; inline: boolean; className?: string }) {
    const { formula, inline, className } = props;

    const html = katex.renderToString(formula, {
        displayMode: !inline,
    });

    if (inline) {
        return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
    } else {
        return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
    }
}
