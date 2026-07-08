import { OpenAPICopyButton } from '../OpenAPICopyButton';
import { type OpenAPIContext, getOpenAPIClientContext } from '../context';
import { t, tString } from '../translate';

export function OpenAPIMcpBadge(props: { url?: string; context: OpenAPIContext }) {
    const { url, context } = props;

    const content = (
        <>
            {context.icons.mcp}
            {t(context.translation, 'available_in_mcp')}
        </>
    );

    if (!url) {
        return <div className="openapi-mcp">{content}</div>;
    }

    return (
        <OpenAPICopyButton
            value={url}
            context={getOpenAPIClientContext(context)}
            className="openapi-mcp"
            label={tString(context.translation, 'copy_url')}
        >
            {content}
        </OpenAPICopyButton>
    );
}
