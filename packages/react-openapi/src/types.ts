export interface OpenAPIContextProps extends OpenAPIClientContext {
    CodeBlock: React.ComponentType<{ code: string; syntax: string }>;

    /** Spec url for the Scalar Api Client */
    specUrl: string;
}

export interface OpenAPIClientContext {
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
    /** Optional id attached to the OpenAPI Operation heading and used as an anchor */
    id?: string;
}
