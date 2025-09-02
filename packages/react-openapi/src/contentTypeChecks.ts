export function isJSON(contentType?: string): boolean {
    return contentType?.toLowerCase().includes('application/json') || false;
}

export function isXML(contentType?: string): boolean {
    return contentType?.toLowerCase().includes('application/xml') || false;
}

export function isYAML(contentType?: string): boolean {
    return contentType?.toLowerCase().includes('application/yaml') || false;
}

export function isGraphQL(contentType?: string): boolean {
    return contentType?.toLowerCase().includes('application/graphql') || false;
}

export function isCSV(contentType?: string): boolean {
    return contentType?.toLowerCase().includes('text/csv') || false;
}

export function isPDF(contentType?: string): boolean {
    return contentType?.toLowerCase().includes('application/pdf') || false;
}

export function isText(contentType?: string): boolean {
    return contentType?.toLowerCase().includes('text/plain') || false;
}

export function isFormUrlEncoded(contentType?: string): boolean {
    return contentType?.toLowerCase().includes('application/x-www-form-urlencoded') || false;
}

export function isFormData(contentType?: string): boolean {
    return !!contentType && contentType.toLowerCase().includes('multipart/form-data');
}

export function isPlainObject(value: unknown): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
