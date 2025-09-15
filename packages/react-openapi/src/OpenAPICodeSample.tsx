import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import {
    OpenAPIMediaTypeExamplesBody,
    OpenAPIMediaTypeExamplesSelector,
} from './OpenAPICodeSampleInteractive';
import { OpenAPICodeSampleBody } from './OpenAPICodeSampleSelector';
import { ScalarApiButton } from './ScalarApiButton';
import { type CodeSampleGenerator, codeSampleGenerators } from './code-samples';
import { type OpenAPIContext, getOpenAPIClientContext } from './context';
import { generateMediaTypeExamples, generateSchemaExample } from './generateSchemaExample';
import { stringifyOpenAPI } from './stringifyOpenAPI';
import type { OpenAPIOperationData } from './types';
import { getDefaultServerURL } from './util/server';
import { checkIsReference } from './utils';

const CUSTOM_CODE_SAMPLES_KEYS = ['x-custom-examples', 'x-code-samples', 'x-codeSamples'] as const;

/**
 * Display code samples to execute the operation.
 * It supports the Redocly custom syntax as well (https://redocly.com/docs/api-reference-docs/specification-extensions/x-code-samples/)
 */
export function OpenAPICodeSample(props: {
    data: OpenAPIOperationData;
    context: OpenAPIContext;
}) {
    const { data, context } = props;

    // If code samples are disabled at operation level, we don't display the code samples.
    if (data.operation['x-codeSamples'] === false) {
        return null;
    }

    const customCodeSamples = getCustomCodeSamples(props);

    // If code samples are disabled at the top-level and not custom code samples are defined,
    // we don't display the code samples.
    if (data['x-codeSamples'] === false && !customCodeSamples) {
        return null;
    }

    const samples = customCodeSamples ?? generateCodeSamples(props);

    if (samples.length === 0) {
        return null;
    }

    return (
        <OpenAPICodeSampleBody
            context={getOpenAPIClientContext(context)}
            data={data}
            items={samples}
            selectIcon={context.icons.chevronDown}
        />
    );
}

/**
 * Generate code samples for the operation.
 */
function generateCodeSamples(props: {
    data: OpenAPIOperationData;
    context: OpenAPIContext;
}) {
    const { data, context } = props;

    const searchParams = new URLSearchParams();
    const headersObject: { [k: string]: string } = {};

    // The parser can sometimes returns invalid parameters (an object instead of an array).
    // It should get fixed in scalar, but in the meantime we just ignore the parameters in that case.
    const params = Array.isArray(data.operation.parameters) ? data.operation.parameters : [];

    params.forEach((param) => {
        if (!param) {
            return;
        }

        if (param.in === 'header' && param.required) {
            const example = param.schema
                ? generateSchemaExample(param.schema, { mode: 'write' })
                : undefined;
            if (example !== undefined && param.name) {
                headersObject[param.name] =
                    typeof example !== 'string' ? stringifyOpenAPI(example) : example;
            }
        } else if (param.in === 'query' && param.required) {
            const example = param.schema
                ? generateSchemaExample(param.schema, { mode: 'write' })
                : undefined;
            if (example !== undefined && param.name) {
                searchParams.append(
                    param.name,
                    String(Array.isArray(example) ? example[0] : example)
                );
            }
        }
    });

    const requestBody = !checkIsReference(data.operation.requestBody)
        ? data.operation.requestBody
        : undefined;

    const url =
        getDefaultServerURL(data.servers) +
        data.path +
        (searchParams.size ? `?${searchParams.toString()}` : '');

    const genericHeaders = {
        ...getSecurityHeaders(data.securities),
        ...headersObject,
    };

    const mediaTypeRendererFactories = Object.entries(requestBody?.content ?? {}).map(
        ([mediaType, mediaTypeObject]) => {
            return (generator: CodeSampleGenerator) => {
                const mediaTypeHeaders = {
                    ...genericHeaders,
                    'Content-Type': mediaType,
                };
                return {
                    mediaType,
                    element: context.renderCodeBlock({
                        code: generator.generate({
                            url,
                            method: data.method,
                            body: undefined,
                            headers: mediaTypeHeaders,
                        }),
                        syntax: generator.syntax,
                    }),
                    examples: generateMediaTypeExamples(mediaTypeObject, {
                        mode: 'write',
                    }).map((example) => ({
                        example,
                        element: context.renderCodeBlock({
                            code: generator.generate({
                                url,
                                method: data.method,
                                body: example.value,
                                headers: mediaTypeHeaders,
                            }),
                            syntax: generator.syntax,
                        }),
                    })),
                } satisfies MediaTypeRenderer;
            };
        }
    );

    return codeSampleGenerators.map((generator) => {
        if (mediaTypeRendererFactories.length > 0) {
            const renderers = mediaTypeRendererFactories.map((generate) => generate(generator));
            return {
                key: `default-${generator.id}`,
                label: generator.label,
                body: (
                    <OpenAPIMediaTypeExamplesBody
                        method={data.method}
                        path={data.path}
                        renderers={renderers}
                        blockKey={context.blockKey}
                    />
                ),
                footer: (
                    <OpenAPICodeSampleFooter renderers={renderers} data={data} context={context} />
                ),
            };
        }
        return {
            key: `default-${generator.id}`,
            label: generator.label,
            body: context.renderCodeBlock({
                code: generator.generate({
                    url,
                    method: data.method,
                    body: undefined,
                    headers: genericHeaders,
                }),
                syntax: generator.syntax,
            }),
            footer: <OpenAPICodeSampleFooter data={data} renderers={[]} context={context} />,
        };
    });
}

