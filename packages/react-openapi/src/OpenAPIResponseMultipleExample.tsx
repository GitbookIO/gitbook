import { OpenAPIV3 } from '@scalar/openapi-types';
import { OpenAPIContextProps } from './types';
import { OpenAPIResponseMultipleExampleClient } from './OpenAPIResponseMultipleExampleClient';

export function OpenAPIResponseMultipleExample(props: {
    examples: OpenAPIV3.ExampleObject[];
    context: OpenAPIContextProps;
}) {
    const { examples, context } = props;

    return (
        <OpenAPIResponseMultipleExampleClient examples={examples}>
            <context.CodeBlock
                syntax="json"
                code=""
                // code={
                //     typeof example?.value === 'string'
                //         ? example?.value
                //         : stringifyOpenAPI(example?.value, null, 2)
                // }
            />
            {/* )} */}
        </OpenAPIResponseMultipleExampleClient>
    );
}
