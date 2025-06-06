import { Icon } from '@gitbook/icons';
import React from 'react';

import { t, tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { Button, Link } from '../primitives';
import { useSearchLink } from './useSearch';

export const SearchQuestionResultItem = React.forwardRef(function SearchQuestionResultItem(
    props: {
        question: string;
        active: boolean;
        onClick: () => void;
        recommended?: boolean;
    },
    ref: React.Ref<HTMLAnchorElement>
) {
    const { question, recommended = false, active, onClick } = props;
    const language = useLanguage();
    const getLinkProp = useSearchLink();

    return (
        <Link
            ref={ref}
            onClick={onClick}
            data-testid="search-result-item"
            className={tcls(
                'flex',
                'px-4',
                'py-2',
                'text-tint',
                'rounded-lg',
                'straight-corners:rounded-none',
                'hover:bg-tint-hover',
                'gap-4',
                active && [
                    'is-active',
                    'bg-primary',
                    'text-primary-strong',
                    'hover:bg-primary-hover',
                ]
            )}
            {...getLinkProp({
                query: question,
            })}
        >
            <Icon
                icon={recommended ? 'search' : 'sparkles'}
                className={tcls(
                    'size-4',
                    'shrink-0',
                    'mt-1.5',
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
            <div className="self-center">
                {active ? (
                    <Button
                        icon="arrow-turn-down-left"
                        size="small"
                        label={tString(language, 'search')}
                    />
                ) : (
                    <Icon icon="chevron-right" className="size-4 text-tint-subtle/6" />
                )}
            </div>
        </Link>
    );
});
