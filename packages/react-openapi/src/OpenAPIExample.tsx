import yaml from 'js-yaml';

import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import type { OpenAPIContext, OpenAPIUniversalContext } from './context';
import { json2xml } from './json2xml';
import { stringifyOpenAPI } from './stringifyOpenAPI';
import { t } from './translate';

/**
 * Display an example.
 */
export function OpenAPIExample(props: {
    example: OpenAPIV3.ExampleObject;
    context: OpenAPIContext;
    syntax: string;
}) {
    const { example, context, syntax } = props;
    const code = stringifyExample({ example, syntax });

    if (code === null) {
        return <OpenAPIEmptyExample context={context} />;
    }

    return context.renderCodeBlock({ code, syntax });
}

function stringifyExample(args: { example: OpenAPIV3.ExampleObject; syntax: string }):
    | string
    | null {
    const { example, syntax } = args;

    if (!example.value) {
        return null;
    }

    if (typeof example.value === 'string') {
        return example.value;
    }

    if (syntax === 'xml') {
        return json2xml(example.value);
    }

    if (syntax === 'yaml') {
        return yaml.dump(example.value).replace(/'/g, '').replace(/\\n/g, '\n');
    }

    return stringifyOpenAPI(example.value, null, 2);
}

/**
 * Empty response example.
 */
export function OpenAPIEmptyExample(props: {
    context: OpenAPIUniversalContext;
}) {
    const { context } = props;
    return (
        <pre className="openapi-example-empty">
            <p>{t(context.translation, 'no_content')}</p>
        </pre>
    );
}
