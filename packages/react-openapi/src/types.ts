export type IconComponent = React.ComponentType<{ className?: string }>;

export interface OpenAPIContextProps extends OpenAPIClientContext {
    CodeBlock: React.ComponentType<{ code: string; syntax: string }>;
}

export interface OpenAPIClientContext {
    icons: {
        chevronDown: React.ReactNode;
        chevronRight: React.ReactNode;
    };


    /**
     * Force all sections to be opened by default.
     * @default false
     */
    defaultInteractiveOpened?: boolean;

    /** Optional id attached to the OpenAPI Operation heading and used as an anchor */
    id?: string;
}

export interface OpenAPIFetcher {
    /**
     * Fetch an OpenAPI file by its URL. It should return a fully parsed OpenAPI v3 document.
     */
    fetch: (url: string) => Promise<any>;

    /**
     * Parse markdown to the react element to render.
     */
    parseMarkdown?: (input: string) => Promise<string>;
}
