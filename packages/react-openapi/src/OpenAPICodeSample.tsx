import { OpenAPIV3 } from 'openapi-types';
import { InteractiveSection } from './InteractiveSection';
import { getServersURL } from './OpenAPIServerURL';
import { CodeSampleInput, codeSampleGenerators } from './code-samples';
import { OpenAPIOperationData } from './fetchOpenAPIOperation';
import { generateMediaTypeExample } from './generateSchemaExample';
import { OpenAPIContextProps } from './types';
import { noReference } from './utils';

interface RedoclyCodeSample {
    lang: string;
    label: string;
    source: string;
}

/**
 * Display code samples to execute the operation.
 * It supports the Redocly custom syntax as well (https://redocly.com/docs/api-reference-docs/specification-extensions/x-code-samples/)
 */
export function OpenAPICodeSample(props: {
    data: OpenAPIOperationData;
    context: OpenAPIContextProps;
}) {
    const { data, context } = props;

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
            ...(requestBodyContent
                ? {
                      'Content-Type': requestBodyContent[0],
                  }
                : undefined),
        },
    };

    const defaultSamples = codeSampleGenerators.map((generator) => ({
        key: `default-${generator.id}`,
        label: generator.label,
        body: <context.CodeBlock code={generator.generate(input)} syntax={generator.syntax} />,
    }));

    const redoclyOperation = data.operation as OpenAPIV3.OperationObject & {
        'x-code-samples'?: RedoclyCodeSample[];
        'x-codeSamples'?: RedoclyCodeSample[];
        'x-custom-examples'?: RedoclyCodeSample[];
    };

    const redoclySamples =
        (
            redoclyOperation['x-custom-examples'] ??
            redoclyOperation['x-codeSamples'] ??
            redoclyOperation['x-code-samples']
        )?.map((sample) => ({
            key: `redocly-${sample.lang}`,
            label: sample.label,
            body: <context.CodeBlock code={sample.source} syntax={sample.lang} />,
        })) ?? [];

    return (
        <InteractiveSection
            header="Request"
            className="openapi-codesample"
            tabs={[...redoclySamples, ...defaultSamples]}
        />
    );
}

function getSecurityHeaders(securities: OpenAPIV3.SecuritySchemeObject[]): {
    [key: string]: string;
} {
    const security = securities[0];
    switch (security?.type) {
        case 'http': {
            return {
                Authorization: security.scheme + ' ' + (security.bearerFormat ?? '<token>'),
            };
        }
        default: {
            return {};
        }
    }
}
