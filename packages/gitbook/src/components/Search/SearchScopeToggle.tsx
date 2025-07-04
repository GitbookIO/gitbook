import { tString, useLanguage } from '@/intl/client';
import { Button } from '../primitives';
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
            className="mb-2 flex flex-row flex-wrap gap-1 circular-corners:rounded-3xl rounded-corners:rounded-lg bg-tint-subtle p-1"
        >
            <Button
                variant="blank"
                size="medium"
                className="shrink grow justify-center whitespace-normal"
                active={!state.global}
                label={tString(language, 'search_scope_space', spaceTitle)}
                onClick={() => {
                    setSearchState({
                        ...state,
                        global: false,
                    });
                }}
            />
            <Button
                variant="blank"
                size="medium"
                className="shrink grow justify-center whitespace-normal"
                active={state.global}
                label={tString(language, 'search_scope_all')}
                onClick={() => {
                    setSearchState({
                        ...state,
                        global: true,
                    });
                }}
            />
        </div>
    );
}
