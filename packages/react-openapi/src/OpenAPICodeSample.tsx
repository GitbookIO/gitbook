import * as React from 'react';

import { CodeSampleInput, codeSampleGenerators } from './code-samples';
import { OpenAPIOperationData, toJSON } from './fetchOpenAPIOperation';
import { generateMediaTypeExample, generateSchemaExample } from './generateSchemaExample';
import { InteractiveSection } from './InteractiveSection';
import { ScalarApiButton } from './ScalarApiButton';
import { OpenAPIContextProps } from './types';
import { getServersURL, noReference } from './utils';

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

    data.operation.parameters?.forEach((rawParam) => {
        const param = noReference(rawParam);
        if (!param) {
            return;
        }

        if (param.in === 'header' && param.required) {
            const example = param.schema
                ? generateSchemaExample(noReference(param.schema))
                : undefined;
            if (example !== undefined) {
                headersObject[param.name] =
                    typeof example !== 'string' ? JSON.stringify(example) : example;
            }
        } else if (param.in === 'query' && param.required) {
            const example = param.schema
                ? generateSchemaExample(noReference(param.schema))
                : undefined;
            if (example !== undefined) {
                searchParams.append(
                    param.name,
                    String(Array.isArray(example) ? example[0] : example),
                );
            }
        }
    });

    const serverUrl = context.serverUrl ?? getServersURL(data.servers);
    const requestBody = noReference(data.operation.requestBody);
    const requestBodyContent = requestBody ? Object.entries(requestBody.content)[0] : undefined;
    const input: CodeSampleInput = {
        url: serverUrl + data.path + (searchParams.size ? `?${searchParams.toString()}` : ''),
        method: data.method,
        body: requestBodyContent
            ? generateMediaTypeExample(requestBodyContent[1], { onlyRequired: true })
            : undefined,
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
        body: <context.CodeBlock code={generator.generate(input)} syntax={generator.syntax} />,
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
                .map((sample) => ({
                    key: `redocly-${sample.lang}`,
                    label: sample.label,
                    body: <context.CodeBlock code={sample.source} syntax={sample.lang} />,
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

    async function fetchOperationData() {
        'use server';
        return toJSON(data);
    }

    return (
        <InteractiveSection
            header="Request"
            className="openapi-codesample"
            tabs={samples}
            overlay={
                data['x-hideTryItPanel'] || data.operation['x-hideTryItPanel'] ? null : (
                    <ScalarApiButton fetchOperationData={fetchOperationData} />
                )
            }
        />
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
            if (scheme === 'bearer') {
                scheme = 'Bearer';
            }

            return {
                Authorization: scheme + ' ' + (security[1].bearerFormat ?? '<token>'),
            };
        }
        default: {
            return {};
        }
    }
}
