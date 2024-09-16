import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { useSearch } from './useSearch';

/**
 * Toolbar to toggle between search modes (global or scoped to a space).
 * Only visible when the space is in a collection.
 */
export function SearchScopeToggle(props: { spaceTitle: string }) {
    const { spaceTitle } = props;
    const [state, setSearchState] = useSearch();
    const language = useLanguage();

    if (!state) {
        return null;
    }

    return (
        <div
            role="toolbar"
            aria-orientation="horizontal"
            className={tcls(
                'overflow-x-auto',
                'hide-scroll',
                'flex',
                'flex-row',
                'py-3',
                'gap-0',
                'px-0',
                'pt-0',
                'sticky',
                'z-[0]',
                'w-[calc(100%-1px)]',
                'left-[1px]',
                'top-[0px]',
                'bg-gradient-to-b',
                'from-white',
                'to-transparent',
                'from-60%',
                'dark:from-dark-3',
                'shadow-[0_1px_0_0_inset]',
                'shadow-dark/2',
                'dark:shadow-light/2',
                'md:px-6',
                'md:gap-3',
            )}
        >
            <ToggleButton
                active={!state.global}
                onClick={() => {
                    setSearchState({
                        ...state,
                        global: false,
                    });
                }}
            >
                {t(language, 'search_scope_space', spaceTitle)}
            </ToggleButton>
            <ToggleButton
                active={state.global}
                onClick={() => {
                    setSearchState({
                        ...state,
                        global: true,
                    });
                }}
            >
                {t(language, 'search_scope_all')}
            </ToggleButton>
        </div>
    );
}

function ToggleButton(props: { onClick: () => void; children: React.ReactNode; active: boolean }) {
    const { onClick, children, active } = props;
    return (
        <button
            role="tab"
            type="button"
            aria-selected={active}
            onClick={onClick}
            className={tcls(
                'text-xs',
                'transition-colors',
                'duration-75',
                'px-2.5',
                'py-1.5',
                'border-t',
                'relative',
                'top-[0px]',
                'z-[1]',
                'border-dark/2',
                'whitespace-pre',
                'hover:border-dark/6',
                'dark:hover:border-light/6',
                'md:px-1',
                active
                    ? [
                          'text-primary-400',
                          'border-primary-400',
                          'hover:border-primary-400',
                          'dark:hover:text-primary-400',
                          'dark:border-primary-400',
                          'dark:hover:border-primary-400',
                      ]
                    : null,
            )}
        >
            {children}
        </button>
    );
}
