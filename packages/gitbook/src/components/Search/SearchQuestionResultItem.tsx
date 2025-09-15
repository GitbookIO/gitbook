import React from 'react';

import type { Assistant } from '@/components/AI';
import { t, tString, useLanguage } from '@/intl/client';
import { SearchResultItem } from './SearchResultItem';
import { useSearchLink } from './useSearch';

export const SearchQuestionResultItem = React.forwardRef(function SearchQuestionResultItem(
    props: {
        question: string;
        active: boolean;
        recommended?: boolean;
        assistant: Assistant;
    },
    ref: React.Ref<HTMLAnchorElement>
) {
    const { question, recommended = false, active, assistant, ...rest } = props;
    const language = useLanguage();
    const getLinkProp = useSearchLink();

    return (
        <SearchResultItem
            size={recommended ? 'small' : 'medium'}
            action={tString(language, 'ask', '')}
            ref={ref}
            data-testid={recommended ? 'search-recommended-question' : 'search-ask-question'}
            scroll={false}
            {...getLinkProp(
                {
                    ask: question,
                    query: null,
                    open: assistant.mode === 'search',
                },
                () => {
                    assistant.open(question);
                }
            )}
            active={active}
            leadingIcon={recommended ? 'search' : assistant.icon}
            className={recommended ? 'pr-1.5' : ''}
            {...rest}
        >
            {recommended ? (
                question
            ) : (
                <>
                    <div className="font-semibold text-base text-tint-strong leading-tight">
                        {t(language, 'search_ask', [question])}
                    </div>
                    <div className="text-sm text-tint-subtle">
                        {t(language, 'search_ask_description', assistant.label)}
                    </div>
                </>
            )}
        </SearchResultItem>
    );
});
