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
