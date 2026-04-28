import type { ResolvedContentRef } from '@/lib/references';

export function toAbsoluteContentRefHref(
    resolvedContentRef: ResolvedContentRef | null,
    toAbsoluteURL: (href: string) => string
): ResolvedContentRef | null {
    if (!resolvedContentRef?.href) {
        return resolvedContentRef;
    }

    return {
        ...resolvedContentRef,
        href: toAbsoluteURL(resolvedContentRef.href),
    };
}
