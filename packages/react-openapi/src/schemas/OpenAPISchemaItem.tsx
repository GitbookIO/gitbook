'use client';

import { SectionBody } from '../StaticSection';

import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { OpenAPIDisclosure } from '../OpenAPIDisclosure';
import { OpenAPIRootSchema } from '../OpenAPISchemaServer';
import { Section } from '../StaticSection';
import type { OpenAPIClientContext } from '../context';
import { getDisclosureLabel } from '../getDisclosureLabel';
import { tString } from '../translate';

export function OpenAPISchemaItem(props: {
    id?: string;
    name: string;
    schema: OpenAPIV3.SchemaObject;
    context: OpenAPIClientContext;
}) {
    const { schema, context, name, id } = props;

    return (
        <OpenAPIDisclosure
            className="openapi-schemas-disclosure"
            key={name}
            id={id}
            icon={context.icons.plus}
            header={
                id ? (
                    <span id={id} className="openapi-schemas-model-title">
                        <span className="openapi-schemas-model-title-name">{name}</span>
                        <a
                            href={`#${id}`}
                            className="openapi-schemas-anchor-link"
                            aria-label={tString(context.translation, 'direct_link_to_model', name)}
                            // Keep the click from toggling the disclosure or scrolling; just set the URL.
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.history.pushState(null, '', `#${id}`);
                            }}
                        >
                            {context.icons.hashtag}
                        </a>
                    </span>
                ) : (
                    name
                )
            }
            label={(isExpanded) => getDisclosureLabel({ schema, isExpanded, context })}
            defaultExpanded={context.expandAllModelSections}
        >
            <Section className="openapi-section-schemas">
                <SectionBody>
                    <OpenAPIRootSchema schema={schema} context={context} />
                </SectionBody>
            </Section>
        </OpenAPIDisclosure>
    );
}
