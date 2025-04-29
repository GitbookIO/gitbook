'use client';

import { SectionBody } from '../StaticSection';

import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { OpenAPIDisclosure } from '../OpenAPIDisclosure';
import { OpenAPIRootSchema } from '../OpenAPISchemaServer';
import { Section } from '../StaticSection';
import type { OpenAPIClientContext } from '../context';
import { getDisclosureLabel } from '../getDisclosureLabel';

export function OpenAPISchemaItem(props: {
    name: string;
    schema: OpenAPIV3.SchemaObject;
    context: OpenAPIClientContext;
}) {
    const { schema, context, name } = props;

    return (
        <OpenAPIDisclosure
            className="openapi-schemas-disclosure"
            key={name}
            icon={context.icons.plus}
            header={name}
            label={(isExpanded) => getDisclosureLabel({ schema, isExpanded, context })}
        >
            <Section className="openapi-section-schemas">
                <SectionBody>
                    <OpenAPIRootSchema schema={schema} context={context} />
                </SectionBody>
            </Section>
        </OpenAPIDisclosure>
    );
}
