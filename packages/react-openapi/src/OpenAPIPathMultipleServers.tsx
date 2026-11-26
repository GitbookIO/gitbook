'use client';
import type { OpenAPIClientContext } from './context';
import { formatPath } from './formatPath';
import type { OpenAPIPathProps } from './OpenAPIPath';
import { OpenAPIPathItem } from './OpenAPIPathItem';
import { OpenAPISelect, useSelectState } from './OpenAPISelect';
import type { OpenAPIServerWithCustomProperties } from './types';
import { getDefaultServerURL, interpolateServerURL } from './util/server';
import { createStateKey } from './utils';

/**
 * Display the path of an operation.
 */
export function OpenAPIPathMultipleServers(
    props: OpenAPIPathProps & { context: OpenAPIClientContext }
) {
    const { data, withServer = true, context } = props;
    const { path, servers } = data;

    const defaultServer = getDefaultServerURL(servers);
    const formattedPath = formatPath(path);

    const items = servers
        .filter(
            (server): server is OpenAPIServerWithCustomProperties & { url: string } => !!server.url
        )
        .map((server) => {
            const url = interpolateServerURL(server);
            return {
                key: url,
                label: url,
                description: server.description,
            };
        });

    // The store outlives client-side navigation: one key per server list keeps another spec's choice out.
    const stateKey = createStateKey('servers', items.map((item) => item.key).join(' '));
    const { key, setKey } = useSelectState(stateKey, defaultServer);

    return (
        <OpenAPIPathItem
            copyType="button"
            {...props}
            value={`${withServer ? key : ''}${path}`}
            context={context}
        >
            {withServer ? (
                <OpenAPISelect
                    className="openapi-select openapi-select-unstyled"
                    items={items}
                    itemClassName="openapi-select-item-column"
                    stateKey={stateKey}
                    placement="bottom start"
                    icon={context.icons.chevronDown}
                    defaultValue={defaultServer}
                    onChange={setKey}
                    tooltip="Click to select a server"
                >
                    {(item) => (
                        <>
                            <span slot="label">{item.label}</span>
                            {item.description ? (
                                <span slot="description">{item.description}</span>
                            ) : null}
                        </>
                    )}
                </OpenAPISelect>
            ) : null}
            {formattedPath}
        </OpenAPIPathItem>
    );
}
