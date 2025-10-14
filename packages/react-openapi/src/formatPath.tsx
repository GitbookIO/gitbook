/**
 * Format the path by wrapping placeholders in <span> tags.
 */
export function formatPath(path: string) {
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
                {match.toLocaleLowerCase()}
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
            return <span key={`part-${index}`}>{part.toLocaleLowerCase()}</span>;
        }
        return part;
    });

    return formattedPath;
}
