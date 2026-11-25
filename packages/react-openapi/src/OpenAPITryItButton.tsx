'use client';

import { type ComponentType, useState } from 'react';
import { createPortal } from 'react-dom';

import type { OpenAPIClientContext } from './context';
import { useOpenAPIOperationContext } from './OpenAPIOperationContext';
import { t } from './translate';
import type { OpenAPITryItDialogProps } from './tryit/OpenAPITryItDialog';
import type { TryItOperation } from './tryit/types';
import type { OpenAPIOperationData } from './types';

let dialogPromise: Promise<ComponentType<OpenAPITryItDialogProps>> | null = null;

function loadDialog() {
    if (!dialogPromise) {
        dialogPromise = import('./tryit/OpenAPITryItDialog')
            .then((mod) => mod.OpenAPITryItDialog)
            .catch((error) => {
                dialogPromise = null;
                throw error;
            });
    }
    return dialogPromise;
}

/**
 * Button which opens the Try it panel for an operation.
 */
export function OpenAPITryItButton(props: {
    operation: TryItOperation;
    securities: OpenAPIOperationData['securities'];
    servers: OpenAPIOperationData['servers'];
    withProxy: boolean;
    context: OpenAPIClientContext;
}) {
    const { operation, securities, servers, withProxy, context } = props;
    const { onOpenClient } = useOpenAPIOperationContext();
    const [Dialog, setDialog] = useState<ComponentType<OpenAPITryItDialogProps> | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const open = () => {
        onOpenClient({ method: operation.method, path: operation.path });
        if (Dialog) {
            setIsOpen(true);
            return;
        }
        setIsLoading(true);
        loadDialog()
            .then((component) => {
                setDialog(() => component);
                setIsOpen(true);
            })
            .catch((error) => console.error('Unable to load the Try it panel', error))
            .finally(() => setIsLoading(false));
    };

    return (
        <div className="openapi-tryit-activate">
            <button
                type="button"
                className="openapi-tryit-button"
                aria-busy={isLoading}
                // Warm the chunk so the click usually opens instantly.
                onPointerEnter={() => void loadDialog().catch(() => {})}
                onFocus={() => void loadDialog().catch(() => {})}
                onClick={open}
            >
                {t(context.translation, 'test_it')}
                {isLoading ? (
                    <svg
                        className="openapi-tryit-button-spinner"
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeOpacity="0.3"
                            strokeWidth="3"
                        />
                        <path
                            d="M12 2a10 10 0 0 1 10 10"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                ) : (
                    <svg aria-hidden="true" viewBox="0 0 10 12" fill="currentColor">
                        <path
                            stroke="currentColor"
                            strokeWidth="1.5"
                            d="M1 10.05V1.43c0-.2.2-.31.37-.22l7.26 4.08c.17.1.17.33.01.43l-7.26 4.54a.25.25 0 0 1-.38-.21Z"
                        />
                    </svg>
                )}
            </button>

            {isOpen && Dialog
                ? createPortal(
                      <Dialog
                          operation={operation}
                          securities={securities}
                          servers={servers}
                          withProxy={withProxy}
                          context={context}
                          onClose={() => setIsOpen(false)}
                      />,
                      document.body
                  )
                : null}
        </div>
    );
}
