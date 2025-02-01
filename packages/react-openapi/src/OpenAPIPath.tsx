import { OpenAPIOperationData } from './fetchOpenAPIOperation';
import { ScalarApiButton } from './ScalarApiButton';
import { OpenAPIContextProps } from './types';

export function OpenAPIPath(props: {
    data: OpenAPIOperationData;
    context: OpenAPIContextProps;
}): JSX.Element {
    const { data, context } = props;
    const { method, path } = data;
    const { specUrl } = context;

    const formatPath = (path: string) => {
        const regex = /\{(\w+)\}/g; // Matches placeholders like {tailnetId}, {userId}, etc.
        const parts: (string | JSX.Element)[] = [];
        let lastIndex = 0;

        path.replace(regex, (match, key, offset) => {
            parts.push(path.slice(lastIndex, offset)); // Push text before the placeholder
            parts.push(<em key={key}>{`{${key}}`}</em>); // Replace placeholder with <em> tag
            lastIndex = offset + match.length;
            return match;
        });

        parts.push(path.slice(lastIndex)); // Push remaining text after the last placeholder

        return <span>{parts}</span>;
    };

    return (
        <div className="openapi-path">
            <div className={`openapi-method openapi-method-${method}`}>{method}</div>
            <h1 className="openapi-path-title">{formatPath(path)}</h1>
            {data['x-hideTryItPanel'] || data.operation['x-hideTryItPanel'] ? null : (
                <div className="openapi-path-footer">
                    <ScalarApiButton method={method} path={path} specUrl={specUrl} />
                </div>
            )}
        </div>
    );
}
