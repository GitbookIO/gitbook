'use client';

import { Button, Input } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';
import * as React from 'react';
import { z } from 'zod';
import { AIToolContainer } from './common';
import { type GetAIControlProps, createAIControl } from './helpers';

const OTHER_OPTION_ID = '$other';

export const SingleChoiceControlOutputSchema = z.object({
    id: z.string().describe('The identifier of the option selected by the user.'),
    input: z
        .string()
        .optional()
        .describe('The custom text entered by the user when "Other" is enabled and selected.'),
});

export const SingleChoiceControlDef = createAIControl({
    name: 'single-choice',
    exposeAsTool: true,
    description:
        'Use this control when you need the user to choose exactly one option from a predefined list.',
    inputSchema: z.object({
        prompt: z
            .string()
            .describe(
                'Provide the question or instruction that tells the user what single choice they need to make.'
            ),
        options: z
            .array(
                z
                    .object({
                        id: z
                            .string()
                            .describe(
                                'Provide a unique, stable identifier for this option. This is the value returned to the agent when the user selects it.'
                            ),
                        label: z
                            .string()
                            .describe('Provide the short label the user sees for this option.'),
                        description: z
                            .string()
                            .optional()
                            .describe(
                                'Optionally provide supporting details to help the user understand this option.'
                            ),
                    })
                    .describe('Define one selectable option the user can pick.')
            )
            .describe(
                'Provide the list of options the user can choose from. The user must select exactly one.'
            ),
        allowOther: z
            .boolean()
            .optional()
            .describe(
                'Set to true to let the user select an "Other" option and enter a custom text response.'
            ),
    }),
    outputSchema: SingleChoiceControlOutputSchema,
    render: (props) => {
        return <SingleChoiceControl {...props} />;
    },
});

function SingleChoiceControl(props: GetAIControlProps<typeof SingleChoiceControlDef>) {
    const { prompt, options, allowOther, onSubmit } = props;
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [otherInput, setOtherInput] = React.useState('');

    const canSubmit =
        selectedId !== null &&
        (selectedId !== OTHER_OPTION_ID || (allowOther && otherInput.trim().length > 0));

    return (
        <AIToolContainer className="flex w-full flex-col gap-2">
            <div className="no-scrollbar flex flex-1 flex-col gap-1 overflow-auto">
                <p className="mb-1 font-semibold text-sm">{prompt}</p>
                {options.map((option) => {
                    const isSelected = selectedId === option.id;
                    return (
                        <button
                            key={option.id}
                            type="button"
                            data-testid={`ai-chat-tool-single-choice-option-${option.id}`}
                            onClick={() => {
                                setSelectedId(option.id);
                            }}
                            className={tcls(
                                'circular-corners:rounded-3xl rounded-corners:rounded-xl border px-3 py-2 text-left transition-colors',
                                isSelected
                                    ? 'border-primary-original bg-primary-subtle text-tint-strong'
                                    : 'border-tint bg-tint-base hover:bg-tint-subtle'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    aria-hidden
                                    className={tcls(
                                        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                                        isSelected
                                            ? 'border-primary-original'
                                            : 'border-tint-subtle'
                                    )}
                                >
                                    <span
                                        className={tcls(
                                            'size-2.5 rounded-full transition-colors',
                                            isSelected ? 'bg-primary-original' : 'bg-transparent'
                                        )}
                                    />
                                </span>
                                <span className="min-w-0">
                                    <p className="font-medium text-sm">{option.label}</p>
                                    {option.description ? (
                                        <p className="mt-0.5 text-sm text-tint-subtle">
                                            {option.description}
                                        </p>
                                    ) : null}
                                </span>
                            </div>
                        </button>
                    );
                })}

                {allowOther ? (
                    <button
                        type="button"
                        data-testid="ai-chat-tool-single-choice-option-other"
                        onClick={() => {
                            setSelectedId(OTHER_OPTION_ID);
                        }}
                        className={tcls(
                            'circular-corners:rounded-3xl rounded-corners:rounded-xl border px-3 py-2 text-left transition-colors',
                            selectedId === OTHER_OPTION_ID
                                ? 'border-primary-original bg-primary-subtle text-tint-strong'
                                : 'border-tint bg-tint-base hover:bg-tint-subtle'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <span
                                aria-hidden
                                className={tcls(
                                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                                    selectedId === OTHER_OPTION_ID
                                        ? 'border-primary-original'
                                        : 'border-tint-subtle'
                                )}
                            >
                                <span
                                    className={tcls(
                                        'size-2.5 rounded-full transition-colors',
                                        selectedId === OTHER_OPTION_ID
                                            ? 'bg-primary-original'
                                            : 'bg-transparent'
                                    )}
                                />
                            </span>
                            <div className="flex flex-1 flex-col gap-1">
                                <p className="font-medium text-sm">Other</p>
                                {allowOther && selectedId === OTHER_OPTION_ID ? (
                                    <Input
                                        label="Enter your answer"
                                        value={otherInput}
                                        onValueChange={setOtherInput}
                                        data-testid="ai-chat-tool-single-choice-other-input"
                                        autoFocus
                                        className="w-full"
                                        sizing="small"
                                    />
                                ) : null}
                            </div>
                        </div>
                    </button>
                ) : null}
            </div>

            <Button
                data-testid="ai-chat-tool-single-choice-submit"
                variant="primary"
                label="Submit answer"
                disabled={!canSubmit}
                onClick={() => {
                    if (!canSubmit || !selectedId) {
                        return;
                    }

                    if (selectedId === OTHER_OPTION_ID) {
                        onSubmit({
                            id: OTHER_OPTION_ID,
                            input: otherInput.trim(),
                        });
                        return;
                    }

                    onSubmit({ id: selectedId });
                }}
            />
        </AIToolContainer>
    );
}
