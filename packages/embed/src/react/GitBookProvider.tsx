'use client';

import * as React from 'react';
import { type CreateGitBookOptions, createGitBook } from '../client';
import { GitBookContext } from './context';

/**
 * Provider for the GitBook client.
 */
export function GitBookProvider(props: React.PropsWithChildren<CreateGitBookOptions>) {
    const { siteURL, children } = props;

    const options = React.useMemo(
        () => ({
            siteURL,
        }),
        [siteURL]
    );

    const client = React.useMemo(() => createGitBook(options), [options]);

    return <GitBookContext.Provider value={client}>{children}</GitBookContext.Provider>;
}

/**
 * Hook to access the GitBook client.
 */
export function useGitBook() {
    const context = React.useContext(GitBookContext);

    if (!context) {
        throw new Error('This component must be used within a <GitBookProvider />');
    }

    return context;
}
