import React from 'react';
import { OpenAPIClientContext, OpenAPIContextProps } from './types';
import { mergeProps, useButton, useDisclosure, useFocusRing } from 'react-aria';
import { useDisclosureState } from 'react-stately';

interface Props {
    context: OpenAPIClientContext;
    children: React.ReactNode;
    label?: string;
}

export function OpenAPIDisclosure({ context, children, label }: Props): JSX.Element {
    let state = useDisclosureState({});
    let panelRef = React.useRef<HTMLDivElement | null>(null);
    let triggerRef = React.useRef<HTMLButtonElement | null>(null);
    let { buttonProps: triggerProps, panelProps } = useDisclosure({}, state, panelRef);
    let { buttonProps } = useButton(triggerProps, triggerRef);
    let { isFocusVisible, focusProps } = useFocusRing();

    return (
        <div className="openapi-disclosure">
            <button
                ref={triggerRef}
                {...mergeProps(buttonProps, focusProps)}
                slot="trigger"
                className="openapi-disclosure-trigger"
                style={{
                    outline: isFocusVisible
                        ? '2px solid rgb(var(--primary-color-500) / 0.4)'
                        : 'none',
                }}
            >
                {context.icons.plus}
                <span>
                    {`${state.isExpanded ? 'Hide' : 'Show'} ${label ? label : `child attributes`}`}
                </span>
            </button>

            {state.isExpanded && (
                <div ref={panelRef} {...panelProps} className="openapi-disclosure-panel">
                    {children}
                </div>
            )}
        </div>
    );
}
