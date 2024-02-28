import { ContentKitIcon } from '@gitbook/api';
import React from 'react';

interface CodeBlockCommonProps {
    code: string;
    syntax: string;
    lineNumbers: number | boolean;
}

/**
 * Context to render ContentKit elements.
 * This context is designed to work in a server environment.
 */
export interface ContentKitServerContext {
    /**
     * Components to render icons.
     */
    icons: { [icon in ContentKitIcon]: React.ComponentType<{ className: string | undefined }> };

    /**
     * Components to wrap a modal.
     * It can be used to render modals in a portal.
     */
    modalWrapper?: React.ComponentType<{ children: React.ReactNode }>;

    /**
     * Component to render a code block.
     * This component is used to render code blocks in the server environment.
     */
    codeBlock?: React.ComponentType<CodeBlockCommonProps>;

    /**
     * Component to render a code block in the client side
     */
    codeBlockClient?: React.ComponentType<
        CodeBlockCommonProps & {
            onChange: (code: string) => void;
        }
    >;

    /**
     * Server component to render markdown.
     */
    markdown: React.ComponentType<{ className: string; markdown: string }>;
}

/**
 * Props for a ContentKit element that is rendered on the server side.
 */
export interface ContentKitServerElementProps<ElementType> {
    element: ElementType;
    context: ContentKitServerContext;
    state: object;
}

/**
 * Props for a ContentKit element that is rendered on the client side.
 */
export interface ContentKitClientElementProps<ElementType> {
    element: ElementType;
}
