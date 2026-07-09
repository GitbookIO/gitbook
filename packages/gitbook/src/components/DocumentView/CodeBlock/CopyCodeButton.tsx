'use client';

import React from 'react';

import { Button } from '@/components/primitives';
import { t, useLanguage } from '@/intl/client';
import { type ClassValue, tcls } from '@/lib/tailwind';

import { copyToClipboard, getCodeTextFromId } from './utils';

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

    const onClick = async () => {
        const codeText = getCodeTextFromId(codeId);
        if (codeText === null) {
            return;
        }

        // Only surface the "copied" state when the write actually succeeded, so a blocked
        // clipboard in the embed no longer looks like a successful copy.
        if (await copyToClipboard(codeText)) {
            setCopied(true);
        }
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
