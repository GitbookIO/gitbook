import { SkeletonHeading, SkeletonParagraph } from '@/components/primitives';
import { tcls } from '@/lib/tailwind';

/**
 * Placeholder when loading a page.
 */
export default function PageSkeleton() {
    return (
        <div
            className={tcls(
                'relative',
                'py-8',
                'lg:px-12',
                'flex-1',
                'mr-56',
                // withDesktopTableOfContents ? null : 'xl:ml-72',
            )}
        >
            <div className={tcls('max-w-3xl', 'mx-auto')}>
                <SkeletonHeading style={tcls('mb-8')} />
                <SkeletonParagraph style={tcls('mb-4')} />
            </div>
        </div>
    );
}
