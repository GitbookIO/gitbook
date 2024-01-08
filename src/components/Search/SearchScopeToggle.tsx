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
            aria-role="toolbar"
            aria-orientation="horizontal"
            className={tcls('flex', 'flex-row', 'gap-3', 'py-3', 'px-4', 'pt-0')}
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
            aria-selected={active}
            onClick={onClick}
            className={tcls(
                'text-xs',
                'text-slate-500',
                'px-2',
                'py-1',
                'rounded',
                'border',
                'border-slate-300',
                'hover:border-slate-400',
                active
                    ? [
                          'border-primary-400',
                          'text-primary-600',
                          'bg-primary-50',
                          'hover:border-primary-400',
                      ]
                    : null,
            )}
        >
            {children}
        </button>
    );
}
