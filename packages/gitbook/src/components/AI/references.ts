import assertNever from 'assert-never';

type BaseAIChatReference = {
    id: string;
    label: string;
    content: string;
};

export type CodeBlockReference = BaseAIChatReference & {
    type: 'code-block';
};

export type TextReference = BaseAIChatReference & {
    type: 'text';
};

export type AIChatReference = CodeBlockReference | TextReference;

export function serializeReferences(refs: AIChatReference[]): string {
    if (refs.length === 0) {
        return '';
    }
    const blocks = refs.map(serializeReference).join('\n\n');
    return `The user is referring to the following:\n\n${blocks}\n\n---\n\n`;
}

function serializeReference(ref: AIChatReference): string {
    switch (ref.type) {
        case 'code-block':
            return buildCodeBlockFence(ref);
        case 'text':
            return buildTextFence(ref);
        default:
            assertNever(ref);
    }
}

/**
 * Build markdown code block
 */
function buildCodeBlockFence(ref: CodeBlockReference): string {
    const { label, content } = ref;
    let max = 2;
    for (const match of content.matchAll(/`+/g)) {
        max = Math.max(max, match[0].length);
    }
    const fence = '`'.repeat(max + 1);
    return `${fence}${label}\n${content}\n${fence}`;
}

/**
 * Build markdown quote
 */
function buildTextFence(ref: TextReference): string {
    const { label, content } = ref;
    let max = 3;
    for (const match of content.matchAll(/"+/g)) {
        max = Math.max(max, match[0].length);
    }
    const fence = '"'.repeat(max + 1);
    return `${fence}${label}\n${content}\n${fence}`;
}
