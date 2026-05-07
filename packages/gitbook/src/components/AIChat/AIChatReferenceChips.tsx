import { Icon } from '@gitbook/icons';

import type { AIChatReference } from '../AI/references';

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
            {references.map((ref) => (
                <div
                    key={ref.id}
                    className="group/chip inline-flex max-w-52 items-center gap-1 circular-corners:rounded-2xl rounded-corners:rounded-md straight-corners:rounded-xs border border-tint-subtle bg-tint-base px-0.5 py-0.5 text-tint text-xs leading-none"
                >
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            focusReference(ref);
                        }}
                        className="inline-flex min-w-0 items-center gap-1.5 circular-corners:rounded-2xl rounded-corners:rounded-sm py-0.5 pr-1 pl-1.5 transition hover:bg-tint"
                    >
                        <Icon icon="code" className="size-3 shrink-0 opacity-7" />
                        <span className="min-w-0 truncate font-mono">{ref.label}</span>
                    </button>
                    {onRemove ? (
                        <button
                            type="button"
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

function focusReference(ref: AIChatReference) {
    const candidates = document.querySelectorAll<HTMLElement>(`#${CSS.escape(ref.id)}`);
    const target = Array.from(candidates).find((el) => !el.closest('[data-ai-chat]'));
    if (!target) {
        return;
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.querySelector<HTMLElement>('[data-codeblock-focus]')?.focus({ preventScroll: true });
}
