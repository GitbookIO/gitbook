'use client';
import { ContentKitMarkdown } from '@gitbook/api';

import { ContentKitClientElementProps } from './types';
import { resolveDynamicBinding } from './dynamic';
import React from 'react';
import { useContentKitClientContext } from './context';

/**
 * Client component to render the default markdown output and then update it on state update.
 */
export function ElementMarkdownClient(
    props: ContentKitClientElementProps<ContentKitMarkdown> & {
        initialMarkdown: string | undefined;
        renderMarkdown: (markdown: string) => React.ReactNode | Promise<React.ReactNode>;
        children: React.ReactNode;
    },
) {
    const {
        element,
        initialMarkdown = element.content,
        renderMarkdown,
        children: initialChildren,
    } = props;

    const [children, setChildren] = React.useState<React.ReactNode>(null);
    const context = useContentKitClientContext();

    const markdown = resolveDynamicBinding(context.state, element.content);

    React.useEffect(() => {
        if (initialMarkdown === markdown) {
            setChildren(null);
            return;
        }

        let cancelled = false;

        (async () => {
            const parsed = await renderMarkdown(markdown);
            if (!cancelled) {
                setChildren(parsed);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [initialMarkdown, markdown]);

    return <>{children || initialChildren}</>;
}
