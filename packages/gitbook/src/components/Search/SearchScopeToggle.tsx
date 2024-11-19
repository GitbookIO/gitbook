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
            className={tcls('flex', 'flex-row', 'mr-4')}
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
                'text-sm',
                'transition-colors',
                'px-3',
                'py-2',
                'border-b-2',
                'whitespace-pre',
                '-mb-[1px]',
                active ? ['text-primary-500', 'border-primary-500'] : ['border-transparent'],
            )}
        >
            {children}
        </button>
    );
}
