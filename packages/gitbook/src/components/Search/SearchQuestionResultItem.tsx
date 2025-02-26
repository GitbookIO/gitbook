import { Icon } from '@gitbook/icons';
import React from 'react';

import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { Link } from '../primitives';
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
            {...getLinkProp({
                ask: true,
                query: question,
            })}
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
