import type React from 'react';
import { useRef } from 'react';
import { mergeProps, useButton, useDisclosure, useFocusRing } from 'react-aria';
import { useDisclosureState } from 'react-stately';
import type { OpenAPIClientContext } from './types';

interface Props {
    context: OpenAPIClientContext;
    children: React.ReactNode;
    label?: string;
}

/**
 * Display an interactive OpenAPI disclosure.
 * The label is optional and defaults to "child attributes".
 */
export function OpenAPIDisclosure({ context, children, label }: Props): React.JSX.Element {
    const state = useDisclosureState({});
    const panelRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
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
                    {`${state.isExpanded ? 'Hide' : 'Show'} ${label ? label : 'child attributes'}`}
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
