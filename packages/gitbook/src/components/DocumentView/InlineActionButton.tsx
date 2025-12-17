'use client';
import { tString, useLanguage } from '@/intl/client';
import { useAI, useAIChatController, useAIChatState } from '../AI';
import { useSearch } from '../Search';
import { Button, type ButtonProps, Input } from '../primitives';

export function InlineActionButton(
    props: { action: 'ask' | 'search'; query?: string } & { buttonProps: ButtonProps } // TODO: Type this properly: Pick<api.DocumentInlineButton, 'action' | 'query'> & { buttonProps: ButtonProps }
) {
    const { action, query, buttonProps } = props;

    const { assistants } = useAI();
    const chatController = useAIChatController();
    const chatState = useAIChatState();
    const [, setSearchState] = useSearch();
    const language = useLanguage();

    const handleSubmit = (value: string) => {
        if (action === 'ask') {
            chatController.open();
            if (value ?? query) {
                chatController.postMessage({ message: value ?? query });
            }
        } else if (action === 'search') {
            setSearchState((prev) => ({
                ...prev,
                ask: null,
                scope: 'default',
                query: value ?? query,
                open: true,
            }));
        }
    };

    const icon =
        action === 'ask' && buttonProps.icon === 'gitbook-assistant' && assistants.length > 0
            ? assistants[0]?.icon
            : buttonProps.icon;

    if (!query) {
        return (
            <Input
                inline
                label={buttonProps.label as string}
                sizing="medium"
                className="inline-flex max-w-full leading-normal [transition-property:translate,opacity,box-shadow,background,border]"
                submitButton={{
                    label: tString(language, action === 'ask' ? 'send' : 'search'),
                }}
                clearButton={{
                    className: 'text-[1em]',
                }}
                maxLength={action === 'ask' ? 2048 : 512}
                disabled={action === 'ask' && chatState.loading}
                aria-busy={action === 'ask' && chatState.loading}
                leading={icon}
                keyboardShortcut={false}
                onSubmit={(value) => handleSubmit(value as string)}
                containerStyle={{
                    width: `${buttonProps.label ? buttonProps.label.toString().length + 10 : 20}ch`,
                }}
            />
        );
    }

    const label = action === 'ask' ? `Ask "${query}"` : `Search for "${query}"`;

    const button = (
        <Button {...buttonProps} onClick={() => handleSubmit(query)} label={label}>
            {label !== buttonProps.label ? buttonProps.label : null}
        </Button>
    );

    return button;
}
