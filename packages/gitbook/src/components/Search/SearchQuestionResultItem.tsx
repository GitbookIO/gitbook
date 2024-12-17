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
                'px-4',
                recommended ? ['py-2', 'text-dark/7', 'dark:text-light/8'] : 'py-4',
                'hover:bg-dark/1',
                'dark:hover:bg-light/1',
                'first:mt-0',
                'last:pb-3',
                active && [
                    'is-active',
                    'bg-primary-50',
                    'text-contrast-primary-50',
                    'dark:bg-primary-800',
                    'dark:text-contrast-primary-800',
                    'hover:bg-primary-100/8',
                    'dark:hover:bg-primary-700/7',
                ],
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
                    active ? ['text-primary'] : ['text-dark/5', 'dark:text-light/5'],
                )}
            />
            <div className="w-full">
                {recommended ? (
                    question
                ) : (
                    <>
                        <div className="font-medium">{t(language, 'search_ask', [question])}</div>
                        <div className={tcls('text-sm', 'text-dark/8', 'dark:text-light/8')}>
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
                    active ? ['bg-primary', 'text-contrast-primary'] : ['opacity-6'],
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
