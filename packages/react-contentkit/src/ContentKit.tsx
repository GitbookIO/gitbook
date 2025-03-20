'use client';

import type {
    ContentKitAction,
    ContentKitRenderOutput,
    ContentKitRenderOutputElement,
    RequestRenderIntegrationUI,
} from '@gitbook/api';
import React from 'react';

import {
    ContentKitClientContext,
    type ContentKitClientContextType,
    type ContentKitRenderUpdate,
    type ContentKitSecurity,
} from './context';
import { resolveDynamicBinding } from './dynamic';

type ContentKitLifecycleMode = ContentKitRenderOutputElement['element']['type'];

/**
 * Render a ContentKit component.
 * The approach is optimized to work well with server components and
 * allow rendering the components in the server with the lifecycle managed on the client side.
 */
export function ContentKit<RenderContext>(props: {
    /** Context to be passed to the render function. This is designed to properly integration with using a server action as `render`. */
    renderContext: RenderContext;
    /** Security configuration */
    security: ContentKitSecurity;
    /** Initial input being displayed */
    initialInput: RequestRenderIntegrationUI;
    /** Initial output being displayed */
    initialOutput: ContentKitRenderOutputElement;
    /** Initial state to display */
    children?: React.ReactNode;
    /** Render a new state */
    render: (input: {
        renderContext: RenderContext;
        request: RequestRenderIntegrationUI;
    }) => Promise<{
        children: React.ReactNode;
        output: ContentKitRenderOutput;
    }>;
    /** Callback when an action is triggered */
    onAction?: (action: ContentKitAction) => void;
    /** Callback when the flow is completed */
    onComplete?: (returnValue: any) => void;
}) {
    const {
        renderContext,
        security,
        initialInput,
        initialOutput,
        children: initialChildren,
        render,
        onAction,
        onComplete,
    } = props;

    const [current, setCurrent] = React.useState({
        /** Current input being rendered */
        input: initialInput,
        /** React rendered elements for the input */
        children: initialChildren,
        /** Output of the rendering */
        output: initialOutput,
        /** Local state */
        state: initialOutput.state ?? {},
    });

    const [subView, setSubView] = React.useState<null | {
        mode: ContentKitLifecycleMode;
        initialInput: RequestRenderIntegrationUI;
        initialOutput: ContentKitRenderOutputElement;
        initialChildren: React.ReactNode;
    }>(null);

    const update = React.useCallback(
        async (update: ContentKitRenderUpdate) => {
            const newInput = {
                ...current.input,

                // Use the props from the output if output sent new props
                ...(current.output?.props ? { props: current.output.props } : {}),

                ...update,

                // Merge the state
                state: {
                    ...current.input.state,
                    ...current.state,
                    ...update.state,
                },
            };
            const result = await render({
                renderContext,
                request: newInput,
            });
            const output = result.output;

            if (output.type === 'complete') {
                return onComplete?.(output.returnValue);
            }

            setCurrent((prev) => ({
                input: newInput,
                children: result.children,
                output: output,
                state: prev.state,
            }));
        },
        [setCurrent, current, render, onComplete]
    );

    const renderer = React.useMemo<ContentKitClientContextType>(() => {
        return {
            security,
            state: current.state,
            setState: (newState) => {
                setCurrent((latest) => ({
                    ...latest,
                    state: {
                        ...latest.state,
                        ...newState,
                    },
                }));
            },
            update,
            dispatchAction: async (inputAction, bubble = true) => {
                const action = resolveDynamicBinding<ContentKitAction>(current.state, inputAction);

                if (bubble) {
                    onAction?.(action);
                }
                switch (action.action) {
                    case '@ui.modal.open': {
                        const modalInput: RequestRenderIntegrationUI = {
                            componentId: action.componentId,
                            props: action.props,
                            context: current.input.context,
                            action,
                        };

                        // Prefetch the modal content to show a loading in the button opening the button
                        const result = await render({
                            renderContext,
                            request: modalInput,
                        });

                        if (result.output.type === 'element' || !result.output.type) {
                            setSubView({
                                mode: 'modal',
                                initialInput: modalInput,
                                initialOutput: result.output,
                                initialChildren: result.children,
                            });
                        }
                        break;
                    }

                    case '@ui.url.open': {
                        window.open(action.url, '_blank');
                        break;
                    }

                    default: {
                        await update({
                            action,
                        });
                        break;
                    }
                }
            },
        };
    }, [update, security, current.state, current.input.context, setCurrent, render]);

    const onSubViewAction = React.useCallback(async (action: ContentKitAction) => {
        switch (action.action) {
            case '@ui.modal.close': {
                update({
                    action,
                });

                setSubView(null);
                break;
            }
        }
    }, []);

    return (
        <>
            <ContentKitClientContext.Provider value={renderer}>
                {current.children}
            </ContentKitClientContext.Provider>
            {subView ? (
                <ContentKit
                    renderContext={renderContext}
                    security={security}
                    initialInput={subView.initialInput}
                    initialOutput={subView.initialOutput}
                    render={render}
                    onAction={onSubViewAction}
                >
                    {subView.initialChildren}
                </ContentKit>
            ) : null}
        </>
    );
}
