import React from 'react';

import type { Assistant } from '@/components/AI';
import { useCurrentContent } from '@/components/hooks';
import { tString, useLanguage } from '@/intl/client';
import { SearchResultItem } from './SearchResultItem';
import { addRecentSearchQuery } from './recent-queries';
import { useSearchLink } from './useSearch';

export const SearchQuestionResultItem = React.forwardRef(function SearchQuestionResultItem(
    props: {
        question: string;
        action: 'ask' | 'search';
        active: boolean;
        assistant: Assistant;
    },
    ref: React.Ref<HTMLAnchorElement>
) {
    const { question, action, active, assistant, ...rest } = props;
    const language = useLanguage();
    const { siteSpaceId } = useCurrentContent();
    const getLinkProp = useSearchLink();
    const shouldAsk = action === 'ask';

    return (
        <SearchResultItem
            size="small"
            action={tString(language, shouldAsk ? 'ask' : 'search')}
            ref={ref}
            data-testid="search-recommended-question"
            scroll={false}
            {...getLinkProp(
                shouldAsk
                    ? {
                          ask: question,
                          query: null,
                          open: assistant.mode === 'search',
                      }
                    : {
                          ask: null,
                          query: question,
                          open: true,
                      },
                shouldAsk
                    ? () => {
                          if (assistant.mode === 'search' && siteSpaceId) {
                              addRecentSearchQuery(siteSpaceId, question, 'ask');
                          }
                          assistant.open(question);
                      }
                    : undefined
            )}
            active={active}
            leadingIcon={shouldAsk ? assistant.icon : 'search'}
            {...rest}
        >
            {question}
        </SearchResultItem>
    );
});
