import { ClassValue, tcls } from '@/lib/tailwind';

/**
 * Placeholder to be used when a content is not yet loaded (in a React.Suspense boundary).
 * It's used when streaming the content of a page.
 */
export function SkeletonParagraph(props: { style?: ClassValue }) {
    const { style } = props;
    return (
        <div role="status" className={tcls('animate-pulse', style)}>
            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-4"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[70%] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[70%] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[80%] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[70%]"></div>
            <span className="sr-only">Loading...</span>
        </div>
    );
}

/**
 * Placeholder when loading a title.
 */
export function SkeletonHeading(props: { style?: ClassValue }) {
    const { style } = props;
    return (
        <div role="status" className={tcls('animate-pulse', style)}>
            <div className="h-6 bg-gray-200 rounded-full dark:bg-gray-700 w-[50%] mb-4"></div>
            <span className="sr-only">Loading...</span>
        </div>
    );
}

/**
 * Placeholder when loading an asset (image, video, etc.)
 */
export function SkeletonImage(props: { style?: ClassValue }) {
    const { style } = props;
    return (
        <div role="status" className={tcls('animate-pulse', style)}>
            <div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded  dark:bg-gray-700">
                <svg
                    className="w-10 h-10 text-gray-200 dark:text-gray-600"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 18"
                >
                    <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                </svg>
            </div>
        </div>
    );
}

/**
 * Placeholder when loading a card
 */
export function SkeletonCard(props: { style?: ClassValue }) {
    const { style } = props;
    return (
        <div
            role="status"
            className={tcls('animate-pulse', 'p-4 border border-gray-200', 'rounded', style)}
        >
            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            <span className="sr-only">Loading...</span>
        </div>
    );
}
