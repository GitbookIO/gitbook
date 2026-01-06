import { OpenAPIPathItem } from './OpenAPIPathItem';
import { OpenAPIPathMultipleServers } from './OpenAPIPathMultipleServers';
import { type OpenAPIUniversalContext, getOpenAPIClientContext } from './context';
import { formatPath } from './formatPath';
import type { OpenAPIOperationData } from './types';
import { getDefaultServerURL } from './util/server';

export type OpenAPIPathProps = {
    data: OpenAPIOperationData;
    /** Whether to show the server URL.
     * @default true
     */
    withServer?: boolean;
    /**
     * Whether the path is copyable.
     * @default true
     */
    canCopy?: boolean;
};

/**
 * Display the path of an operation.
 */
export function OpenAPIPath(props: OpenAPIPathProps & { context: OpenAPIUniversalContext }) {
    const { data, withServer = true, context } = props;
    const { path } = data;
    const clientContext = getOpenAPIClientContext(context);

    if (withServer && data.servers.length > 1) {
        return <OpenAPIPathMultipleServers {...props} context={clientContext} />;
    }

    const formattedPath = formatPath(path);
    const defaultServer = getDefaultServerURL(data.servers);

    return (
        <OpenAPIPathItem {...props} value={`${defaultServer}${path}`} context={clientContext}>
            {withServer ? <span className="openapi-path-server">{defaultServer}</span> : null}
            {formattedPath}
        </OpenAPIPathItem>
    );
}
