import clsx from 'clsx';
import { OpenAPICodeSample } from './OpenAPICodeSample';
import { OpenAPIResponseExample } from './OpenAPIResponseExample';
import { OpenAPIColumnSpec } from './common/OpenAPIColumnSpec';
import { OpenAPISummary } from './common/OpenAPISummary';
import type { OpenAPIContext, OpenAPIOperationData } from './types';

/**
 * Display an interactive OpenAPI operation.
 */
export function OpenAPIOperation(props: {
    className?: string;
    data: OpenAPIOperationData;
    context: OpenAPIContext;
}) {
    const { className, data, context } = props;

    return (
        <div className={clsx('openapi-operation', className)}>
            <OpenAPISummary data={data} context={context} />
            <div className="openapi-columns">
                <OpenAPIColumnSpec data={data} context={context} />
                <div className="openapi-column-preview">
                    <div className="openapi-column-preview-body">
                        <OpenAPICodeSample {...props} />
                        <OpenAPIResponseExample {...props} />
                    </div>
                </div>
            </div>
        </div>
    );
}
