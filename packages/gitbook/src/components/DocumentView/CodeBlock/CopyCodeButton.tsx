'use client';

import React from 'react';

import { t, useLanguage } from '@/intl/client';
import { ClassValue, tcls } from '@/lib/tailwind';

/**
 * Client component to copy the code of a code block.
 * To avoid passing large payload to the client, the code is computed from the DOM.
 */
export function CopyCodeButton(props: { codeId: string; style: ClassValue }) {
    const { codeId, style } = props;

    const language = useLanguage();
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        if (!copied) {
            return;
        }

        const timeout = setTimeout(() => {
            setCopied(false);
        }, 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, [copied]);

    const onClick = () => {
        const element = document.getElementById(codeId);
        if (!element) {
            return;
        }

        navigator.clipboard.writeText(getCodeText(element));

        setCopied(true);
    };

    return (
        <button onClick={onClick} className={tcls(style, 'print:hidden')}>
            {t(language, copied ? 'code_copied' : 'code_copy')}
        </button>
    );
}

/**
 * Compute the code text from the DOM,
 * ignoring the empty white space we use for empty lines (represented with a class "ew").
 */
function getCodeText(code: HTMLElement): string {
    let text: string = '';

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
