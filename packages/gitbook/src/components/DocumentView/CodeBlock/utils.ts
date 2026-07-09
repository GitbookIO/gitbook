import type { DocumentBlockCode, DocumentBlockCodeLine } from '@gitbook/api';

const PREFILL_WITH_EXPR_REGEX = /\$\$__X-GITBOOK-PREFILL\[(.+?)\]__\$\$/g;

/**
 * Convert a raw code string into a `DocumentBlockCode` object representation.
 *
 * Any placeholder of the form `$$__X-GITBOOK-PREFILL[<expression>]__$$` inside the code
 * string is transformed into a DocumentInlineExpression node with its `data.expression` set to the
 * extracted `<expression>`.
 */
export function convertCodeStringToBlock(args: {
    key: string;
    code: string;
    syntax: string;
}): DocumentBlockCode {
    const { key, code, syntax } = args;
    const lines = code.split('\n').map<DocumentBlockCodeLine>((line) => {
        const nodes: DocumentBlockCodeLine['nodes'] = [];
        let lastIndex = 0;

        for (const match of line.matchAll(PREFILL_WITH_EXPR_REGEX)) {
            const [placeholder, expression] = match;
            const start = match.index ?? 0;

            if (start > lastIndex) {
                nodes.push({
                    object: 'text',
                    leaves: [{ object: 'leaf', text: line.slice(lastIndex, start), marks: [] }],
                });
            }

            if (expression) {
                nodes.push({
                    object: 'inline',
                    type: 'expression',
                    data: { expression },
                    isVoid: true,
                });
            }

            lastIndex = start + placeholder.length;
        }

        if (lastIndex < line.length) {
            nodes.push({
                object: 'text',
                leaves: [{ object: 'leaf', text: line.slice(lastIndex), marks: [] }],
            });
        }

        return {
            object: 'block',
            type: 'code-line',
            data: {},
            nodes,
        };
    });

    return {
        key,
        object: 'block',
        type: 'code',
        data: { syntax },
        nodes: lines,
    };
}

/**
 * Resolve the code text of a code block from its wrapper id.
 * Returns null when the block isn't in the DOM (e.g. not yet hydrated).
 */
export function getCodeTextFromId(codeId: string): string | null {
    const element = document.getElementById(codeId)?.querySelector('code');
    return element ? getCodeText(element) : null;
}

/**
 * Copy text to the clipboard in a way that survives embed contexts.
 *
 * The async Clipboard API (`navigator.clipboard`) is unavailable or rejects in some embed
 * setups — cross-origin iframes where the `clipboard-write` permission wasn't delegated, or
 * non-secure contexts — which is why copying silently failed (and logged an error) in the
 * Assistant embed. We fall back to a hidden `<textarea>` + `execCommand('copy')` so the button
 * keeps working there. Returns whether the copy succeeded so callers only show a success state
 * when the text actually reached the clipboard.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // The async API can reject in restricted embed contexts; fall back below.
        }
    }

    return copyWithExecCommand(text);
}

/**
 * Legacy clipboard write used as a fallback when the async Clipboard API is unavailable.
 *
 * `execCommand('copy')` still works in cross-origin iframes where the async API is blocked,
 * which is why we keep it as the safety net for the embed.
 */
function copyWithExecCommand(text: string): boolean {
    if (typeof document === 'undefined') {
        return false;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Keep it out of view and avoid scrolling/zooming to it when focused.
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);

    try {
        textarea.focus();
        textarea.select();
        return document.execCommand('copy');
    } catch {
        return false;
    } finally {
        textarea.remove();
    }
}

/**
 * Compute the code text from the DOM,
 * ignoring the empty white space we use for empty lines (represented with a class "ew").
 */
export function getCodeText(code: HTMLElement): string {
    let text = '';

    const iterate = (node: Node) => {
        if (node instanceof HTMLBRElement) {
            text += '\n';
        } else if (node instanceof HTMLSpanElement) {
            if (node.classList.contains('ew')) {
                text += '\n';
            } else {
                text += node.innerText;
            }
        } else if (node instanceof HTMLElement) {
            node.childNodes.forEach(iterate);
        } else {
            text += node.textContent;
        }
    };

    iterate(code);

    return text;
}
