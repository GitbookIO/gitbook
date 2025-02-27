import { InteractiveSection } from './InteractiveSection';
import { OpenAPITabs, OpenAPITabsList, OpenAPITabsPanels } from './OpenAPITabs';
import { type CodeSampleInput, codeSampleGenerators } from './code-samples';
import { generateMediaTypeExample, generateSchemaExample } from './generateSchemaExample';
import { stringifyOpenAPI } from './stringifyOpenAPI';
import type { OpenAPIContextProps, OpenAPIOperationData } from './types';
import { getDefaultServerURL } from './util/server';
import { checkIsReference, createStateKey } from './utils';

/**
 * Display code samples to execute the operation.
 * It supports the Redocly custom syntax as well (https://redocly.com/docs/api-reference-docs/specification-extensions/x-code-samples/)
 */
export function OpenAPICodeSample(props: {
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
            const example = param.schema ? generateSchemaExample(param.schema) : undefined;
            if (example !== undefined && param.name) {
                headersObject[param.name] =
                    typeof example !== 'string' ? stringifyOpenAPI(example) : example;
            }
        } else if (param.in === 'query' && param.required) {
            const example = param.schema ? generateSchemaExample(param.schema) : undefined;
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
    const requestBodyContentEntries = requestBody?.content
        ? Object.entries(requestBody.content)
        : undefined;
    const requestBodyContent = requestBodyContentEntries?.[0];

    const input: CodeSampleInput = {
        url:
            getDefaultServerURL(data.servers) +
            data.path +
            (searchParams.size ? `?${searchParams.toString()}` : ''),
        method: data.method,
        body: requestBodyContent ? generateMediaTypeExample(requestBodyContent[1]) : undefined,
        headers: {
            ...getSecurityHeaders(data.securities),
            ...headersObject,
            ...(requestBodyContent
                ? {
                      'Content-Type': requestBodyContent[0],
                  }
                : undefined),
        },
    };

    const autoCodeSamples = codeSampleGenerators.map((generator) => ({
        key: `default-${generator.id}`,
        label: generator.label,
        body: context.renderCodeBlock({
            code: generator.generate(input),
            syntax: generator.syntax,
        }),
    }));

    // Use custom samples if defined
    let customCodeSamples: null | Array<{
        key: string;
        label: string;
        body: React.ReactNode;
    }> = null;
    (['x-custom-examples', 'x-code-samples', 'x-codeSamples'] as const).forEach((key) => {
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
                    key: `redocly-${sample.lang}-${index}`,
                    label: sample.label,
                    body: context.renderCodeBlock({
                        code: sample.source,
                        syntax: sample.lang,
                    }),
                }));
        }
    });

    // Code samples can be disabled at the top-level or at the operation level
    // If code samples are defined at the operation level, it will override the top-level setting
    const codeSamplesDisabled =
        data['x-codeSamples'] === false || data.operation['x-codeSamples'] === false;
    const samples = customCodeSamples ?? (!codeSamplesDisabled ? autoCodeSamples : []);

    if (samples.length === 0) {
        return null;
    }

    return (
        <OpenAPITabs stateKey={createStateKey('codesample')} items={samples}>
            <InteractiveSection header={<OpenAPITabsList />} className="openapi-codesample">
                <OpenAPITabsPanels />
            </InteractiveSection>
        </OpenAPITabs>
    );
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
