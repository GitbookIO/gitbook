import { SkeletonHeading, SkeletonParagraph } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';
import { CONTENT_LAYOUT } from '../layout';

/**
 * Placeholder when loading a page.
 */
export function SitePageSkeleton() {
    return (
        <div
            className={tcls(
                'flex',
                'flex-row',
                'flex-1',
                'relative',
                'py-8',
                'lg:px-16',
                'xl:mr-56',
                'items-center',
                'lg:items-start'
            )}
        >
            <div className={tcls('flex-1', CONTENT_LAYOUT)}>
                <SkeletonHeading style={tcls('mb-8')} />
                <SkeletonParagraph style={tcls('mb-4')} />
            </div>
        </div>
    );
}
