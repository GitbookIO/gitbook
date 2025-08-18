'use client';
import { useLanguage } from '@/intl/client';
import { t } from '@/intl/translate';
import { useHotkeys } from 'react-hotkeys-hook';
import type { AIChatState } from '../AI';
import { Button } from '../primitives';
import { KeyboardShortcut } from '../primitives/KeyboardShortcut';

/**
 * Display buttons to confirm tool calls.
 */
export function AIChatToolConfirmations(props: {
    chat: AIChatState;
}) {
    const { chat } = props;

    const language = useLanguage();

    useHotkeys(
        'mod+enter',
        (e) => {
            e.preventDefault();
            chat.pendingTools[0]?.confirm();
        },
        {
            enableOnFormTags: true,
        },
        [chat.pendingTools]
    );

    return (
        <div
            className="flex w-full animate-present-slow flex-wrap justify-end gap-2"
            style={{ animationDelay: `${chat.pendingTools.length * 100}ms` }}
        >
            {chat.pendingTools.map((tool, index) => (
                <div className="flex w-full flex-col gap-1" key={index}>
                    <Button
                        onClick={() => {
                            tool.confirm();
                        }}
                        tabIndex={index}
                        label={tool.label}
                        className="w-full justify-center"
                        size={index === 0 ? 'default' : 'medium'}
                        variant={index === 0 ? 'primary' : 'secondary'}
                        icon={tool.icon}
                    />
                    {index === 0 && (
                        <div
                            className="flex pointer-none:hidden w-full animate-fade-in-slow items-center justify-end gap-2 text-tint-subtle text-xs"
                            style={{ animationDelay: '500ms' }}
                        >
                            {t(
                                language,
                                'press_to_confirm',
                                <KeyboardShortcut keys={['mod', 'enter']} className="mx-0" />
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
