import { OpenAPICopyButton } from './OpenAPICopyButton';
import type { OpenAPIContextProps, OpenAPIOperationData } from './types';
import { getDefaultServerURL } from './util/server';

/**
 * Display the path of an operation.
 */
export function OpenAPIPath(props: {
    data: OpenAPIOperationData;
    context: OpenAPIContextProps;
}) {
    const { data } = props;
    const { method, path, operation } = data;

    const server = getDefaultServerURL(data.servers);
    const formattedPath = formatPath(path);

    return (
        <div className="openapi-path">
            <div className={`openapi-method openapi-method-${method}`}>{method}</div>

            <OpenAPICopyButton
                value={server + path}
                className="openapi-path-title"
                data-deprecated={operation.deprecated}
            >
                <span className="openapi-path-server">{server}</span>
                {formattedPath}
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
