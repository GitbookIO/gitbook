export type CodeBlockReference = {
    type: 'code-block';
    id: string;
    codeText: string;
    syntax?: string;
    title?: string;
};

export type AIChatReference = CodeBlockReference;

const MAX_CODE_CHARS = 8000;

export function isSameReference(a: AIChatReference, b: AIChatReference): boolean {
    return a.id === b.id;
}

function buildFence(code: string): string {
    let max = 2;
    for (const match of code.matchAll(/`+/g)) {
        max = Math.max(max, match[0].length);
    }
    return '`'.repeat(max + 1);
}

function serializeReference(ref: AIChatReference): string {
    const code =
        ref.codeText.length > MAX_CODE_CHARS
            ? `${ref.codeText.slice(0, MAX_CODE_CHARS)}\n... (truncated)`
            : ref.codeText;
    const fence = buildFence(code);
    const title = ref.title ? `// ${ref.title}\n` : '';
    return `${fence}${ref.syntax ?? ''}\n${title}${code}\n${fence}`;
}

export function serializeReferences(refs: AIChatReference[]): string {
    if (refs.length === 0) {
        return '';
    }
    const blocks = refs.map(serializeReference).join('\n\n');
    return `The user is asking about the following code:\n\n${blocks}\n\n---\n\n`;
}
