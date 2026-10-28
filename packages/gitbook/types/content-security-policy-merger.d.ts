declare module 'content-security-policy-merger' {
    export function merge(...policies: string[]): string;
}
