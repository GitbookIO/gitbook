import { createContext, useContext, useMemo, useState } from 'react';

import type { SearchAskState } from './SearchAskAnswer';

type SearchAskContextValue = [
    askState: SearchAskState | null,
    setAskState: React.Dispatch<React.SetStateAction<SearchAskState | null>>,
];

const SearchAskContext = createContext<SearchAskContextValue | undefined>(undefined);

/**
 * Hook to manage the state of the search ask component.
 */
export function useSearchAskState(): SearchAskContextValue {
    const [state, setState] = useState<SearchAskState | null>(null);
    return useMemo(() => [state, setState], [state]);
}

/**
 * Provider for the search ask context.
 */
export function SearchAskProvider(props: {
    children: React.ReactNode;
    value: SearchAskContextValue;
}) {
    const { children, value } = props;
    return <SearchAskContext.Provider value={value}>{children}</SearchAskContext.Provider>;
}

export function useSearchAskContext() {
    const context = useContext(SearchAskContext);
    if (!context) {
        throw new Error('SearchAskContext is not available');
    }
    return context;
}
