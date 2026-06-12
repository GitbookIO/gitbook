'use client';

import { Icon, type IconName } from '@gitbook/icons';
import assertNever from 'assert-never';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';

import { tcls } from '@/lib/tailwind';
import { normalizePathname, resolveNavigationTarget } from '../AI/navigation';
import type { AIChatReference, CodeBlockReference, PageReference } from '../AI/references';
import { NavigationStatusContext } from '../hooks';

export function AIChatReferenceChips(props: {
    references: AIChatReference[];
    onRemove?: (id: string) => void;
    disabled?: boolean;
}) {
    const { references, onRemove, disabled } = props;
    const router = useRouter();
    const { onNavigationClick } = useContext(NavigationStatusContext);

    if (references.length === 0) {
        return null;
    }

    return (
        <div className="flex max-w-full flex-wrap gap-1.5">
            {references.map((ref) => (
                <div
                    key={ref.id}
                    className="inline-flex max-w-52 items-center gap-1 circular-corners:rounded-2xl rounded-corners:rounded-md straight-corners:rounded-xs border border-tint-subtle bg-tint-base px-0.5 py-0.5 text-tint text-xs leading-none"
                >
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            activateReference(ref, { router, onNavigationClick });
                        }}
                        className="inline-flex min-w-0 items-center gap-1.5 circular-corners:rounded-2xl rounded-corners:rounded-sm py-0.5 pr-1 pl-1.5 transition hover:bg-tint"
                    >
                        <Icon icon={getReferenceIcon(ref)} className="size-3 shrink-0 opacity-7" />
                        <span
                            className={tcls(
                                'min-w-0 truncate',
                                ref.type === 'code-block' && 'font-mono'
                            )}
                        >
                            {ref.label}
                        </span>
                    </button>
                    {onRemove ? (
                        <button
                            type="button"
                            aria-label="Remove"
                            onClick={(event) => {
                                event.stopPropagation();
                                onRemove(ref.id);
                            }}
                            disabled={disabled}
                            className="inline-flex size-4 shrink-0 items-center justify-center circular-corners:rounded-full rounded-corners:rounded-sm text-tint/8 transition hover:bg-tint hover:text-tint-strong disabled:cursor-not-allowed disabled:opacity-5"
                        >
                            <Icon icon="xmark" className="size-2.5" />
                        </button>
                    ) : null}
                </div>
            ))}
        </div>
    );
}

function getReferenceIcon(ref: AIChatReference): IconName {
    switch (ref.type) {
        case 'code-block':
            return 'code';
        case 'page':
            return 'memo';
        default:
            assertNever(ref);
    }
}

type NavigationHandle = {
    router: ReturnType<typeof useRouter>;
    onNavigationClick: (href: string) => void;
};

/**
 * Handle a click on a reference chip: jump to the referenced content.
 */
function activateReference(ref: AIChatReference, nav: NavigationHandle) {
    if (ref.type === 'page') {
        navigateToPageReference(ref, nav);
        return;
    }

    focusReference(ref);
}

/**
 * A page reference may be clicked from any page. Navigate to it if the reader is elsewhere,
 * otherwise scroll back to the top of the page they are already on.
 */
function navigateToPageReference(
    ref: PageReference,
    { router, onNavigationClick }: NavigationHandle
) {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!ref.href) {
        scrollToTop();
        return;
    }

    const target = resolveNavigationTarget(ref.href, window.location);
    if ('error' in target) {
        scrollToTop();
        return;
    }

    if (normalizePathname(window.location.pathname) === normalizePathname(target.pathname)) {
        scrollToTop();
        return;
    }

    onNavigationClick(target.href);
    router.push(target.href);
}

/**
 * A code-block reference points at a block on the current page: scroll it into view and focus it.
 */
function focusReference(ref: CodeBlockReference) {
    const candidates = document.querySelectorAll<HTMLElement>(`#${CSS.escape(ref.id)}`);
    const target = Array.from(candidates).find((el) => !el.closest('[data-ai-chat]'));
    if (!target) {
        return;
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.querySelector<HTMLElement>('[data-codeblock-focus]')?.focus({ preventScroll: true });
}
