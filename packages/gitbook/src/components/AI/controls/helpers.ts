import type {
    AIStreamResponseToolCallPending,
    AIToolCallResult,
    AIToolDefinition,
} from '@gitbook/api';
import z from 'zod';
import type { ZodObject } from 'zod';

type AIUIToolContext = Pick<AIStreamResponseToolCallPending, 'toolCall' | 'toolCallId'>;

type AIControlDefinition<
    Name extends string = any,
    Input extends Record<string, unknown> = any,
    Output extends Record<string, unknown> = any,
> = AIToolDefinition & {
    createControl: (args: {
        context: AIUIToolContext;
        input: Input;
        send: (result: Pick<AIToolCallResult, 'output' | 'summary'>) => Promise<void>;
    }) => AIControl<Name, Input, Output>;
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
    InputSchema extends ZodObject,
    OutputSchema extends ZodObject,
>(def: {
    name: Name;
    description: string;
    inputSchema: InputSchema;
    outputSchema: OutputSchema;
    render: (props: AIControlProps<z.infer<InputSchema>, z.infer<OutputSchema>>) => React.ReactNode;
}): AIControlDefinition<Name, z.infer<InputSchema>, z.infer<OutputSchema>> {
    return {
        name: `ui--${def.name}`,
        description: def.description,
        inputSchema: z.toJSONSchema(def.inputSchema) as AIToolDefinition['inputSchema'],
        createControl: ({ context, input, send }) => {
            const props: AIControlProps<z.infer<InputSchema>, z.infer<OutputSchema>> = {
                ...input,
                onSubmit: async (output) => {
                    await send({
                        output,
                        summary: {
                            icon: 'check',
                            text: 'Submitted',
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
    };
}
