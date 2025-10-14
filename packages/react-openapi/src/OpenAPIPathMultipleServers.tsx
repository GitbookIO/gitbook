'use client';
import { Text } from 'react-aria-components';
import type { OpenAPIPathProps } from './OpenAPIPath';
import { OpenAPIPathItem } from './OpenAPIPathItem';
import { OpenAPISelect, OpenAPISelectItem, useSelectState } from './OpenAPISelect';
import { OpenAPITooltip } from './OpenAPITooltip';
import type { OpenAPIClientContext } from './context';
import { formatPath } from './formatPath';
import type { OpenAPIServerWithCustomProperties } from './types';
import { getDefaultServerURL } from './util/server';
import { createStateKey } from './utils';

export const serversStateKey = createStateKey('servers');

/**
 * Display the path of an operation.
 */
export function OpenAPIPathMultipleServers(
    props: OpenAPIPathProps & { context: OpenAPIClientContext }
) {
    const { data, withServer = true, context } = props;
    const { path, servers } = data;

    const defaultServer = getDefaultServerURL(servers);
    const { key, setKey } = useSelectState(serversStateKey, defaultServer);
    const formattedPath = formatPath(path);

    const items = servers
        .filter(
            (server): server is OpenAPIServerWithCustomProperties & { url: string } => !!server.url
        )
        .map((server) => ({
            key: server.url,
            label: server.url,
            description: server.description,
        }));

    return (
        <OpenAPIPathItem
            copyType="button"
            {...props}
            value={`${withServer ? key : ''}${path}`}
            context={context}
        >
            {withServer ? (
                <OpenAPITooltip>
                    <OpenAPISelect
                        className="openapi-select openapi-select-unstyled"
                        items={items}
                        stateKey={serversStateKey}
                        placement="bottom start"
                        icon={context.icons.chevronDown}
                        defaultValue={defaultServer}
                        onChange={setKey}
                    >
                        {items.map((item) => (
                            <OpenAPISelectItem
                                textValue={item.label}
                                key={item.key}
                                id={item.key}
                                value={item}
                                className="openapi-select-item-column"
                            >
                                <Text slot="label">{item.label}</Text>
                                <Text slot="description">{item.description}</Text>
                            </OpenAPISelectItem>
                        ))}
                    </OpenAPISelect>
                    <OpenAPITooltip.Content>Click to select a server</OpenAPITooltip.Content>
                </OpenAPITooltip>
            ) : null}
            {formattedPath}
        </OpenAPIPathItem>
    );
}
