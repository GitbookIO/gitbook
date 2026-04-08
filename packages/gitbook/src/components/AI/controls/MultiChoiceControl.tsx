'use client';

import { Button, Input } from '@/components/primitives';
import { ScrollContainer } from '@/components/primitives/ScrollContainer';
import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { Icon, IconStyle } from '@gitbook/icons';
import * as React from 'react';
import { z } from 'zod';
import { AIToolContainer } from './common';
import { type GetAIControlProps, createAIControl } from './helpers';

const OTHER_OPTION_ID = '$other';

export const MultiChoiceControlOutputSchema = z.object({
    ids: z.array(z.string()).describe('The identifiers of the options selected by the user.'),
    labels: z.array(z.string()).describe('The labels of the options selected by the user.'),
    input: z
        .string()
        .optional()
        .describe(
            'The custom text entered by the user when "Other" is enabled and selected among the choices.'
        ),
});

export const MultiChoiceControlDef = createAIControl({
    name: 'multi-choice',
    exposeAsTool: true,
    description:
        'Use this control whenever you need the user to choose one or more options from a predefined list. Never add an "Other" option to the `options` array, use the `allowOther` property instead.',
    inputSchema: z.object({
        prompt: z
            .string()
            .describe(
                'Provide the question or instruction that tells the user what choices they need to make.'
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
                'Provide the list of options the user can choose from. The user may select one or more.'
            ),
        allowOther: z
            .boolean()
            .optional()
            .describe(
                'Set to true to let the user select an "Other" option and enter a custom text response.'
            ),
    }),
    outputSchema: MultiChoiceControlOutputSchema,
    render: (props) => {
        return <MultiChoiceControl {...props} />;
    },
});

function MultiChoiceControl(props: GetAIControlProps<typeof MultiChoiceControlDef>) {
    const { prompt, options, allowOther, onSubmit } = props;
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    const [otherInput, setOtherInput] = React.useState('');
    const orderedOptionIds = [
        ...options.map((option) => option.id),
        ...(allowOther ? [OTHER_OPTION_ID] : []),
    ];

    const language = useLanguage();

    const toggleOption = (id: string) => {
        setSelectedIds((current) =>
            current.includes(id)
                ? current.filter((currentId) => currentId !== id)
                : orderedOptionIds.filter(
                      (optionId) => optionId === id || current.includes(optionId)
                  )
        );
    };

    const hasOtherSelected = selectedIds.includes(OTHER_OPTION_ID);
    const canSubmit = selectedIds.length > 0 && (!hasOtherSelected || otherInput.trim().length > 0);

    return (
        <AIToolContainer className="flex w-full flex-col gap-2">
            <ScrollContainer orientation="vertical" contentClassName="flex flex-col gap-2">
                <p className="px-2 pt-1 font-semibold text-sm">{prompt}</p>
                {options.map((option) => {
                    const isSelected = selectedIds.includes(option.id);
                    return (
                        <button
                            key={option.id}
                            type="button"
                            data-testid={`ai-chat-tool-multi-choice-option-${option.id}`}
                            onClick={() => {
                                toggleOption(option.id);
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
                                        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border bg-tint-base transition-colors',
                                        isSelected
                                            ? 'border-primary-original bg-primary-original text-contrast-primary-original'
                                            : 'border-tint-subtle'
                                    )}
                                >
                                    {isSelected ? (
                                        <Icon
                                            icon="check"
                                            iconStyle={IconStyle.Solid}
                                            className="size-3"
                                        />
                                    ) : null}
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
                        data-testid="ai-chat-tool-multi-choice-option-other"
                        tabIndex={-1}
                        onClick={() => {
                            toggleOption(OTHER_OPTION_ID);
                        }}
                    >
                        <Input
                            label={tString(language, 'form_other_prompt')}
                            value={otherInput}
                            onValueChange={setOtherInput}
                            data-testid="ai-chat-tool-multi-choice-other-input"
                            placeholder={tString(
                                language,
                                hasOtherSelected ? 'form_other_prompt' : 'form_other_field'
                            )}
                            className={tcls(
                                'grow gap-2 border-0 px-2 ring-inset **:placeholder:text-tint',
                                hasOtherSelected
                                    ? 'bg-primary text-tint-strong hover:bg-primary contrast-more:bg-primary-active'
                                    : 'hover:not-focus-within:bg-tint contrast-more:hover:bg-tint-hover'
                            )}
                            sizing="small"
                            onClick={(event) => {
                                event.stopPropagation();
                                if (!hasOtherSelected) {
                                    toggleOption(OTHER_OPTION_ID);
                                }
                            }}
                            leading={
                                <span
                                    aria-hidden
                                    className={tcls(
                                        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border bg-tint-base transition-colors',
                                        hasOtherSelected
                                            ? 'border-primary-original bg-primary-original text-contrast-primary-original'
                                            : 'border-tint-subtle'
                                    )}
                                >
                                    {hasOtherSelected ? (
                                        <Icon
                                            icon="check"
                                            iconStyle={IconStyle.Solid}
                                            className="size-3"
                                        />
                                    ) : null}
                                </span>
                            }
                        />
                    </button>
                ) : null}
            </ScrollContainer>

            <Button
                data-testid="ai-chat-tool-multi-choice-submit"
                variant="primary"
                label={tString(language, 'submit')}
                disabled={!canSubmit}
                onClick={() => {
                    if (!canSubmit) {
                        return;
                    }

                    onSubmit({
                        ids: selectedIds,
                        labels: selectedIds.map((id) =>
                            id === OTHER_OPTION_ID
                                ? 'Other'
                                : options.find((option) => option.id === id)?.label || ''
                        ),
                        input: hasOtherSelected ? otherInput.trim() : undefined,
                    });
                }}
            />
        </AIToolContainer>
    );
}