export interface MediaTypeRenderer {
    mediaType: string;
    element: React.ReactNode;
    examples: Array<{
        example: OpenAPIV3.ExampleObject;
        element: React.ReactNode;
    }>;
}

function OpenAPICodeSampleFooter(props: {
    data: OpenAPIOperationData;
    renderers: MediaTypeRenderer[];
    context: OpenAPIContext;
}) {
    const { data, context, renderers } = props;
    const { method, path, securities, servers } = data;
    const { specUrl } = context;
    const hideTryItPanel = data['x-hideTryItPanel'] || data.operation['x-hideTryItPanel'];
    const hasMultipleMediaTypes =
        renderers.length > 1 || renderers.some((renderer) => renderer.examples.length > 0);

    if (hideTryItPanel && !hasMultipleMediaTypes) {
        return null;
    }

    if (!validateHttpMethod(method)) {
        return null;
    }

    return (
        <div className="openapi-codesample-footer">
            {hasMultipleMediaTypes ? (
                <OpenAPIMediaTypeExamplesSelector
                    method={data.method}
                    path={data.path}
                    renderers={renderers}
                    selectIcon={context.icons.chevronDown}
                    blockKey={context.blockKey}
                />
            ) : (
                <span />
            )}
            {!hideTryItPanel && (
                <ScalarApiButton
                    context={getOpenAPIClientContext(context)}
                    method={method}
                    path={path}
                    securities={securities}
                    servers={servers}
                    specUrl={specUrl}
                />
            )}
        </div>
    );
}

/**
 * Get custom code samples for the operation.
 */
function getCustomCodeSamples(props: {
    data: OpenAPIOperationData;
    context: OpenAPIContext;
}) {
    const { data, context } = props;

    let customCodeSamples: null | Array<{
        key: string;
        label: string;
        body: React.ReactNode;
    }> = null;

    CUSTOM_CODE_SAMPLES_KEYS.forEach((key) => {
        const customSamples = data.operation[key];
        if (customSamples && Array.isArray(customSamples)) {
            customCodeSamples = customSamples
                .filter((sample) => {
                    return typeof sample.source === 'string' && typeof sample.lang === 'string';
                })
                .map((sample, index) => ({
                    key: `custom-sample-${sample.lang}-${index}`,
                    label: sample.label || sample.lang,
                    body: context.renderCodeBlock({
                        code: sample.source,
                        syntax: sample.lang,
                    }),
                    footer: (
                        <OpenAPICodeSampleFooter renderers={[]} data={data} context={context} />
                    ),
                }));
        }
    });

    return customCodeSamples;
}

function getSecurityHeaders(securities: OpenAPIOperationData['securities']): {
    [key: string]: string;
} {
    const security = securities[0];

    if (!security) {
        return {};
    }

    switch (security[1].type) {
        case 'http': {
            let scheme = security[1].scheme;
            let format = security[1].bearerFormat ?? 'YOUR_SECRET_TOKEN';

            if (scheme?.includes('bearer')) {
                scheme = 'Bearer';
            } else if (scheme?.includes('basic')) {
                scheme = 'Basic';
                format = 'username:password';
            } else if (scheme?.includes('token')) {
                scheme = 'Token';
            }

            return {
                Authorization: `${scheme} ${format}`,
            };
        }
        case 'apiKey': {
            if (security[1].in !== 'header') return {};

            const name = security[1].name ?? 'Authorization';

            return {
                [name]: 'YOUR_API_KEY',
            };
        }
        case 'oauth2': {
            return {
                Authorization: 'Bearer YOUR_OAUTH2_TOKEN',
            };
        }
        default: {
            return {};
        }
    }
}

function validateHttpMethod(method: string): method is OpenAPIV3.HttpMethods {
    return ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'trace'].includes(method);
}
