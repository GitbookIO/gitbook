import { tcls } from '@/lib/tailwind';

// Base UI positions the `Arrow` part against the anchor but never rotates it, so the triangle is
// drawn pointing up and turned per `data-side` here.
export function PopupArrow(props: {
    /** The `Arrow` part of the Base UI component the arrow belongs to. */
    arrow: React.ComponentType<{ className?: string; children?: React.ReactNode }>;
    /** Applied to the triangle itself, to set its `fill`. */
    className?: string;
}) {
    const { arrow: Arrow, className } = props;

    return (
        <Arrow
            className={tcls(
                'h-2 w-4',
                'data-[side=bottom]:-top-2 data-[side=top]:-bottom-2 data-[side=top]:rotate-180',
                'data-[side=left]:-right-3 data-[side=left]:rotate-90',
                'data-[side=right]:-left-3 data-[side=right]:-rotate-90'
            )}
        >
            <svg
                aria-hidden="true"
                viewBox="0 0 20 10"
                preserveAspectRatio="none"
                className={tcls('block h-full w-full', className)}
            >
                <path d="M0 10 10 0l10 10z" />
            </svg>
        </Arrow>
    );
}
