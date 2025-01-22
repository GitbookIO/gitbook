export function joinPath(...parts: string[]): string {
    return parts.join('/').replace(/\/+/g, '/');
}
