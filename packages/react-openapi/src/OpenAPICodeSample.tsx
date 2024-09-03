import * as React from 'react';

import { CodeSampleInput, codeSampleGenerators } from './code-samples';
import { OpenAPIOperationData } from './fetchOpenAPIOperation';
import { generateMediaTypeExample, generateSchemaExample } from './generateSchemaExample';
import { InteractiveSection } from './InteractiveSection';
import { getServersURL } from './OpenAPIServerURL';
import { ScalarApiButton } from './ScalarApiButton';
import { OpenAPIContextProps } from './types';
import { noReference } from './utils';

/**
 * Display code samples to execute the operation.
 * It supports the Redocly custom syntax as well (https://redocly.com/docs/api-reference-docs/specification-extensions/x-code-samples/)
 */
export function OpenAPICodeSample(props: {
    data: OpenAPIOperationData;
    context: OpenAPIContextProps;
}) {
    const { data, context } = props;

    const requiredHeaders = data.operation.parameters?.map(noReference).filter(param => param.in === 'header' && param.required);

    const headersObject: {[k: string]: string} = {}
    requiredHeaders?.forEach(header => {
        let example = header.schema && generateSchemaExample(noReference(header.schema));
        if (example) {
            headersObject[header.name] = typeof example !== 'string' ? JSON.stringify(example) : example
        }
    });

    const requestBody = noReference(data.operation.requestBody);
    const requestBodyContent = requestBody ? Object.entries(requestBody.content)[0] : undefined;

    const input: CodeSampleInput = {
        url: getServersURL(data.servers) + data.path,
        method: data.method,
        body: requestBodyContent
            ? generateMediaTypeExample(requestBodyContent[1], { onlyRequired: true })
            : undefined,
        headers: {
            ...getSecurityHeaders(data.securities),
            ...(headersObject),
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
            customCodeSamples = customSamples.map((sample) => ({
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

    return (
        <InteractiveSection
            header="Request"
            className="openapi-codesample"
            tabs={samples}
            overlay={
                data['x-hideTryItPanel'] || data.operation['x-hideTryItPanel'] ? null : (
                    <ScalarApiButton />
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
