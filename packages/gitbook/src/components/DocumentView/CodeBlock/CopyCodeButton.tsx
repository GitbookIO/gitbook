'use client';

import React from 'react';

import { Button } from '@/components/primitives';
import { t, useLanguage } from '@/intl/client';
import { type ClassValue, tcls } from '@/lib/tailwind';

import { getCodeText } from './utils';

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
        const wrapper = document.getElementById(codeId);
        const element = wrapper?.querySelector('code');
        if (!element) {
            return;
        }

        navigator.clipboard.writeText(getCodeText(element));

        setCopied(true);
    };

    return (
        <Button
            size="xsmall"
            variant="secondary"
            onClick={onClick}
            className={tcls(style, 'translate-y-0!', 'print:hidden')}
        >
            {t(language, copied ? 'code_copied' : 'code_copy')}
        </Button>
    );
}
