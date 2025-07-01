import React from 'react';

import { t, tString, useLanguage } from '@/intl/client';
import { Icon } from '@gitbook/icons';
import { useAIChatController } from '../AI';
import AIChatIcon from '../AIChat/AIChatIcon';
import { SearchResultItem } from './SearchResults';
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
        <SearchResultItem
            size={recommended ? 'small' : 'medium'}
            action={tString(language, 'ask', '')}
            ref={ref}
            {...(withAIChat
                ? { href: '#' }
                : getLinkProp({
                      ask: true,
                      query: question,
                  }))}
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
            active={active}
            leadingIcon={
                recommended ? (
                    <Icon icon="search" className="size-4" />
                ) : (
                    <AIChatIcon className="size-4" />
                )
            }
            className={recommended && active ? 'pr-1.5' : ''}
        >
            {recommended ? (
                question
            ) : (
                <>
                    <div className="font-medium text-base text-tint-strong">
                        {t(language, 'search_ask', [question])}
                    </div>
                    <div className="text-sm text-tint-subtle">
                        {t(language, 'search_ask_description')}
                    </div>
                </>
            )}
        </SearchResultItem>
    );
});
