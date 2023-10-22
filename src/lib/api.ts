import 'server-only';

import { headers } from 'next/headers';
import { GitBookAPI } from '@gitbook/api';

/**
 * Create an API client for the current request.
 */
export function api(): GitBookAPI {
    const headersList = headers();
    const apiToken = headersList.get('x-gitbook-token');

    const gitbook = new GitBookAPI({
        authToken: apiToken || process.env.GITBOOK_TOKEN,
        endpoint: process.env.GITBOOK_API_URL,
    });

    return gitbook;
}
