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
}

export interface OpenAPIFetcher {
    /**
     * Fetch an OpenAPI file by its URL.
     * It can be a JSON or YAML file.
     */
    fetch: (url: string) => Promise<any>;

    /**
     * Parse markdown to the react element to render.
     */
    parseMarkdown?: (input: string) => Promise<string>;
}
