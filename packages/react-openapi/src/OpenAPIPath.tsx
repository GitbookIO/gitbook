import { OpenAPIOperationData } from './fetchOpenAPIOperation';
import { ScalarApiButton } from './ScalarApiButton';
import { OpenAPIContextProps } from './types';

/**
 * Display the path of an operation.
 */
export function OpenAPIPath(props: {
    data: OpenAPIOperationData;
    context: OpenAPIContextProps;
}): JSX.Element {
    const { data, context } = props;
    const { method, path } = data;
    const { specUrl } = context;

    return (
        <div className="openapi-path">
            <div className={`openapi-method openapi-method-${method}`}>{method}</div>
            <div className="openapi-path-title" data-deprecated={data.operation.deprecated}>
                <p>{formatPath(path)}</p>
            </div>
            {data['x-hideTryItPanel'] || data.operation['x-hideTryItPanel'] ? null : (
                <ScalarApiButton method={method} path={path} specUrl={specUrl} />
            )}
        </div>
    );
}

// Format the path to highlight placeholders
function formatPath(path: string) {
    // Matches placeholders like {id}, {userId}, etc.
    const regex = /\{(\w+)\}/g;

    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    // Replace placeholders with <em> tags
    path.replace(regex, (match, key, offset) => {
        parts.push(path.slice(lastIndex, offset));
        parts.push(<em key={key}>{`{${key}}`}</em>);
        lastIndex = offset + match.length;
        return match;
    });

    // Push remaining text after the last placeholder
    parts.push(path.slice(lastIndex));

    // Join parts with separators wrapped in <span>
    const formattedPath = parts.reduce(
        (acc, part, index) => {
            if (typeof part === 'string' && index > 0 && part === '/') {
                return [
                    ...acc,
                    <span className="openapi-path-separator" key={`sep-${index}`}>
                        /
                    </span>,
                    part,
                ];
            }
            return [...acc, part];
        },
        [] as (string | JSX.Element)[],
    );

    return <span>{formattedPath}</span>;
}
