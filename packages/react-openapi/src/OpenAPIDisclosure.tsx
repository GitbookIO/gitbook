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
    const state = useDisclosureState({});
    const panelRef = React.useRef<HTMLDivElement | null>(null);
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    const { buttonProps: triggerProps, panelProps } = useDisclosure({}, state, panelRef);
    const { buttonProps } = useButton(triggerProps, triggerRef);
    const { isFocusVisible, focusProps } = useFocusRing();

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
