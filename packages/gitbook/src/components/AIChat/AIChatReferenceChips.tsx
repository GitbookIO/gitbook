'use client';

import { Icon, type IconName } from '@gitbook/icons';
import assertNever from 'assert-never';

import { tcls } from '@/lib/tailwind';
import type { AIChatReference } from '../AI/references';
import { Link } from '../primitives';

const triggerClassName =
    'inline-flex min-w-0 items-center gap-1.5 circular-corners:rounded-2xl rounded-corners:rounded-sm py-0.5 pr-1 pl-1.5 text-tint no-underline transition hover:bg-tint hover:text-tint';

export function AIChatReferenceChips(props: {
    references: AIChatReference[];
    onRemove?: (id: string) => void;
    disabled?: boolean;
}) {
    const { references, onRemove, disabled } = props;

    if (references.length === 0) {
        return null;
    }

    return (
        <div className="flex max-w-full flex-wrap gap-1.5">
            {references.map((ref) => {
                const content = (
                    <>
                        <Icon icon={getReferenceIcon(ref)} className="size-3 shrink-0 opacity-7" />
                        <span
                            className={tcls(
                                'min-w-0 truncate',
                                ref.type === 'code-block' && 'font-mono'
                            )}
                        >
                            {ref.type === 'text' ? ref.content : ref.label}
                        </span>
                    </>
                );

                return (
                    <div
                        key={ref.id}
                        className="inline-flex max-w-52 items-center gap-1 circular-corners:rounded-2xl rounded-corners:rounded-md straight-corners:rounded-xs border border-tint-subtle bg-tint-base px-0.5 py-0.5 text-tint text-xs leading-none"
                    >
                        {ref.type === 'page' && ref.href ? (
                            // A page reference may be clicked from anywhere: render a link so it
                            // navigates back to the page (and supports cmd/ctrl-click to open in a
                            // new tab).
                            <Link
                                href={ref.href}
                                prefetch={false}
                                className={triggerClassName}
                                onClick={(event) => event.stopPropagation()}
                            >
                                {content}
                            </Link>
                        ) : ref.type === 'text' ? (
                            // A text selection has no persistent DOM anchor to navigate to, so the
                            // excerpt is shown as plain (non-interactive) content.
                            <span className={triggerClassName}>{content}</span>
                        ) : (
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    focusReference(ref);
                                }}
                                className={triggerClassName}
                            >
                                {content}
                            </button>
                        )}
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
                );
            })}
        </div>
    );
}

function getReferenceIcon(ref: AIChatReference): IconName {
    switch (ref.type) {
        case 'code-block':
            return 'code';
        case 'page':
            return 'memo';
        case 'text':
            return 'quote-left';
        default:
            assertNever(ref);
    }
}

/**
 * Jump to the content a reference points at, for chips that aren't rendered as links:
 * - a code block: scroll it into view on the current page and focus it;
 * - a page without a known href: scroll back to the top (the reader is most likely on it).
 */
function focusReference(ref: AIChatReference) {
    if (ref.type === 'page') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    const candidates = document.querySelectorAll<HTMLElement>(`#${CSS.escape(ref.id)}`);
    const target = Array.from(candidates).find((el) => !el.closest('[data-ai-chat]'));
    if (!target) {
        return;
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.querySelector<HTMLElement>('[data-codeblock-focus]')?.focus({ preventScroll: true });
}
