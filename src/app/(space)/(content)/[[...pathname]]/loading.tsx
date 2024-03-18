import { SkeletonHeading, SkeletonParagraph } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';

/**
 * Placeholder when loading a page.
 */
export default function PageSkeleton() {
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
                'lg:items-start',
            )}
        >
            <div className={tcls('flex-1', 'max-w-3xl', 'mx-auto')}>
                <SkeletonHeading style={tcls('mb-8')} />
                <SkeletonParagraph style={tcls('mb-4')} />
            </div>
        </div>
    );
}
