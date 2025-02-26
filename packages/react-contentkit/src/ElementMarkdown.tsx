import type { ContentKitMarkdown } from '@gitbook/api';

import { ElementMarkdownClient } from './ElementMarkdownClient';
import { resolveDynamicBinding } from './dynamic';
import type { ContentKitServerElementProps } from './types';

export function ElementMarkdown(props: ContentKitServerElementProps<ContentKitMarkdown>) {
    const { element, context, state } = props;
    const Markdown = context.markdown;

    const initialMarkdown = resolveDynamicBinding(state, element.content);

    async function renderMarkdown(markdown: string) {
        'use server';
        return <Markdown className="contentkit-markdown" markdown={markdown} />;
    }

    return (
        <ElementMarkdownClient
            element={element}
            initialMarkdown={initialMarkdown !== element.content ? initialMarkdown : undefined}
            renderMarkdown={renderMarkdown}
        >
            <Markdown className="contentkit-markdown" markdown={initialMarkdown} />
        </ElementMarkdownClient>
    );
}
