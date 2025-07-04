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
                  {
                      icon: (
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 471 289.85"
                              className="size-5 fill-current text-current"
                          >
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
              ]
            : []),
        {
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 320"
                    className="mt-0.5 fill-current"
                >
                    <title>ChatGPT</title>
                    <path d="m297.06 130.97c7.26-21.79 4.76-45.66-6.85-65.48-17.46-30.4-52.56-46.04-86.84-38.68-15.25-17.18-37.16-26.95-60.13-26.81-35.04-.08-66.13 22.48-76.91 55.82-22.51 4.61-41.94 18.7-53.31 38.67-17.59 30.32-13.58 68.54 9.92 94.54-7.26 21.79-4.76 45.66 6.85 65.48 17.46 30.4 52.56 46.04 86.84 38.68 15.24 17.18 37.16 26.95 60.13 26.8 35.06.09 66.16-22.49 76.94-55.86 22.51-4.61 41.94-18.7 53.31-38.67 17.57-30.32 13.55-68.51-9.94-94.51zm-120.28 168.11c-14.03.02-27.62-4.89-38.39-13.88.49-.26 1.34-.73 1.89-1.07l63.72-36.8c3.26-1.85 5.26-5.32 5.24-9.07v-89.83l26.93 15.55c.29.14.48.42.52.74v74.39c-.04 33.08-26.83 59.9-59.91 59.97zm-128.84-55.03c-7.03-12.14-9.56-26.37-7.15-40.18.47.28 1.3.79 1.89 1.13l63.72 36.8c3.23 1.89 7.23 1.89 10.47 0l77.79-44.92v31.1c.02.32-.13.63-.38.83l-64.41 37.19c-28.69 16.52-65.33 6.7-81.92-21.95zm-16.77-139.09c7-12.16 18.05-21.46 31.21-26.29 0 .55-.03 1.52-.03 2.2v73.61c-.02 3.74 1.98 7.21 5.23 9.06l77.79 44.91-26.93 15.55c-.27.18-.61.21-.91.08l-64.42-37.22c-28.63-16.58-38.45-53.21-21.95-81.89zm221.26 51.49-77.79-44.92 26.93-15.54c.27-.18.61-.21.91-.08l64.42 37.19c28.68 16.57 38.51 53.26 21.94 81.94-7.01 12.14-18.05 21.44-31.2 26.28v-75.81c.03-3.74-1.96-7.2-5.2-9.06zm26.8-40.34c-.47-.29-1.3-.79-1.89-1.13l-63.72-36.8c-3.23-1.89-7.23-1.89-10.47 0l-77.79 44.92v-31.1c-.02-.32.13-.63.38-.83l64.41-37.16c28.69-16.55 65.37-6.7 81.91 22 6.99 12.12 9.52 26.31 7.15 40.1zm-168.51 55.43-26.94-15.55c-.29-.14-.48-.42-.52-.74v-74.39c.02-33.12 26.89-59.96 60.01-59.94 14.01 0 27.57 4.92 38.34 13.88-.49.26-1.33.73-1.89 1.07l-63.72 36.8c-3.26 1.85-5.26 5.31-5.24 9.06l-.04 89.79zm14.63-31.54 34.65-20.01 34.65 20v40.01l-34.65 20-34.65-20z" />
                </svg>
            ),
            label: 'Open in ChatGPT',
            description: 'Ask ChatGPT about this page',
            isExternal: true,
            onClick: () => {
                window.open(
                    `https://chatgpt.com/c/?prompt=${encodeURIComponent(markdown ?? '')}`,
                    '_blank'
                );
            },
        },
        {
            icon: (
                <svg
                    viewBox="0 0 256 257"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid"
                    className="mt-0.5"
                >
                    <title>Claude</title>
                    <g>
                        <path
                            d="M50.2278481,170.321013 L100.585316,142.063797 L101.427848,139.601013 L100.585316,138.24 L98.1225316,138.24 L89.6972152,137.721519 L60.921519,136.943797 L35.9696203,135.906835 L11.795443,134.610633 L5.70329114,133.31443 L0,125.796456 L0.583291139,122.037468 L5.70329114,118.602532 L13.0268354,119.250633 L29.2293671,120.352405 L53.5331646,122.037468 L71.161519,123.07443 L97.28,125.796456 L101.427848,125.796456 L102.011139,124.111392 L100.585316,123.07443 L99.4835443,122.037468 L74.3372152,104.992405 L47.116962,86.9751899 L32.8587342,76.6055696 L25.1463291,71.3559494 L21.2577215,66.4303797 L19.5726582,55.6718987 L26.5721519,47.9594937 L35.9696203,48.6075949 L38.3675949,49.2556962 L47.8946835,56.5792405 L68.2450633,72.3281013 L94.8172152,91.9007595 L98.7058228,95.1412658 L100.261266,94.0394937 L100.455696,93.2617722 L98.7058228,90.3453165 L84.2531646,64.2268354 L68.8283544,37.6546835 L61.958481,26.636962 L60.1437975,20.0263291 C59.4956962,17.3043038 59.0420253,15.0359494 59.0420253,12.2491139 L67.0136709,1.42582278 L71.4207595,-1.42108547e-14 L82.0496203,1.42582278 L86.521519,5.31443038 L93.1321519,20.4151899 L103.825823,44.2005063 L120.417215,76.5407595 L125.277975,86.1326582 L127.87038,95.0116456 L128.842532,97.7336709 L130.527595,97.7336709 L130.527595,96.1782278 L131.888608,77.9665823 L134.416203,55.6070886 L136.878987,26.8313924 L137.721519,18.7301266 L141.739747,9.00860759 L149.711392,3.75898734 L155.933165,6.74025316 L161.053165,14.0637975 L160.340253,18.7949367 L157.294177,38.5620253 L151.331646,69.5412658 L147.443038,90.2805063 L149.711392,90.2805063 L152.303797,87.6881013 L162.803038,73.7539241 L180.431392,51.718481 L188.208608,42.9691139 L197.282025,33.3124051 L203.114937,28.7108861 L214.132658,28.7108861 L222.233924,40.7655696 L218.604557,53.2091139 L207.262785,67.596962 L197.865316,79.7812658 L184.38481,97.9281013 L175.959494,112.44557 L176.737215,113.612152 L178.746329,113.417722 L209.207089,106.936709 L225.668861,103.955443 L245.306329,100.585316 L254.185316,104.733165 L255.157468,108.945823 L251.657722,117.56557 L230.659241,122.75038 L206.031392,127.675949 L169.348861,136.360506 L168.89519,136.684557 L169.413671,137.332658 L185.940253,138.888101 L193.004557,139.276962 L210.308861,139.276962 L242.519494,141.674937 L250.94481,147.248608 L256,154.053671 L255.157468,159.238481 L242.195443,165.849114 L224.696709,161.701266 L183.866329,151.979747 L169.867342,148.48 L167.923038,148.48 L167.923038,149.646582 L179.588861,161.053165 L200.976203,180.366582 L227.742785,205.253671 L229.103797,211.410633 L225.668861,216.271392 L222.039494,215.752911 L198.513418,198.059747 L189.44,190.088101 L168.89519,172.783797 L167.534177,172.783797 L167.534177,174.598481 L172.265316,181.533165 L197.282025,219.123038 L198.578228,230.659241 L196.763544,234.418228 L190.282532,236.686582 L183.153418,235.39038 L168.506329,214.84557 L153.40557,191.708354 L141.221266,170.969114 L139.730633,171.811646 L132.536709,249.259747 L129.166582,253.213165 L121.389367,256.19443 L114.908354,251.268861 L111.473418,243.297215 L114.908354,227.548354 L119.056203,207.003544 L122.426329,190.671392 L125.472405,170.385823 L127.287089,163.64557 L127.157468,163.191899 L125.666835,163.386329 L110.371646,184.38481 L87.1048101,215.817722 L68.6987342,235.52 L64.2916456,237.269873 L56.6440506,233.316456 L57.356962,226.252152 L61.6344304,219.96557 L87.1048101,187.560506 L102.46481,167.469367 L112.380759,155.868354 L112.315949,154.183291 L111.732658,154.183291 L44.0708861,198.124557 L32.0162025,199.68 L26.8313924,194.819241 L27.4794937,186.847595 L29.9422785,184.25519 L50.2926582,170.256203 L50.2278481,170.321013 Z"
                            fill="currentColor"
                        />
                    </g>
                </svg>
            ),
            label: 'Open in Claude',
            description: 'Ask Claude about this page',
            isExternal: true,
            onClick: () =>
                window.open(
                    `https://claude.ai/chat?prompt=${encodeURIComponent(markdown ?? '')}`,
                    '_blank'
                ),
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
                        className="flex items-stretch gap-2.5 p-2"
                    >
                        {action.icon ? (
                            <div className="mt-0.5 flex size-4 items-center text-tint">
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
                                <span className="truncate font-medium text-sm">{action.label}</span>
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
