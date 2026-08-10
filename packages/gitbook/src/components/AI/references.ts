type BaseAIChatReference = {
    id: string;
    label?: string;
};

export type CodeBlockReference = BaseAIChatReference & {
    type: 'code-block';
    content: string;
    syntax?: string;
};

export type PageReference = BaseAIChatReference & {
    type: 'page';
    /** Title of the page being referenced. */
    label: string;
    /** Path of the page, used to help the assistant identify it. */
    path?: string;
    /** Site-relative href of the page, used to navigate back to it from the chip. */
    href?: string;
};

export type TextReference = BaseAIChatReference & {
    type: 'text';
    /** The selected text content. */
    content: string;
};

export type AIChatReference = CodeBlockReference | PageReference | TextReference;

/**
 * Serialize the staged references into a preamble prepended to the user's message,
 * so the assistant is informed about the context the user is referring to.
 */
export function serializeReferences(refs: AIChatReference[]): string {
    if (refs.length === 0) {
        return '';
    }

    const sections: string[] = [];

    const pageRefs = refs.filter((ref): ref is PageReference => ref.type === 'page');
    if (pageRefs.length > 0) {
        sections.push(serializePageReferences(pageRefs));
    }

    const codeRefs = refs.filter((ref): ref is CodeBlockReference => ref.type === 'code-block');
    if (codeRefs.length > 0) {
        sections.push(serializeCodeBlockReferences(codeRefs));
    }

    const textRefs = refs.filter((ref): ref is TextReference => ref.type === 'text');
    if (textRefs.length > 0) {
        sections.push(serializeTextReferences(textRefs));
    }

    if (sections.length === 0) {
        return '';
    }

    return `${sections.join('\n\n')}\n\n---\n\n`;
}

function serializePageReferences(refs: PageReference[]): string {
    const plural = refs.length > 1;
    const list = refs
        .map((ref) => {
            const url = ref.href ?? ref.path;
            return url ? `- [${ref.label}](${url})` : `- "${ref.label}"`;
        })
        .join('\n');
    return `The user is referring to the following page${plural ? 's' : ''} they are reading. Answer their question in the context of ${plural ? 'them' : 'it'}:\n\n${list}`;
}

function serializeCodeBlockReferences(refs: CodeBlockReference[]): string {
    const plural = refs.length > 1;
    const blocks = refs.map(buildCodeBlockFence).join('\n\n');
    return `The user is referring to the following code block${plural ? 's' : ''} from the page they are reading. Answer their question about ${plural ? 'them' : 'it'}:\n\n${blocks}`;
}

function serializeTextReferences(refs: TextReference[]): string {
    const plural = refs.length > 1;
    const blocks = refs.map((ref) => quoteText(ref.content)).join('\n\n');
    return `The user is referring to the following excerpt${plural ? 's' : ''} from the page they are reading. Answer their question about ${plural ? 'them' : 'it'}:\n\n${blocks}`;
}

function quoteText(content: string): string {
    return content
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
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
