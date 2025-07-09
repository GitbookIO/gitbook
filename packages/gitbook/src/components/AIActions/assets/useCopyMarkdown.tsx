import { useRef, useState } from 'react';

const markdownCache = new Map<string, string>();

/**
 * Hook to fetch and copy the markdown of a page.
 * Result is cached to avoid fetching the same page multiple times.
 */
export function useCopyMarkdown(markdownPageUrl: string) {
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchMarkdown = async () => {
        if (markdownCache.has(markdownPageUrl)) {
            return markdownCache.get(markdownPageUrl)!;
        }

        // Cancel any ongoing fetch
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create a new abort controller for this fetch
        abortControllerRef.current = new AbortController();

        // Clear the cache on new fetch (new page) to avoid stale data
        markdownCache.clear();

        try {
            const markdown = await fetch(markdownPageUrl, {
                signal: abortControllerRef.current.signal,
            }).then((res) => res.text());

            markdownCache.set(markdownPageUrl, markdown);
            return markdown;
        } catch (error) {
            // If the fetch was aborted, don't throw the error
            if (error instanceof Error && error.name === 'AbortError') {
                return null;
            }
            throw error;
        } finally {
            // Clear the abort controller reference
            abortControllerRef.current = null;
        }
    };

    const copyMarkdown = async () => {
        let markdown = markdownCache.get(markdownPageUrl);

        if (!markdown) {
            // Cancel any ongoing fetch from onMouseEnter
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            setIsLoading(true);

            const fetchedMarkdown = await fetchMarkdown();

            setIsLoading(false);

            if (fetchedMarkdown) {
                markdown = fetchedMarkdown;
            }
        }

        if (markdown) {
            navigator.clipboard.writeText(markdown);
        }
    };

    return {
        fetchMarkdown: fetchMarkdown,
        copyMarkdown: copyMarkdown,
        isLoading,
    };
}
