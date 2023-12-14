import Link from 'next/link';
import React from 'react';

import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { useSearchLink } from './useSearch';

export const SearchQuestionResultItem = React.forwardRef(function SearchQuestionResultItem(
    props: {
        question: string;
        active: boolean;
        onClick: () => void;
        recommended?: boolean;
    },
    ref: React.Ref<HTMLAnchorElement>,
) {
    const { question, recommended = false, active, onClick } = props;
    const language = useLanguage();
    const getLinkProp = useSearchLink();

    return (
        <Link
            ref={ref}
            onClick={onClick}
            className={tcls(
                'flex',
                'flex-row',
                'rounded',
                'px-6',
                'py-3',
                'hover:bg-dark/1',
                'text-base',
                'text-dark',
                'font-semibold',
                'mt-6',
                'first:mt-0',
                active ? ['bg-primary-50'] : null,
            )}
            {...getLinkProp({
                ask: true,
                query: question,
            })}
        >
            {recommended ? question : t(language, 'search_ask', [question])}
        </Link>
    );
});
