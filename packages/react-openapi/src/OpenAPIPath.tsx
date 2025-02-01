import { OpenAPIOperationData } from './fetchOpenAPIOperation';

export function OpenAPIPath(props: { data: OpenAPIOperationData }): JSX.Element {
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

    return <></>;
}
