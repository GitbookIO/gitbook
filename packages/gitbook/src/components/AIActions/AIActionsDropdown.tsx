'use client';

import { useAIChatController, useAIChatState } from '@/components/AI/useAIChat';
import AIChatIcon from '@/components/AIChat/AIChatIcon';
import { Button } from '@/components/primitives/Button';
import { DropdownMenu, DropdownMenuItem } from '@/components/primitives/DropdownMenu';
import { tString, useLanguage } from '@/intl/client';
import { Icon, type IconName, IconStyle } from '@gitbook/icons';
import { useRef } from 'react';

type AIAction = {
    icon?: IconName | React.ReactNode;
    label: string;
    description?: string;
    /**
     * Whether the action is an external link.
     */
    isExternal?: boolean;
    onClick?: () => void;
};

export function AIActionsDropdown(props: {
    markdown?: string;
    markdownPageUrl: string;
}) {
    const { markdown, markdownPageUrl } = props;

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

    const actions: AIAction[] = [
        {
            icon: <AIChatIcon />,
            label: 'Ask Docs Assistant',
            description: 'Ask our Docs Assistant about this page',
            onClick: handleOpenAIAssistant,
        },
        ...(markdown
            ? [
                  {
                      icon: 'copy',
                      label: 'Copy for LLMs',
                      description: 'Copy page as Markdown',
                      onClick: () => {
                          if (!markdown) return;
                          navigator.clipboard.writeText(markdown);
                      },
                  },
              ]
            : []),
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 471 289.85" className="size-5">
                    <title>markdown icon</title>
                    <path d="M437,289.85H34a34,34,0,0,1-34-34V34A34,34,0,0,1,34,0H437a34,34,0,0,1,34,34V255.88A34,34,0,0,1,437,289.85ZM34,22.64A11.34,11.34,0,0,0,22.64,34V255.88A11.34,11.34,0,0,0,34,267.2H437a11.34,11.34,0,0,0,11.33-11.32V34A11.34,11.34,0,0,0,437,22.64Z" />
                    <path d="M67.93,221.91v-154h45.29l45.29,56.61L203.8,67.93h45.29v154H203.8V133.6l-45.29,56.61L113.22,133.6v88.31Zm283.06,0-67.94-74.72h45.29V67.93h45.29v79.26h45.29Z" />
                </svg>
            ),
            label: 'View as Markdown',
            description: 'View this page as plain text',
            isExternal: true,
            onClick: () => {
                window.open(markdownPageUrl, '_blank');
            },
        },
    ];

    return (
        <div ref={ref} className="hidden h-fit items-stretch justify-start md:flex">
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
                                        iconStyle={IconStyle.Regular}
                                        className="size-full fill-transparent stroke-current"
                                    />
                                ) : (
                                    action.icon
                                )}
                            </div>
                        ) : null}
                        <div className="flex flex-1 flex-col gap-0.5">
                            <span className="flex items-center gap-2 text-tint-strong">
                                <span className="truncate font-medium text-[0.9375rem]">
                                    {action.label}
                                </span>
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
