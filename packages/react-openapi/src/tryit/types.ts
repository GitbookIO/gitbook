export type TryItParameterLocation = 'path' | 'query' | 'header' | 'cookie';

export interface TryItField {
    name: string;
    required: boolean;
    description?: string;
    enum?: string[];
    /** Shown as the input placeholder, generated from the schema. */
    placeholder?: string;
    /** Initial value, from an explicit `default` or `example`. */
    defaultValue?: string;
}

export interface TryItParameter extends TryItField {
    in: TryItParameterLocation;
    /** Array query parameter sent as `?id=1&id=2`; the reader types it comma-separated. */
    explode?: boolean;
}

export interface TryItBodyField extends TryItField {
    binary: boolean;
}

export interface TryItMediaType {
    mediaType: string;
    /** `raw` is edited as text, `form` and `multipart` field by field, `binary` as a file. */
    kind: 'raw' | 'form' | 'multipart' | 'binary';
    examples: { label: string; value: string }[];
    fields: TryItBodyField[];
}

export interface TryItSecurityOption {
    label: string;
    /** Scheme names; all of them apply together. */
    schemes: string[];
}

/** Everything the Try it panel needs about an operation, small and serializable. */
export interface TryItOperation {
    method: string;
    path: string;
    parameters: TryItParameter[];
    body: { required: boolean; mediaTypes: TryItMediaType[] } | null;
    securityOptions: TryItSecurityOption[];
}
