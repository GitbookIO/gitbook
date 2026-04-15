'use client';

import { Button, Input } from '@/components/primitives';
import { ScrollContainer } from '@/components/primitives/ScrollContainer';
import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import * as React from 'react';
import { z } from 'zod';
import { AIToolContainer } from './common';
import { type GetAIControlProps, createAIControl } from './helpers';

const OTHER_OPTION_ID = '$other';

export const SingleChoiceControlOutputSchema = z.object({
    id: z.string().describe('The identifier of the option selected by the user.'),
    label: z.string().describe('The label of the option selected by the user.'),
    input: z
        .string()
        .optional()
        .describe('The custom text entered by the user when "Other" is enabled and selected.'),
});

export const SingleChoiceControlDef = createAIControl({
    name: 'single-choice',
    exposeAsTool: true,
    description:
        'Use this control whenever you need the user to choose exactly one option from a predefined list. Important: NEVER write an "Other" choice yourself to the `options` array, pass the `allowOther` property as `true` to add it automatically instead.',
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
                                'Optionally provide supporting details to help the user understand this option. Keep it concise and do not repeat the label.'
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

    const language = useLanguage();

    const canSubmit =
        selectedId !== null &&
        (selectedId !== OTHER_OPTION_ID || (allowOther && otherInput.trim().length > 0));

    return (
        <AIToolContainer className="flex w-full flex-col gap-2">
            <p className="px-2 pt-1 font-semibold text-sm">{prompt}</p>
            <ScrollContainer orientation="vertical" contentClassName="flex flex-col gap-2">
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
                                'text-left transition-colors',
                                'circular-corners:rounded-3xl rounded-corners:rounded-xl px-2 py-1 text-left transition-colors',
                                isSelected
                                    ? 'bg-primary text-tint-strong contrast-more:bg-primary-active'
                                    : 'hover:bg-tint contrast-more:hover:bg-tint-hover'
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    aria-hidden
                                    className={tcls(
                                        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border bg-tint-base transition-colors',
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
                                        <p className="mt-0.5 text-tint-subtle text-xs">
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
                        tabIndex={-1} // The input is already focusable, so prevent focus on the wrapper button
                        onClick={() => {
                            setSelectedId(OTHER_OPTION_ID);
                        }}
                    >
                        <Input
                            label={tString(language, 'form_other_prompt')}
                            value={otherInput}
                            onValueChange={setOtherInput}
                            data-testid="ai-chat-tool-single-choice-other-input"
                            placeholder={tString(
                                language,
                                selectedId === OTHER_OPTION_ID
                                    ? 'form_other_prompt'
                                    : 'form_other_field'
                            )}
                            className={tcls(
                                'grow gap-2 border-0 px-2 ring-inset **:placeholder:text-tint',
                                selectedId === OTHER_OPTION_ID
                                    ? 'bg-primary text-tint-strong hover:bg-primary contrast-more:bg-primary-active'
                                    : 'hover:not-focus-within:bg-tint contrast-more:hover:bg-tint-hover'
                            )}
                            sizing="small"
                            leading={
                                <span
                                    aria-hidden
                                    className={tcls(
                                        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border bg-tint-base transition-colors',
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
                            }
                        />
                    </button>
                ) : null}
            </ScrollContainer>

            <Button
                data-testid="ai-chat-tool-single-choice-submit"
                variant="primary"
                label={tString(language, 'submit')}
                disabled={!canSubmit}
                onClick={() => {
                    if (!canSubmit || !selectedId) {
                        return;
                    }

                    if (selectedId === OTHER_OPTION_ID) {
                        onSubmit({
                            id: OTHER_OPTION_ID,
                            label: 'Other',
                            input: otherInput.trim(),
                        });
                        return;
                    }

                    onSubmit({
                        id: selectedId,
                        label: options.find((option) => option.id === selectedId)?.label || '',
                    });
                }}
            />
        </AIToolContainer>
    );
}
