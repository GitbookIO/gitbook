'use client';
import { tString, useLanguage } from '@/intl/client';
import { useAI, useAIChatController, useAIChatState } from '../AI';
import { useSearch } from '../Search';
import { Button, type ButtonProps, Input } from '../primitives';

export function InlineActionButton(
    props: { action: 'ask' | 'search'; query: string } & { buttonProps: ButtonProps } // TODO: Type this properly: Pick<api.DocumentInlineButton, 'action' | 'query'> & { buttonProps: ButtonProps }
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
        (buttonProps.icon ?? action === 'ask')
            ? assistants.length > 0
                ? assistants[0]?.icon
                : undefined
            : 'search';

    if (!query) {
        return (
            <Input
                tag="span"
                label={buttonProps.label as string}
                sizing="medium"
                className="inline-flex w-56 leading-normal"
                submitButton={{
                    label: tString(language, action === 'ask' ? 'send' : 'search'),
                }}
                clearButton
                disabled={action === 'ask' && chatState.loading}
                aria-busy={action === 'ask' && chatState.loading}
                leading={icon}
                keyboardShortcut={false}
                onSubmit={(value) => handleSubmit(value as string)}
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
