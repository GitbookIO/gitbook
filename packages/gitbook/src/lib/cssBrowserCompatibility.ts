import { diffLines } from 'diff';
import postcss, { type Declaration } from 'postcss';
import stylelint from 'stylelint';

const COMPATIBILITY_RULE = 'plugin/no-unsupported-browser-features';

export interface ChangedLines {
    added: Set<number>;
    removed: Set<number>;
}

export interface AddedDeclaration {
    column: number;
    line: number;
    property: string;
}

export interface CompatibilityDiagnostic extends AddedDeclaration {
    feature: string;
    file: string;
    unsupportedBrowsers: string;
}

function lineCount(value: string): number {
    return value === '' ? 0 : value.split('\n').length - (value.endsWith('\n') ? 1 : 0);
}

/** Return the line numbers that differ in each version of a text file. */
export function getChangedLines(base: string, head: string): ChangedLines {
    const added = new Set<number>();
    const removed = new Set<number>();
    let baseLine = 1;
    let headLine = 1;

    for (const change of diffLines(base, head)) {
        const count = change.count ?? lineCount(change.value);

        if (change.added) {
            for (let line = headLine; line < headLine + count; line += 1) {
                added.add(line);
            }
            headLine += count;
        } else if (change.removed) {
            for (let line = baseLine; line < baseLine + count; line += 1) {
                removed.add(line);
            }
            baseLine += count;
        } else {
            baseLine += count;
            headLine += count;
        }
    }

    return { added, removed };
}

function declarationContext(declaration: Declaration): string {
    const ancestors: string[] = [];
    let node = declaration.parent;

    while (node && node.type !== 'root') {
        if (node.type === 'rule') {
            ancestors.push(`rule:${node.selector}`);
        } else if (node.type === 'atrule') {
            ancestors.push(`at:${node.name} ${node.params}`);
        }
        node = node.parent;
    }

    return ancestors.reverse().join(' > ');
}

function declarationKey(declaration: Declaration): string {
    return `${declarationContext(declaration)}\u0000${declaration.prop}`;
}

function declarationsAtLines(css: string, lines: Set<number>): Declaration[] {
    const root = postcss.parse(css);
    const declarations: Declaration[] = [];

    root.walkDecls((declaration) => {
        if (declaration.source?.start?.line && lines.has(declaration.source.start.line)) {
            declarations.push(declaration);
        }
    });

    return declarations;
}

/**
 * Ignore a declaration that merely changed an existing property in the same rule.
 * A new duplicate declaration remains reportable because it has no matching removed line.
 */
export function getAddedDeclarations(base: string, head: string): AddedDeclaration[] {
    const changedLines = getChangedLines(base, head);
    const removedByKey = new Map<string, number>();

    for (const declaration of declarationsAtLines(base, changedLines.removed)) {
        const key = declarationKey(declaration);
        removedByKey.set(key, (removedByKey.get(key) ?? 0) + 1);
    }

    return declarationsAtLines(head, changedLines.added).flatMap((declaration) => {
        const key = declarationKey(declaration);
        const removedCount = removedByKey.get(key) ?? 0;

        if (removedCount > 0) {
            removedByKey.set(key, removedCount - 1);
            return [];
        }

        const line = declaration.source?.start?.line;
        const column = declaration.source?.start?.column;
        return line && column ? [{ column, line, property: declaration.prop }] : [];
    });
}

function featureFromWarning(warning: string): string {
    const feature = warning.match(/browser feature "([^"]+)"/i)?.[1];
    return feature ?? 'CSS feature';
}

function browsersFromWarning(warning: string): string {
    const unsupported = warning.match(
        /(?:not supported by|only partially supported by)\s+(.+?)\s+\(plugin\/no-unsupported-browser-features\)$/i
    )?.[1];
    return unsupported ?? warning;
}

export async function getCompatibilityDiagnostics({
    base,
    browsers,
    file,
    head,
}: {
    base: string;
    browsers: string[];
    file: string;
    head: string;
}): Promise<CompatibilityDiagnostic[]> {
    const declarations = getAddedDeclarations(base, head);
    if (declarations.length === 0) {
        return [];
    }

    const declarationsByLine = new Map<number, AddedDeclaration[]>();
    for (const declaration of declarations) {
        declarationsByLine.set(declaration.line, [
            ...(declarationsByLine.get(declaration.line) ?? []),
            declaration,
        ]);
    }

    const result = await stylelint.lint({
        code: head,
        codeFilename: file,
        config: {
            plugins: ['stylelint-no-unsupported-browser-features'],
            rules: {
                [COMPATIBILITY_RULE]: [true, { browsers, ignorePartialSupport: false }],
            },
        },
    });

    const diagnostics = result.results.flatMap((lintResult) =>
        lintResult.warnings.flatMap((warning) => {
            if (warning.rule !== COMPATIBILITY_RULE || !warning.line) {
                return [];
            }

            const declarationsOnLine = declarationsByLine.get(warning.line) ?? [];
            const declarationsForWarning = warning.column
                ? declarationsOnLine.filter((declaration) => declaration.column === warning.column)
                : declarationsOnLine;

            return declarationsForWarning.map((declaration) => ({
                ...declaration,
                feature: featureFromWarning(warning.text),
                file,
                unsupportedBrowsers: browsersFromWarning(warning.text),
            }));
        })
    );

    return Array.from(
        new Map(
            diagnostics.map((diagnostic) => [
                `${diagnostic.file}:${diagnostic.line}:${diagnostic.property}:${diagnostic.feature}`,
                diagnostic,
            ])
        ).values()
    );
}
