'use client';

import type {
    ContentKitAction,
    ContentKitRenderOutput,
    RequestRenderIntegrationUI,
} from '@gitbook/api';
import React from 'react';

import {
    ContentKitClientContext,
    ContentKitClientContextType,
    ContentKitRenderUpdate,
    ContentKitSecurity,
} from './context';
import { resolveDynamicBinding } from './dynamic';

type ContentKitLifecycleMode = ContentKitRenderOutput['element']['type'];

/**
 * Render a ContentKit component.
 * The approach is optimized to work well with server components and
 * allow rendering the components in the server with the lifecycle managed on the client side.
 */
export function ContentKit(props: {
    security: ContentKitSecurity;
    /** Initial input being displayed */
    initialInput: RequestRenderIntegrationUI;
    /** Initial output being displayed */
    initialOutput: ContentKitRenderOutput;
    /** Initial state to display */
    children?: React.ReactNode;
    /** Render a new state */
    render: (request: RequestRenderIntegrationUI) => Promise<{
        children: React.ReactNode;
        output: ContentKitRenderOutput;
    }>;
    /** Callback when an action is triggered */
    onAction?: (action: ContentKitAction) => void;
}) {
    const {
        security,
        initialInput,
        initialOutput,
        children: initialChildren,
        render,
        onAction,
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
        initialOutput: ContentKitRenderOutput;
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

            console.log('transition to input', newInput);
            const result = await render(newInput);

            console.log('and got output', result.output, 'for', newInput);

            setCurrent((prev) => ({
                input: newInput,
                children: result.children,
                output: result.output,
                state: prev.state,
            }));
        },
        [setCurrent, current, render],
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

                console.log('action', action);
                switch (action.action) {
                    case '@ui.modal.open': {
                        const modalInput: RequestRenderIntegrationUI = {
                            componentId: action.componentId,
                            props: action.props,
                            context: current.input.context,
                            action,
                        };

                        // Prefetch the modal content to show a loading in the button opening the button
                        const result = await render(modalInput);
                        setSubView({
                            mode: 'modal',
                            initialInput: modalInput,
                            initialOutput: result.output,
                            initialChildren: result.children,
                        });
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
