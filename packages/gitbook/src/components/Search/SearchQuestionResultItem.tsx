import React from 'react';

import { t, tString, useLanguage } from '@/intl/client';
import { Icon } from '@gitbook/icons';
import { useAIChatController } from '../AI';
import { AIChatIcon } from '../AIChat/';
import { SearchResultItem } from './SearchResultItem';
import { useSearch, useSearchLink } from './useSearch';

export const SearchQuestionResultItem = React.forwardRef(function SearchQuestionResultItem(
    props: {
        question: string;
        active: boolean;
        recommended?: boolean;
        withAIChat: boolean;
    },
    ref: React.Ref<HTMLAnchorElement>
) {
    const { question, recommended = false, active, withAIChat } = props;
    const language = useLanguage();
    const getLinkProp = useSearchLink();
    const chatController = useAIChatController();
    const [, setSearchState] = useSearch();

    return (
        <SearchResultItem
            size={recommended ? 'small' : 'medium'}
            action={tString(language, 'ask', '')}
            ref={ref}
            data-testid="search-result-item"
            scroll={false}
            {...(withAIChat
                ? { href: '#' }
                : getLinkProp({
                      ask: true,
                      open: true,
                      query: question,
                  }))}
            onClick={() => {
                if (withAIChat) {
                    // If AI Chat is enabled, hijack to open the chat and post the question
                    chatController.open();
                    chatController.postMessage({ message: question });
                    setSearchState(null); // Close the search modal
                }
            }}
            active={active}
            leadingIcon={
                recommended ? (
                    <Icon icon="search" className="size-4" />
                ) : withAIChat ? (
                    <AIChatIcon className="size-4" />
                ) : (
                    <Icon icon="sparkles" className="size-4" />
                )
            }
            className={recommended ? 'pr-1.5' : ''}
        >
            {recommended ? (
                question
            ) : (
                <>
                    <div className="font-semibold text-base text-tint-strong leading-tight">
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
