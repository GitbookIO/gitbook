import { tString } from '@/intl/translate';
import type { TranslationLanguage } from '@/intl/translations/types';
import type {
    AIStreamResponseToolCallPending,
    AIToolCallResult,
    AIToolDefinition,
} from '@gitbook/api';
import type { ZodType, z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

type AIUIToolContext = Pick<AIStreamResponseToolCallPending, 'toolCall' | 'toolCallId'>;

type AIControlDefinition<
    Name extends string = any,
    Input extends Record<string, unknown> = any,
    Output extends Record<string, unknown> = any,
> = AIToolDefinition & {
    createControl: (args: {
        context: AIUIToolContext;
        input: Input;
        language: TranslationLanguage;
        send: (result: Pick<AIToolCallResult, 'output' | 'summary'>) => Promise<void>;
    }) => AIControl<Name, Input, Output>;
    exposeAsTool: boolean;
};

type AIControlProps<Input = Record<string, unknown>, Output = Record<string, unknown>> = Input & {
    onSubmit: (output: Output) => Promise<void>;
};

type AIControl<Name = string, Input = Record<string, unknown>, Output = Record<string, unknown>> = {
    props: AIControlProps<Input, Output>;
    name: Name;
    context: AIUIToolContext;
    render: () => React.ReactNode;
};

type AIControlFromDef<T extends AIControlDefinition> = ReturnType<T['createControl']>;

export type GetAIControlProps<T extends AIControlDefinition> = AIControlFromDef<T>['props'];

export function createAIControl<
    Name extends string,
    InputSchema extends ZodType<Record<string, unknown>>,
    OutputSchema extends ZodType<Record<string, unknown>>,
>(def: {
    name: Name;
    description: string;
    inputSchema: InputSchema;
    outputSchema: OutputSchema;
    render: (props: AIControlProps<z.infer<InputSchema>, z.infer<OutputSchema>>) => React.ReactNode;
    /**
     * Indicates if the control should be exposed as a tool or not.
     */
    exposeAsTool: boolean;
}): AIControlDefinition<Name, z.infer<InputSchema>, z.infer<OutputSchema>> {
    return {
        name: `ui--${def.name}`,
        description: def.description,
        inputSchema: zodToJsonSchema(def.inputSchema as any) as AIToolDefinition['inputSchema'],
        createControl: ({ context, input, language, send }) => {
            const props: AIControlProps<z.infer<InputSchema>, z.infer<OutputSchema>> = {
                ...input,
                onSubmit: async (output) => {
                    await send({
                        output,
                        summary: {
                            icon: 'comment-check',
                            text: tString(language, 'ai_control_submitted_answer'),
                        },
                    });
                },
            };
            return {
                props,
                name: def.name,
                context,
                render: () => def.render(props),
            };
        },
        exposeAsTool: def.exposeAsTool,
    };
}
