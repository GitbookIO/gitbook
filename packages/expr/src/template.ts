export type TemplateText = {
    type: 'text';
    value: string;
    start: number;
    end: number;
};

export type TemplateExpression = {
    type: 'expression';
    value: string;
    start: number; // Start index of the expression content (after `{{`)
    end: number; // End index of the expression content (before `}}`)
};

export type TemplatePart = TemplateText | TemplateExpression;

/**
 * Parse a template string containing `{{ expression }}` placeholders.
 */
export function parseTemplate(template: string): TemplatePart[] {
    const parts: TemplatePart[] = [];
    const regex = /\{\{(.*?)\}\}/gs;
    let lastIndex = 0;

    for (const match of template.matchAll(regex)) {
        const matchStart = match.index ?? 0;
        const matchEnd = matchStart + match[0].length;

        if (matchStart > lastIndex) {
            parts.push({
                type: 'text',
                value: template.slice(lastIndex, matchStart),
                start: lastIndex,
                end: matchStart,
            });
        }

        parts.push({
            type: 'expression',
            value: (match[1] ?? '').trim(),
            start: matchStart + 2,
            end: matchEnd - 2,
        });
        lastIndex = matchEnd;
    }

    if (lastIndex < template.length) {
        parts.push({
            type: 'text',
            value: template.slice(lastIndex),
            start: lastIndex,
            end: template.length,
        });
    }

    return parts;
}
