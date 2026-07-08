'use client';

import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import type { AIToolDefinition } from '@gitbook/api';
import type { GitBookIntegrationTool } from '@gitbook/browser-types';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { NavigationStatusContext } from '../hooks';
import { normalizePathname, resolveNavigationTarget } from './navigation';
import { resolveAINavigationLink } from './server-actions';

const NavigateToPageInputSchema = z.object({
    url: z
        .string()
        .describe(
            'The URL of the documentation page to open. Must be a page within this documentation site (the same URL you would use to link to the page). Can include a section anchor (e.g. #section).'
        ),
});

/**
 * Resolve once the SPA navigation to `pathname` has committed (the browser URL reflects it), or
 * after a timeout. App Router updates `window.location` only when the navigation commits, so this
 * lets the tool hold its turn until the user is actually on the new page — after which the
 * tool-result server action's router refresh can no longer cancel the navigation.
 */
function waitForNavigationCommit(pathname: string): Promise<boolean> {
    const target = normalizePathname(pathname);
    if (normalizePathname(window.location.pathname) === target) {
        return Promise.resolve(true);
    }
    return new Promise((resolve) => {
        const startedAt = Date.now();
        const check = () => {
            if (normalizePathname(window.location.pathname) === target) {
                resolve(true);
            } else if (Date.now() - startedAt > 3000) {
                resolve(false);
            } else {
                requestAnimationFrame(check);
            }
        };
        requestAnimationFrame(check);
    });
}

/**
 * Build the built-in `navigateToPage` tool exposed to the assistant.
 *
 * The tool opens a page within the current documentation site without confirmation. It navigates
 * instantly with the Next.js router (adding a browser history entry, so the user can navigate
 * back) and waits for the navigation to commit before reporting back, so the assistant's
 * follow-up does not cancel the navigation.
 */
export function useNavigateToPageTool(): GitBookIntegrationTool {
    const router = useRouter();
    const language = useLanguage();
    const { onNavigationClick } = React.useContext(NavigationStatusContext);

    // The tool object is memoized once, so read the latest values from a ref at call time.
    const ref = React.useRef({ router, language, onNavigationClick });
    React.useEffect(() => {
        ref.current = { router, language, onNavigationClick };
    });

    return React.useMemo<GitBookIntegrationTool>(
        () => ({
            name: 'navigateToPage',
            description:
                'Navigate the user to a page in the documentation. The page opens instantly without asking for confirmation, so only use it when the user clearly wants to be taken to a specific page. Provide the URL of the page within this documentation site.',
            inputSchema: zodToJsonSchema(
                NavigateToPageInputSchema as any
            ) as AIToolDefinition['inputSchema'],
            execute: async (input) => {
                const { router, language, onNavigationClick } = ref.current;
                const { url } = NavigateToPageInputSchema.parse(input);

                // The assistant references pages using the stable content-ref scheme
                // (e.g. `/spaces/<id>/pages/<id>`). Resolve it server-side to the real site link.
                const resolved = await resolveAINavigationLink(url);
                const target =
                    'error' in resolved
                        ? resolved
                        : resolveNavigationTarget(resolved.href, window.location);

                if ('error' in target) {
                    return {
                        output: { error: target.error },
                        summary: {
                            icon: 'triangle-exclamation',
                            text: tString(language, 'ai_chat_tools_navigate_failed'),
                        },
                    };
                }

                onNavigationClick(target.href);
                router.push(target.href);
                const committed = await waitForNavigationCommit(target.pathname);
                if (!committed) {
                    // biome-ignore lint/suspicious/noConsole: surfaces a navigation that never committed
                    console.warn(`navigateToPage: navigation to ${target.href} did not commit`);
                }

                return {
                    output: { navigated: true, url: target.href },
                    summary: {
                        icon: 'book-open',
                        text: tString(language, 'ai_chat_tools_navigated_to_page'),
                    },
                };
            },
        }),
        []
    );
}
