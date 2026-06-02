'use client';

import { Button } from '@/components/primitives';
import { tString, useLanguage } from '@/intl/client';
import { z } from 'zod';
import { AIToolContainer } from './common';
import { type GetAIControlProps, createAIControl } from './helpers';

export const ConfirmControlOutputSchema = z.object({
    result: z.enum(['confirmed', 'cancelled']),
});

export const ConfirmControlDef = createAIControl({
    name: 'confirm',
    exposeAsTool: false,
    description:
        'Display a confirmation prompt to the user (Confirm / Cancel) to approve or abort a pending action. Use this when an operation is irreversible, sensitive, or should only proceed with explicit user consent. Returns either a `confirmed` or `cancelled` result based on the user’s click.',
    inputSchema: z.object({
        icon: z
            .string()
            .optional()
            .describe('Icon to be shown in the confirm button (any Fontawesome icon name).'),
        label: z.string().describe('Label to be shown in the confirm button.'),
    }),
    outputSchema: ConfirmControlOutputSchema,
    render: (props) => {
        return <ConfirmControl {...props} />;
    },
});

function ConfirmControl(props: GetAIControlProps<typeof ConfirmControlDef>) {
    const { label, icon, onSubmit } = props;
    const language = useLanguage();
    return (
        <AIToolContainer className="flex w-full flex-col gap-2">
            <Button
                data-testid="ai-chat-tool-confirm-cancel"
                onClick={() => {
                    onSubmit({ result: 'cancelled' });
                }}
                truncate={false}
                variant="blank"
                icon="xmark"
                label={tString(language, 'cancel')}
            />
            <Button
                data-testid="ai-chat-tool-confirm-accept"
                onClick={() => {
                    onSubmit({ result: 'confirmed' });
                }}
                variant="primary"
                truncate={false}
                icon={icon}
                label={label}
            />
        </AIToolContainer>
    );
}
