import type { AIToolCallSearchResult } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import { HighlightQuery } from '../Search/HighlightQuery';
import { Link } from '../primitives';

export function AISearchResults({
    query,
    results,
}: { query: string; results: (AIToolCallSearchResult & { href: string })[] }) {
    return (
        <details className="-ml-5 group flex w-full flex-col gap-2">
            <summary className="-mx-2 -mt-2 flex cursor-pointer list-none items-center gap-2 rounded-corners:rounded-md py-2 pr-4 pl-7 transition-colors marker:hidden hover:bg-primary-hover">
                <div className="flex flex-col">
                    <p>
                        Searched for <strong>{query}</strong>
                    </p>
                    <p className="text-tint-subtle text-xs">
                        {results.length
                            ? `${results.length} results — Click to view`
                            : 'No results'}
                    </p>
                </div>
                <Icon
                    icon="chevron-right"
                    className="ml-auto size-3 shrink-0 transition-transform group-open:rotate-90"
                />
            </summary>
            <div className="max-h-0 overflow-y-auto circular-corners:rounded-2xl rounded-corners:rounded-lg border border-tint-subtle p-2 opacity-0 transition-all group-open:max-h-96 group-open:opacity-11">
                <ol className="space-y-1">
                    {results.map((result, index) => (
                        <li
                            key={result.pageId}
                            className="animate-fadeIn"
                            style={{
                                animationDelay: `${index * 25}ms`,
                            }}
                        >
                            <Link
                                href={result.href}
                                key={result.pageId}
                                className="flex items-start gap-2 circular-corners:rounded-2xl rounded-corners:rounded-md px-3 py-2 transition-colors hover:bg-primary-hover"
                            >
                                <Icon
                                    icon="memo"
                                    className="mt-1 size-3 shrink-0 text-tint-subtle"
                                />
                                <div className="flex flex-col gap-1 text-tint">
                                    <h3 className="line-clamp-2 font-medium text-sm text-tint">
                                        <HighlightQuery query={query} text={result.title} />
                                    </h3>
                                    {result.description && (
                                        <p className="line-clamp-2 text-tint-subtle text-xs">
                                            <HighlightQuery
                                                query={query}
                                                text={result.description}
                                            />
                                        </p>
                                    )}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ol>
            </div>
        </details>
    );
}
