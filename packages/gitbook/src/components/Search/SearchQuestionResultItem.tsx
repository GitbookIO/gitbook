import { Icon } from '@gitbook/icons';
import React from 'react';

import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { useSearchLink } from './useSearch';
import { Link } from '../primitives';

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
                'px-4',
                'py-2',
                'hover:bg-dark-4/2',
                'text-dark/7',
                'first:mt-0',
                'last:pb-3',
                'dark:text-light/8',
                'dark:hover:bg-light-4/2',
                active ? ['bg-dark/1', 'dark:bg-light/1'] : null,
            )}
            {...getLinkProp({
                ask: true,
                query: question,
            })}
        >
            <Icon
                icon="magnifying-glass"
                className={tcls(
                    'size-4',
                    'shrink-0',
                    'mt-0.5',
                    'mr-4',
                    'mt-1',
                    'text-dark/5',
                    'dark:text-light/5',
                )}
            />
            {recommended ? question : t(language, 'search_ask', [question])}
        </Link>
    );
});
