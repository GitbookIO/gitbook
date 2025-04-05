export interface OpenAPIClientContext {
    /**
     * Icons used in the block.
     */
    icons: {
        chevronDown: React.ReactNode;
        chevronRight: React.ReactNode;
        plus: React.ReactNode;
    };

    /**
     * Force all sections to be opened by default.
     * @default false
     */
    defaultInteractiveOpened?: boolean;

    /**
     * The key of the block
     */
    blockKey?: string;

    /**
     * Optional id attached to the heading and used as an anchor.
     */
    id?: string;
}

export interface OpenAPIContext extends OpenAPIClientContext {
    /**
     * Render a code block.
     */
    renderCodeBlock: (props: { code: string; syntax: string }) => React.ReactNode;

    /**
     * Render the heading of the operation.
     */
    renderHeading: (props: {
        deprecated: boolean;
        title: string;
        stability?: string;
    }) => React.ReactNode;

    /**
     * Render the document of the operation.
     */
    renderDocument: (props: { document: object }) => React.ReactNode;

    /**
     * Specification URL.
     */
    specUrl: string;
}

/**
 * Get the client context from the OpenAPI context.
 */
export function getOpenAPIClientContext(context: OpenAPIContext): OpenAPIClientContext {
    return {
        icons: context.icons,
        defaultInteractiveOpened: context.defaultInteractiveOpened,
        blockKey: context.blockKey,
        id: context.id,
    };
}
