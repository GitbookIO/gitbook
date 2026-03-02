'use client';
import { useLanguage } from '@/intl/client';
import { t } from '@/intl/translate';
import { tcls } from '@/lib/tailwind';
import type { ComponentPropsWithRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import type { AIChatState } from '../AI';
import type { AIChatConfirmComponent, AIChatTextInputComponent } from '../AI/tools';
import { Button, Input } from '../primitives';
import { KeyboardShortcut } from '../primitives/KeyboardShortcut';

/**
 * Display buttons to confirm tool calls.
 */
export function AIUITools(props: { chat: AIChatState }) {
    const { chat } = props;

    return (
        <div className="flex w-full flex-wrap justify-end gap-2 empty:hidden">
            {chat.ui.map((uiComponent, index) => {
                switch (uiComponent.name) {
                    case 'confirm':
                        return (
                            <ConfirmTool
                                key={uiComponent.context.toolCallId}
                                index={index}
                                uiComponent={uiComponent}
                            />
                        );
                    case 'text-input':
                        return (
                            <TextInputTool
                                key={uiComponent.context.toolCallId}
                                index={index}
                                uiComponent={uiComponent}
                            />
                        );
                }
            })}
        </div>
    );
}

function TextInputTool(props: {
    index: number;
    uiComponent: AIChatTextInputComponent;
}) {
    const { index, uiComponent } = props;
    const { label } = uiComponent;
    const { placeholder, onSubmit } = uiComponent.props;
    return (
        <AIToolContainer index={index} className="flex w-full flex-col gap-1">
            <Input
                label={label}
                placeholder={placeholder}
                onSubmit={(value) => onSubmit({ text: value })}
            />
        </AIToolContainer>
    );
}

function ConfirmTool(props: {
    index: number;
    uiComponent: AIChatConfirmComponent;
}) {
    const { index, uiComponent } = props;
    const { label } = uiComponent;
    const { onConfirm, onCancel, icon } = uiComponent.props;
    const size = index === 0 ? 'medium' : 'small';
    const language = useLanguage();
    const isShortcutEnabled = index === 0;
    useHotkeys(
        'mod+enter',
        (e) => {
            e.preventDefault();
            onConfirm();
        },
        { enableOnFormTags: true, enabled: isShortcutEnabled },
        [onConfirm]
    );
    return (
        <AIToolContainer index={index} className="flex w-full flex-col gap-1">
            <div className="flex gap-1">
                <Button
                    data-testid="ai-chat-tool-confirm-accept"
                    onClick={() => {
                        onConfirm();
                    }}
                    tabIndex={index}
                    label={label}
                    className="flex-1"
                    size={size}
                    variant="primary"
                    icon={icon}
                />
                <Button
                    data-testid="ai-chat-tool-confirm-cancel"
                    onClick={() => {
                        onCancel();
                    }}
                    tabIndex={index}
                    size={size}
                    variant="secondary"
                    icon="xmark"
                    iconOnly
                />
            </div>
            {isShortcutEnabled && (
                <div
                    className="flex pointer-none:hidden w-full animate-fade-in-slow items-center justify-end gap-2 text-tint text-xs"
                    style={{ animationDelay: '1000ms' }}
                >
                    {t(
                        language,
                        'press_to_confirm',
                        <KeyboardShortcut keys={['mod', 'enter']} className="mx-0 text-tint" />
                    )}
                </div>
            )}
        </AIToolContainer>
    );
}

function AIToolContainer(props: ComponentPropsWithRef<'div'> & { index: number }) {
    const { index, ...rest } = props;
    return (
        <div
            {...rest}
            className={tcls('animate-present-slow', rest.className)}
            style={{ animationDelay: `${0.5 + index * 0.1}s`, ...rest.style }}
        />
    );
}
