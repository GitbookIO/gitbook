import { ClassValue, tcls } from '@/lib/tailwind';

import { LoadingPane } from './LoadingPane';

/**
 * Placeholder to be used when a content is not yet loaded (in a React.Suspense boundary).
 * It's used when streaming the content of a page.
 */
export function SkeletonParagraph(props: { style?: ClassValue }) {
    const { style } = props;
    return (
        <div role="status" className="skeleton-paragraph">
            <LoadingPane
                style={[
                    'rounded-md',
                    '[height:calc(15rem-1px)]',
                    '[max-width:calc(48rem-1px)]',
                    style,
                ]}
            />
        </div>
    );
}

/**
 * Placeholder when loading a title.
 */
export function SkeletonHeading(props: { style?: ClassValue }) {
    const { style } = props;
    return (
        <div role="status" className="skeleton-heading">
            <LoadingPane
                tile={12}
                style={['rounded-md', 'h-[47px]', '[max-width:calc(48rem-1px)]', style]}
            />
        </div>
    );
}

/**
 * Placeholder when loading an asset (image, video, etc.)
 */
export function SkeletonImage(props: { style?: ClassValue }) {
    const { style } = props;
    return (
        <div role="status" className="skeleton-image">
            <LoadingPane
                tile={96}
                style={[
                    'rounded-md',
                    'h-full',
                    'aspect-video',
                    '[max-width:calc(48rem-1px)]',
                    style,
                ]}
            />
        </div>
    );
}

/**
 * Placeholder when loading a card
 */
export function SkeletonCard(props: { style?: ClassValue }) {
    const { style } = props;
    return (
        <div role="status" className={tcls('skeleton-card', 'flex', 'gap-[25px]', style)}>
            <LoadingPane tile={24} style={['rounded-md', 'aspect-[1/1.2]', 'w-full']} />
            <LoadingPane tile={24} style={['rounded-md', 'aspect-[1/1.2]', 'w-full']} />
            <LoadingPane tile={24} style={['rounded-md', 'aspect-[1/1.2]', 'w-full']} />
        </div>
    );
}

/**
 * Placeholder when loading small elements
 */
export function SkeletonSmall(props: { style?: ClassValue }) {
    const { style } = props;
    return (
        <div role="status" className="skeleton-small">
            <LoadingPane
                tile={12}
                style={['rounded-md', 'h-[35px]', '[max-width:calc(48rem-1px)]', style]}
            />
        </div>
    );
}
