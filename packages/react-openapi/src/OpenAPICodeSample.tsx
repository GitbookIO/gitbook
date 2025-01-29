import * as React from 'react';

import { CodeSampleInput, codeSampleGenerators } from './code-samples';
import { OpenAPIOperationData } from './fetchOpenAPIOperation';
import { generateMediaTypeExample, generateSchemaExample } from './generateSchemaExample';
import { InteractiveSection } from './InteractiveSection';
import { getServersURL, OpenAPIServerURL } from './OpenAPIServerURL';
import { ScalarApiButton } from './ScalarApiButton';
import { OpenAPIContextProps } from './types';
import { noReference } from './utils';
import { stringifyOpenAPI } from './stringifyOpenAPI';

/**
 * Display code samples to execute the operation.
 * It supports the Redocly custom syntax as well (https://redocly.com/docs/api-reference-docs/specification-extensions/x-code-samples/)
 */
export function OpenAPICodeSample(props: {
    data: OpenAPIOperationData;
    context: OpenAPIContextProps;
}) {
    const { data, context } = props;
    const { method, path } = data;

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
            if (example !== undefined && param.name) {
                headersObject[param.name] =
                    typeof example !== 'string' ? stringifyOpenAPI(example) : example;
            }
        } else if (param.in === 'query' && param.required) {
            const example = param.schema
                ? generateSchemaExample(noReference(param.schema))
                : undefined;
            if (example !== undefined && param.name) {
                searchParams.append(
                    param.name,
                    String(Array.isArray(example) ? example[0] : example),
                );
            }
        }
    });

    const requestBody = noReference(data.operation.requestBody);
    const requestBodyContentEntries = requestBody?.content
        ? Object.entries(requestBody.content)
        : undefined;
    const requestBodyContent = requestBodyContentEntries?.[0];

    const input: CodeSampleInput = {
        url:
            getServersURL(data.servers) +
            data.path +
            (searchParams.size ? `?${searchParams.toString()}` : ''),
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
        <InteractiveSection
            className="openapi-codesample"
            tabs={samples}
            overlay={
                data['x-hideTryItPanel'] || data.operation['x-hideTryItPanel'] ? null : (
                    <ScalarApiButton
                        method={data.method}
                        path={data.path}
                        specUrl={context.specUrl}
                    />
                )
            }
            header={
                <>
                    <span className={`openapi-method openapi-method-${method}`}>{method}</span>
                    <span className="openapi-codesample-title">{formatPath(path)}</span>
                </>
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
