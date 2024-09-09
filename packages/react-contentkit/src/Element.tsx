import {
    ContentKitDescendantElement,
    ContentKitInlineElement,
    ContentKitRootElement,
} from '@gitbook/api';
import React from 'react';

import { ElementBlock } from './ElementBlock';
import { ElementWebframe } from './ElementWebframe';
import { ContentKitServerContext } from './types';
import { ElementCard } from './ElementCard';
import { ElementIcon } from './ElementIcon';
import { ElementCodeBlock } from './ElementCodeBlock';
import { ElementImage } from './ElementImage';
import { ElementStack } from './ElementStack';
import { ElementText } from './ElementText';
import { ElementButton } from './ElementButton';
import { ElementModal } from './ElementModal';
import { ElementBox } from './ElementBox';
import { ElementMarkdown } from './ElementMarkdown';
import { ElementTextInput } from './ElementTextInput';
import { ElementDivider } from './ElementDivider';

export function Element(props: {
    element: ContentKitDescendantElement | ContentKitRootElement | ContentKitInlineElement;
    context: ContentKitServerContext;
    state: object;
}) {
    const { element, context, state } = props;

    switch (element.type) {
        case 'text':
            return (
                <ElementText element={element} context={context} state={state}>
                    <Elements elements={element.children} context={context} state={state} />
                </ElementText>
            );
        case 'block':
            return (
                <ElementBlock element={element} context={context} state={state}>
                    <Elements elements={element.children} context={context} state={state} />
                </ElementBlock>
            );
        case 'box':
            return (
                <ElementBox element={element} context={context} state={state}>
                    <Elements elements={element.children} context={context} state={state} />
                </ElementBox>
            );
        case 'divider':
            return <ElementDivider element={element} context={context} state={state} />;
        case 'markdown':
            return <ElementMarkdown element={element} context={context} state={state} />;
        case 'modal': {
            const content = (
                <ElementModal
                    element={element}
                    subtitle={
                        element.subtitle ? (
                            <Elements
                                elements={ensureStackElements('hstack', element.subtitle, 'start')}
                                context={context}
                                state={state}
                            />
                        ) : null
                    }
                >
                    <Elements elements={element.children} context={context} state={state} />
                </ElementModal>
            );

            if (context.modalWrapper) {
                const ModalWrapper = context.modalWrapper;
                return <ModalWrapper>{content}</ModalWrapper>;
            }

            return content;
        }
        case 'image': {
            return <ElementImage element={element} context={context} state={state} />;
        }
        case 'button': {
            return (
                <ElementButton
                    element={element}
                    icon={
                        element.icon ? <ElementIcon icon={element.icon} context={context} /> : null
                    }
                    trailingIcon={
                        element.trailingIcon ? (
                            <ElementIcon icon={element.trailingIcon} context={context} />
                        ) : null
                    }
                />
            );
        }
        case 'textinput': {
            return <ElementTextInput element={element} />;
        }
        case 'input': {
            return <ElementTextInput element={element} state={state} />;
        }
        case 'hstack':
        case 'vstack':
            return (
                <ElementStack element={element} context={context} state={state}>
                    <Elements elements={element.children} context={context} state={state} />
                </ElementStack>
            );
        case 'card':
            return (
                <ElementCard
                    element={element}
                    icon={
                        element.icon ? (
                            typeof element.icon === 'string' ? (
                                <ElementIcon icon={element.icon} context={context} />
                            ) : (
                                <Element element={element.icon} context={context} state={state} />
                            )
                        ) : null
                    }
                    hint={
                        element.hint ? (
                            typeof element.hint === 'string' ? (
                                element.hint
                            ) : (
                                <Elements
                                    elements={ensureStackElements('hstack', element.hint, 'start')}
                                    context={context}
                                    state={state}
                                />
                            )
                        ) : null
                    }
                    buttons={
                        element.buttons
                            ? element.buttons.map((button, index) => (
                                  <Element
                                      key={index}
                                      element={button}
                                      context={context}
                                      state={state}
                                  />
                              ))
                            : []
                    }
                >
                    {element.children ? (
                        <Elements elements={element.children} context={context} state={state} />
                    ) : null}
                </ElementCard>
            );
        case 'codeblock':
            return <ElementCodeBlock element={element} context={context} state={state} />;
        case 'webframe':
            return <ElementWebframe element={element} />;
        default:
            return (
                <pre
                    style={{ display: process.env.NODE_ENV === 'development' ? 'block' : 'hidden' }}
                >
                    ContentKit element not implemented "{element.type}":{' '}
                    {JSON.stringify(element, null, 2)}
                </pre>
            );
    }
}

function Elements(props: {
    elements: string | Array<string | ContentKitDescendantElement>;
    context: ContentKitServerContext;
    state: object;
}) {
    const { context, state } = props;
    const elements = Array.isArray(props.elements) ? props.elements : [props.elements];

    return (
        <>
            {elements.map((element, index) => {
                if (typeof element === 'string') {
                    return <React.Fragment key={index}>{element}</React.Fragment>;
                }
                return <Element key={index} element={element} context={context} state={state} />;
            })}
        </>
    );
}

/**
 * Ensure a set of elements are going to be rendered as a stack (either hstack or vstack).
 * If the elements are already a stack, return them as is.
 */
function ensureStackElements(
    type: 'hstack' | 'vstack',
    elements: ContentKitDescendantElement[],
    align?: 'start' | 'center' | 'end',
): ContentKitDescendantElement[] {
    if (elements.length === 1) {
        return elements;
    }

    return [{ type, align, children: elements }];
}
