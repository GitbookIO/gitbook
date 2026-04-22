import React from 'react';

import type { Assistant } from '@/components/AI';
import { tString, useLanguage } from '@/intl/client';
import { SearchResultItem } from './SearchResultItem';
import { useSearchLink } from './useSearch';

export const SearchQuestionResultItem = React.forwardRef(function SearchQuestionResultItem(
    props: {
        question: string;
        active: boolean;
        recommended?: boolean;
        assistant: Assistant;
        style?: React.CSSProperties;
    },
    ref: React.Ref<HTMLAnchorElement>
) {
    const { question, recommended = false, active, assistant, style, ...rest } = props;
    const language = useLanguage();
    const getLinkProp = useSearchLink();

    return (
        <SearchResultItem
            size="small"
            action={tString(language, 'ask', '')}
            ref={ref}
            data-testid="search-recommended-question"
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
            leadingIcon="search"
            {...rest}
        >
            {question}
        </SearchResultItem>
    );
});
