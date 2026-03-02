'use client';

import type {
    AIStreamResponseToolCallPending,
    AIToolCallResult,
    AIToolDefinition,
} from '@gitbook/api';
import type { GitBookIntegrationTool } from '@gitbook/browser-types';
import type { IconName } from '@gitbook/icons';
import { integrationsAssistantTools } from '../Integrations';

type AIUIToolContext = Pick<AIStreamResponseToolCallPending, 'toolCall' | 'toolCallId'>;

export type AIChatConfirmComponent = {
    name: 'confirm';
    context: AIUIToolContext;
    label: string;
    props: {
        icon?: IconName;
        onConfirm: () => Promise<void>;
        onCancel: () => Promise<void>;
    };
};

export type AIChatTextInputComponent = {
    name: 'text-input';
    context: AIUIToolContext;
    label: string;
    props: {
        placeholder: string;
        onSubmit: (data: { text: string }) => Promise<void>;
    };
};

export type AIChatUIComponent = AIChatConfirmComponent | AIChatTextInputComponent;

type AIUIToolDefinition<T> = AIToolDefinition & {
    createUI: (args: {
        context: AIUIToolContext;
        input: T;
        send: (result: Pick<AIToolCallResult, 'output' | 'summary'>) => Promise<void>;
    }) => AIChatUIComponent;
};

const TEXT_INPUT_TOOL: AIUIToolDefinition<{ label: string; placeholder: string }> = {
    name: 'ui--text-input',
    description:
        'Render a single-line text input in the chat UI to collect a short, user-provided string (e.g., a name, title, URL, or brief answer). Use this when you need the user to type something that cannot be reliably inferred. When the user submits, the tool returns the entered value as { text: string }.',
    inputSchema: {
        type: 'object',
        properties: {
            label: {
                type: 'string',
                description: 'Label identifying the information asked',
            },
            placeholder: {
                type: 'string',
                description: 'Placeholder displayed in the text input',
            },
        },
    },
    createUI: ({ context, input, send }) => ({
        name: 'text-input',
        context,
        label: input.label,
        props: {
            placeholder: input.placeholder,
            onSubmit: async ({ text }) => {
                await send({
                    output: { text },
                    summary: {
                        icon: 'check',
                        text: 'Submitted',
                    },
                });
            },
        },
    }),
};

const CONFIRM_TOOL: AIUIToolDefinition<{ label: string }> = {
    name: 'ui--confirm',
    description:
        'Display a confirmation prompt to the user (Confirm / Cancel) to approve or abort a pending action. Use this when an operation is irreversible, sensitive, or should only proceed with explicit user consent. Returns either a confirmation or cancellation result based on the user’s click.',
    inputSchema: {
        type: 'object',
        properties: {
            label: {
                type: 'string',
                description: 'Label to be shown in the confirm button',
            },
        },
    },
    createUI: ({ context, input, send }) => ({
        name: 'confirm',
        context,
        label: input.label,
        props: {
            label: input.label,
            onCancel: async () => {
                await send({
                    output: {
                        cancelled: 'User cancelled.',
                    },
                    summary: {
                        icon: 'xmark',
                        text: 'Canceled',
                    },
                });
            },
            onConfirm: async () => {
                await send({
                    output: {
                        cancelled: 'User confirmed.',
                    },
                    summary: {
                        icon: 'check',
                        text: 'Confirmed',
                    },
                });
            },
        },
    }),
};

export const UI_TOOLS = [TEXT_INPUT_TOOL, CONFIRM_TOOL];

export function getTools(): (GitBookIntegrationTool | AIUIToolDefinition<any>)[] {
    const integrationTools = integrationsAssistantTools.getState().tools;
    return [...UI_TOOLS, ...integrationTools];
}
