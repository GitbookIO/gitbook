import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import {
    OpenAPIMediaTypeExamplesBody,
    OpenAPIMediaTypeExamplesSelector,
} from './OpenAPICodeSampleInteractive';
import { OpenAPITabs, OpenAPITabsList, OpenAPITabsPanels } from './OpenAPITabs';
import { ScalarApiButton } from './ScalarApiButton';
import { StaticSection } from './StaticSection';
import { type CodeSampleGenerator, codeSampleGenerators } from './code-samples';
import { generateMediaTypeExamples, generateSchemaExample } from './generateSchemaExample';
import { stringifyOpenAPI } from './stringifyOpenAPI';
import type { OpenAPIContextProps, OpenAPIOperationData } from './types';
import { getDefaultServerURL } from './util/server';
import { checkIsReference, createStateKey } from './utils';

const CUSTOM_CODE_SAMPLES_KEYS = ['x-custom-examples', 'x-code-samples', 'x-codeSamples'] as const;

/**
 * Display code samples to execute the operation.
 * It supports the Redocly custom syntax as well (https://redocly.com/docs/api-reference-docs/specification-extensions/x-code-samples/)
 */
export function OpenAPICodeSample(props: {
    data: OpenAPIOperationData;
    context: OpenAPIContextProps;
}) {
    const { data } = props;

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
        <OpenAPITabs stateKey={createStateKey('codesample')} items={samples}>
            <StaticSection header={<OpenAPITabsList />} className="openapi-codesample">
                <OpenAPITabsPanels />
            </StaticSection>
        </OpenAPITabs>
    );
}

/**
 * Generate code samples for the operation.
 */
function generateCodeSamples(props: {
    data: OpenAPIOperationData;
    context: OpenAPIContextProps;
}) {
    const { data, context } = props;

    const searchParams = new URLSearchParams();
    const headersObject: { [k: string]: string } = {};

    data.operation.parameters?.forEach((param) => {
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
    context: OpenAPIContextProps;
}) {
    const { data, context, renderers } = props;
    const { method, path } = data;
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
                />
            ) : (
                <span />
            )}
            {!hideTryItPanel && <ScalarApiButton method={method} path={path} specUrl={specUrl} />}
        </div>
    );
}

/**
 * Get custom code samples for the operation.
 */
function getCustomCodeSamples(props: {
    data: OpenAPIOperationData;
    context: OpenAPIContextProps;
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
                    return (
                        typeof sample.label === 'string' &&
                        typeof sample.source === 'string' &&
                        typeof sample.lang === 'string'
                    );
                })
                .map((sample, index) => ({
                    key: `custom-sample-${sample.lang}-${index}`,
                    label: sample.label,
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
        default: {
            return {};
        }
    }
}

function validateHttpMethod(method: string): method is OpenAPIV3.HttpMethods {
    return ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'trace'].includes(method);
}
