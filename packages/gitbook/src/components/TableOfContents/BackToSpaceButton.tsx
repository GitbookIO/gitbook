'use client';

import { Icon } from '@gitbook/icons';

import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

import { useBackToSpace } from '../hooks';
import { Link } from '../primitives';

/**
 * Shortcut displayed at the top of the ToC to navigate back to the space the reader
 * came from, when they followed a link into a different space.
 *
 * It renders nothing until a cross-space navigation is detected client-side (see
 * {@link useBackToSpace}), so it has no effect on the vast majority of page views.
 */
export function BackToSpaceButton(props: { spaceId: string; spaceTitle: string }) {
    const { spaceId, spaceTitle } = props;
    const language = useLanguage();
    const backToSpace = useBackToSpace({ spaceId, spaceTitle });

    if (!backToSpace) {
        return null;
    }

    return (
        // Top margin so the shortcut, as the first element in the sidebar, isn't flush
        // against the (rounded) filled-sidebar edge.
        <div className="mt-2 mb-2 px-2">
            <Link
                href={backToSpace.url}
                className={tcls(
                    'group/back-to-space',
                    'flex items-center gap-2',
                    'px-3 py-2',
                    'circular-corners:rounded-xl rounded-md straight-corners:rounded-none',
                    'text-sm text-tint',
                    'bg-tint-base ring-1 ring-tint-subtle ring-inset',
                    'transition-colors',
                    'hover:bg-tint-hover hover:text-tint-strong',
                    'contrast-more:ring-tint'
                )}
            >
                <Icon
                    icon="arrow-left"
                    className={tcls(
                        'size-3 shrink-0 text-tint-subtle transition-transform',
                        'group-hover/back-to-space:-translate-x-0.5 group-hover/back-to-space:text-current'
                    )}
                />
                <span className="truncate">
                    {t(language, 'toc_back_to_space', backToSpace.spaceTitle)}
                </span>
            </Link>
        </div>
    );
}
