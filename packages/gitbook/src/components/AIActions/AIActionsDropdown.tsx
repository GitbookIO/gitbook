'use client';
import { useAIChatController, useAIChatState } from '@/components/AI/useAIChat';
import AIChatIcon from '@/components/AIChat/AIChatIcon';
import { Button } from '@/components/primitives/Button';
import { DropdownMenu, DropdownMenuItem } from '@/components/primitives/DropdownMenu';
import { tString, useLanguage } from '@/intl/client';
import { Icon, type IconName, IconStyle } from '@gitbook/icons';
import { useEffect, useRef } from 'react';

type Action = {
    icon?: IconName | React.ReactNode;
    label: string;
    description?: string;
    /**
     * Whether the action is an external link.
     */
    isExternal?: boolean;
    onClick?: () => void;
};

export function AIActionsDropdown() {
    const chatController = useAIChatController();
    const chat = useAIChatState();
    const language = useLanguage();
    const ref = useRef<HTMLDivElement>(null);

    const handleOpenAIAssistant = () => {
        // Open the chat if it's not already open
        if (!chat.opened) {
            chatController.open();
        }

        // Send the "What is this page about?" message
        chatController.postMessage({
            message: tString(language, 'ai_chat_suggested_questions_about_this_page'),
        });
    };

    const handleCopyPage = async () => {
        const markdownUrl = `${window.location.href}.md`;

        // Get the page content
        const markdown = await fetch(markdownUrl).then((res) => res.text());

        // Copy the markdown to the clipboard
        navigator.clipboard.writeText(markdown);
    };

    const handleViewAsMarkdown = () => {
        // Open the page in Markdown format
        const currentUrl = window.location.href;
        const markdownUrl = `${currentUrl}.md`;
        window.open(markdownUrl, '_blank');
    };

    const actions: Action[] = [
        {
            icon: 'copy',
            label: 'Copy page',
            description: 'Copy the page content',
            onClick: handleCopyPage,
        },
        {
            icon: 'markdown',
            label: 'View as Markdown',
            description: 'Open a Markdown version of this page',
            isExternal: true,
            onClick: handleViewAsMarkdown,
        },
    ];

    // Get the header width with title and check if there is enough space to show the dropdown
    useEffect(() => {
        const getHeaderAvailableSpace = () => {
            const header = document.getElementById('page-header');
            const headerTitle = header?.getElementsByTagName('h1')[0];

            return (
                (header?.getBoundingClientRect().width ?? 0) -
                (headerTitle?.getBoundingClientRect().width ?? 0)
            );
        };

        const dropdownWidth = 202;

        window.addEventListener('resize', () => {
            const headerAvailableSpace = getHeaderAvailableSpace();
            if (ref.current) {
                if (headerAvailableSpace <= dropdownWidth) {
                    ref.current.classList.add('-mt-3');
                    ref.current.classList.remove('mt-3');
                } else {
                    ref.current.classList.remove('-mt-3');
                    ref.current.classList.add('mt-3');
                }
            }
        });

        window.addEventListener('load', () => {
            const headerAvailableSpace = getHeaderAvailableSpace();
            if (ref.current) {
                if (headerAvailableSpace <= dropdownWidth) {
                    ref.current.classList.add('-mt-3');
                    ref.current.classList.remove('mt-3');
                } else {
                    ref.current.classList.remove('-mt-3');
                    ref.current.classList.add('mt-3');
                }
            }
        });
    }, []);

    return (
        <div ref={ref} className="hidden items-stretch justify-start md:flex">
            <Button
                icon={<AIChatIcon className="size-3.5" />}
                size="small"
                variant="secondary"
                label="Ask Docs Assistant"
                className="hover:!scale-100 !shadow-none !rounded-r-none border-r-0 bg-tint-base text-sm"
                onClick={handleOpenAIAssistant}
            />
            <DropdownMenu
                contentProps={{
                    align: 'end',
                }}
                button={
                    <Button
                        icon="chevron-down"
                        iconOnly
                        size="small"
                        variant="secondary"
                        className="hover:!scale-100 !shadow-none !rounded-l-none bg-tint-base text-sm"
                    />
                }
            >
                {actions.map((action, index) => (
                    <DropdownMenuItem
                        onClick={action.onClick}
                        key={index}
                        className="flex items-stretch gap-2 p-1.5"
                    >
                        {action.icon ? (
                            <div className="mt-0.5 flex size-3.5 items-center">
                                {typeof action.icon === 'string' ? (
                                    <Icon
                                        icon={action.icon as IconName}
                                        iconStyle={IconStyle.Light}
                                        className="size-full"
                                    />
                                ) : (
                                    action.icon
                                )}
                            </div>
                        ) : null}
                        <div className="flex flex-1 flex-col">
                            <span className="flex items-center gap-1.5 text-tint-strong">
                                <span className="truncate font-medium">{action.label}</span>
                                {action.isExternal ? (
                                    <Icon icon="arrow-up-right" className="size-3" />
                                ) : null}
                            </span>
                            {action.description && (
                                <span className="truncate text-tint text-xs">
                                    {action.description}
                                </span>
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenu>
        </div>
    );
}
