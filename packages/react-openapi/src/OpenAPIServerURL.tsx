import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { OpenAPIServerURLVariable } from './OpenAPIServerURLVariable';

/**
 * Show the url of the server with variables replaced by their default values.
 */
export function OpenAPIServerURL(props: { servers: OpenAPIV3.ServerObject[] }) {
    const { servers } = props;
    const server = servers[0];

    if (!server) {
        return null;
    }

    const parts = parseServerURL(server?.url ?? '');

    return (
        <span>
            {parts.map((part, i) => {
                if (part.kind === 'text') {
                    return <span key={i}>{part.text}</span>;
                } else {
                    const variable = server.variables?.[part.name];
                    if (!variable) {
                        return <span key={i}>{`{${part.name}}`}</span>;
                    }

                    return (
                        <OpenAPIServerURLVariable key={i} name={part.name} variable={variable} />
                    );
                }
            })}
        </span>
    );
}

/**
 * Get the default URL for the server.
 */
export function getServersURL(servers: OpenAPIV3.ServerObject[]): string {
    const server = servers[0];
    if (!server) {
        return '';
    }
    const parts = parseServerURL(server?.url ?? '');

    return parts
        .map((part) => {
            if (part.kind === 'text') {
                return part.text;
            } else {
                return server.variables?.[part.name]?.default ?? `{${part.name}}`;
            }
        })
        .join('');
}

function parseServerURL(url: string) {
    const parts = url.split(/{([^}]+)}/g);
    const result: Array<{ kind: 'variable'; name: string } | { kind: 'text'; text: string }> = [];
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) {
            continue;
        }
        if (i % 2 === 0) {
            result.push({ kind: 'text', text: part });
        } else {
            result.push({ kind: 'variable', name: part });
        }
    }
    return result;
}
