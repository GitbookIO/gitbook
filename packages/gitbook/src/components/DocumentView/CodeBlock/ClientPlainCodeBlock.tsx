'use client';

import type { CustomizationThemedCodeTheme } from '@gitbook/api';
import { useId } from 'react';

import type { DocumentContext } from '../DocumentView';
import { ClientCodeBlock } from './ClientCodeBlock';
import { convertCodeStringToBlock } from './utils';

// Client counterpart of `PlainCodeBlock`, for callers that build code from client state and so
// cannot go through the async server `CodeBlock`.
export function ClientPlainCodeBlock(props: {
    code: string;
    syntax: string;
    mode?: DocumentContext['mode'];
    themes?: CustomizationThemedCodeTheme;
}) {
    const { code, syntax, mode = 'default', themes } = props;
    const id = useId();

    const block = convertCodeStringToBlock({ key: id, code, syntax });

    return (
        <ClientCodeBlock
            block={block}
            inlines={[]}
            inlineExprVariables={{}}
            mode={mode}
            themes={themes}
        />
    );
}
