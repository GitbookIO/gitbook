import { OpenAPICopyButton } from './OpenAPICopyButton';
import type { OpenAPIPathProps } from './OpenAPIPath';
import type { OpenAPIClientContext } from './context';

export function OpenAPIPathItem(
    props: OpenAPIPathProps & {
        value?: string;
        children: React.ReactNode;
        copyType?: 'button' | 'children';
        context: OpenAPIClientContext;
    }
) {
    const { value, canCopy = true, context, children, data, copyType = 'children' } = props;
    const { operation, method } = data;

    const title = <span className="openapi-path-title">{children}</span>;

    return (
        <div className="openapi-path">
            <div className={`openapi-method openapi-method-${method}`}>{method}</div>
            {canCopy && value ? (
                copyType === 'children' ? (
                    <OpenAPICopyButton
                        value={value}
                        data-deprecated={operation.deprecated}
                        isDisabled={!canCopy}
                        context={context}
                        className="openapi-path-copy-button"
                    >
                        {title}
                    </OpenAPICopyButton>
                ) : (
                    <>
                        {title}
                        <OpenAPICopyButton
                            value={value}
                            data-deprecated={operation.deprecated}
                            isDisabled={!canCopy}
                            context={context}
                            className="openapi-path-copy-button openapi-path-copy-button-icon"
                        >
                            {context.icons.copy}
                        </OpenAPICopyButton>
                    </>
                )
            ) : (
                title
            )}
        </div>
    );
}
