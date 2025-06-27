import { Icon } from '@gitbook/icons';
import React from 'react';

import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { useAIChatController } from '../AI';
import { Link } from '../primitives';
import { useSearch, useSearchLink } from './useSearch';

export const SearchQuestionResultItem = React.forwardRef(function SearchQuestionResultItem(
    props: {
        question: string;
        active: boolean;
        onClick: () => void;
        recommended?: boolean;
        withAIChat: boolean;
    },
    ref: React.Ref<HTMLAnchorElement>
) {
    const { question, recommended = false, active, onClick, withAIChat } = props;
    const language = useLanguage();
    const getLinkProp = useSearchLink();
    const chatController = useAIChatController();
    const [, setSearchState] = useSearch();

    return (
        <Link
            ref={ref}
            onClick={() => {
                if (withAIChat) {
                    // If AI Chat is enabled, hijack to open the chat and post the question
                    chatController.open();
                    chatController.postMessage({ message: question });
                    setSearchState(null); // Close the search modal
                } else {
                    onClick();
                }
            }}
            data-testid="search-result-item"
            className={tcls(
                'flex',
                'px-4',
                recommended ? ['py-2', 'text-tint'] : 'py-4',
                'hover:bg-tint-hover',
                'first:mt-0',
                'last:pb-3',
                active && [
                    'is-active',
                    'bg-primary',
                    'text-contrast-primary',
                    'hover:bg-primary-hover',
                ]
            )}
            {...(withAIChat
                ? { href: '#' }
                : getLinkProp({
                      ask: true,
                      query: question,
                  }))}
        >
            <Icon
                icon={recommended ? 'search' : 'sparkles'}
                className={tcls(
                    'size-4',
                    'shrink-0',
                    'mt-1.5',
                    'mr-4',
                    active ? ['text-primary'] : ['text-tint-subtle']
                )}
            />
            <div className="w-full">
                {recommended ? (
                    question
                ) : (
                    <>
                        <div className="font-medium">{t(language, 'search_ask', [question])}</div>
                        <div className={tcls('text-sm', 'text-tint')}>
                            {t(language, 'search_ask_description')}
                        </div>
                    </>
                )}
            </div>
            <div
                className={tcls(
                    'p-2',
                    'rounded',
                    'self-center',
                    'straight-corners:rounded-none',
                    'circular-corners:rounded-full',
                    active ? ['bg-primary-solid', 'text-contrast-primary-solid'] : ['opacity-6']
                )}
            >
                <Icon
                    icon={active ? 'arrow-turn-down-left' : 'chevron-right'}
                    className={tcls('size-4')}
                />
            </div>
        </Link>
    );
});
