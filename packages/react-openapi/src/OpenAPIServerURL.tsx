import { OpenAPIV3 } from 'openapi-types';
import { OpenAPIServerURLVariable } from './OpenAPIServerURLVariable';

/**
 * Show the url of the server with variables replaced by their default values.
 */
export function OpenAPIServerURL(props: { servers: OpenAPIV3.ServerObject[] }) {
    const { servers } = props;
    const server = servers[0];

    const parts = parseServerURL(server?.url ?? '');

    return (
        <span>
            {parts.map((part, i) => {
                if (part.kind === 'text') {
                    return <span key={i}>{part.text}</span>;
                } else {
                    if (!server.variables?.[part.name]) {
                        return <span key={i}>{`{${part.name}}`}</span>;
                    }

                    return (
                        <OpenAPIServerURLVariable
                            key={i}
                            name={part.name}
                            variable={server.variables[part.name]}
                        />
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
        if (i % 2 === 0) {
            result.push({ kind: 'text', text: parts[i] });
        } else {
            result.push({ kind: 'variable', name: parts[i] });
        }
    }
    return result;
}
