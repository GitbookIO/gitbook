'use client';

import { getCodeTextFromId } from './utils';
import { useCopyToClipboard } from '@/components/hooks';
import { Button } from '@/components/primitives';
import { t, useLanguage } from '@/intl/client';
import { type ClassValue, tcls } from '@/lib/tailwind';

/**
 * Client component to copy the code of a code block.
 * To avoid passing large payload to the client, the code is computed from the DOM.
 */
export function CopyCodeButton(props: { codeId: string; style: ClassValue }) {
    const { codeId, style } = props;

    const language = useLanguage();
    const { copied, copy } = useCopyToClipboard();

    const onClick = () => {
        const codeText = getCodeTextFromId(codeId);
        if (codeText === null) {
            return;
        }
        copy(codeText);
    };

    return (
        <>
            <Button
                size="xsmall"
                variant="secondary"
                onClick={onClick}
                className={tcls(style, 'translate-y-0!', 'print:hidden')}
            >
                {t(language, copied ? 'code_copied' : 'code_copy')}
            </Button>
            {/* A label swap on the focused button isn't announced, the live region is. */}
            <span role="status" className="sr-only">
                {copied ? t(language, 'code_copied') : null}
            </span>
        </>
    );
}
