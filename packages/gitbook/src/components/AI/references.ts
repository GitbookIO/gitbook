import assertNever from 'assert-never';

type BaseAIChatReference = {
    id: string;
    label?: string;
    content: string;
};

export type CodeBlockReference = BaseAIChatReference & {
    type: 'code-block';
    syntax?: string;
};

export type AIChatReference = CodeBlockReference;

export function serializeReferences(refs: AIChatReference[]): string {
    if (refs.length === 0) {
        return '';
    }
    const plural = refs.length > 1;
    const blocks = refs.map(serializeReference).join('\n\n');
    return `The user is referring to the following code block${plural ? 's' : ''} from the page they are reading. Answer their question about ${plural ? 'them' : 'it'}:\n\n${blocks}\n\n---\n\n`;
}

function serializeReference(ref: AIChatReference): string {
    switch (ref.type) {
        case 'code-block':
            return buildCodeBlockFence(ref);
        default:
            assertNever(ref.type);
    }
}

function buildCodeBlockFence(ref: CodeBlockReference): string {
    const { label, content, syntax } = ref;
    let max = 2;
    for (const match of content.matchAll(/`+/g)) {
        max = Math.max(max, match[0].length);
    }
    const fence = '`'.repeat(max + 1);
    const heading = label ? `${label}\n` : '';
    return `${heading}${fence}${syntax ?? ''}\n${content}\n${fence}`;
}
