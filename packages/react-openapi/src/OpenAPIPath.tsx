import { OpenAPICopyButton } from './OpenAPICopyButton';
import type { OpenAPIOperationData } from './types';
import { getDefaultServerURL } from './util/server';

/**
 * Display the path of an operation.
 */
export function OpenAPIPath(props: {
    data: OpenAPIOperationData;
    /** Wether to show the server URL.
     * @default true
     */
    withServer?: boolean;
    /**
     * Wether the path is copyable.
     * @default true
     */
    canCopy?: boolean;
}) {
    const { data, withServer = true, canCopy = true } = props;
    const { method, path, operation } = data;

    const server = getDefaultServerURL(data.servers);
    const formattedPath = formatPath(path);

    const element = (() => {
        return (
            <>
                {withServer ? <span className="openapi-path-server">{server}</span> : null}
                {formattedPath}
            </>
        );
    })();

    return (
        <div className="openapi-path">
            <div className={`openapi-method openapi-method-${method}`}>{method}</div>

            <OpenAPICopyButton
                value={`${withServer ? server : ''}${path}`}
                className="openapi-path-title"
                data-deprecated={operation.deprecated}
                isDisabled={!canCopy}
            >
                {element}
            </OpenAPICopyButton>
        </div>
    );
}

/**
 * Format the path by wrapping placeholders in <span> tags.
 */
function formatPath(path: string) {
    // Matches placeholders like {id}, {userId}, etc.
    const regex = /\{\s*(\w+)\s*\}|:\w+/g;

    const parts: (string | React.JSX.Element)[] = [];
    let lastIndex = 0;

    //Wrap the variables in <span> tags and maintain either {variable} or :variable
    path.replace(regex, (match, _, offset) => {
        if (offset > lastIndex) {
            parts.push(path.slice(lastIndex, offset));
        }
        parts.push(
            <span key={`offset-${offset}`} className="openapi-path-variable">
                {match}
            </span>
        );
        lastIndex = offset + match.length;
        return match;
    });

    if (lastIndex < path.length) {
        parts.push(path.slice(lastIndex));
    }

    const formattedPath = parts.map((part, index) => {
        if (typeof part === 'string') {
            return <span key={`part-${index}`}>{part}</span>;
        }
        return part;
    });

    return formattedPath;
}
