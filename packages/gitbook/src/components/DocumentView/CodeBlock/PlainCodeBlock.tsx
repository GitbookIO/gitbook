import type {
    CustomizationThemedCodeTheme,
    JSONDocument,
    SiteCustomizationSettings,
} from '@gitbook/api';
import { useId } from 'react';

import type { DocumentContext } from '../DocumentView';
import { CodeBlock } from './CodeBlock';
import { convertCodeStringToBlock } from './utils';

/**
 * Plain code block with syntax highlighting.
 * For simplicity, this is just a wrapper around the CodeBlock component, emulating a document.
 */
export function PlainCodeBlock(props: {
    code: string;
    syntax: string;
    mode?: DocumentContext['mode'];
    themeKey?: keyof SiteCustomizationSettings['styling']['codeTheme'];
    themes?: CustomizationThemedCodeTheme;
}) {
    const { code, syntax, mode = 'default', themeKey, themes } = props;
    const id = useId();

    const block = convertCodeStringToBlock({ key: id, code, syntax });

    const document: JSONDocument = {
        object: 'document',
        data: {},
        nodes: [block],
    };

    return (
        <CodeBlock
            document={document}
            context={{
                mode,
            }}
            themeKey={themeKey}
            themes={themes}
            block={block}
            ancestorBlocks={[]}
            // We optimize perf by default
            isEstimatedOffscreen
        />
    );
}
