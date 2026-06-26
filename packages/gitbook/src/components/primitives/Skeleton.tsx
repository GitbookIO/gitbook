'use client';
import { type ClassValue, tcls } from '@/lib/tailwind';

import { LoadingPane } from './LoadingPane';

/**
 * Placeholder to be used when a content is not yet loaded (in a React.Suspense boundary).
 * It's used when streaming the content of a page.
 */
export function SkeletonParagraph(props: {
    lines?: number;
    id?: string;
    size?: 'xsmall' | 'small' | 'medium';
    start?: number;
    className?: ClassValue;
    style?: React.CSSProperties;
    animated?: boolean;
}) {
    const { lines = 3, id, size = 'medium', start = 0, className, style, animated = true } = props;

    const lineHeight = size === 'small' ? 'h-5' : 'h-6';
    const itemHeight = size === 'small' ? 'h-3' : 'h-4';
    const wordGap = size === 'small' ? 'gap-1' : 'gap-2';

    return (
        <div
            className={tcls('flex flex-col', className)}
            id={id}
            role="status"
            aria-busy
            style={style}
        >
            {Array.from({ length: lines }).map((_, line) => {
                const itemsPerLine = (line % 2) + 2;
                return (
                    <div
                        key={line + start}
                        className={tcls('flex items-center', lineHeight, wordGap)}
                        style={{ width: `${(4 - ((line + start) % 4)) * 8 + 62}%` }}
                    >
                        {Array.from({ length: itemsPerLine }).map((_, item) => (
                            <LoadingItem
                                key={item}
                                className={itemHeight}
                                style={{
                                    flexGrow: ((line + start + item) % 3) + 1,
                                    animationDelay: `${(item + line + start) * 0.1}s`,
                                }}
                                animated={animated}
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    );
}

export function SkeletonList(props: {
    items: number;
    size?: 'xsmall' | 'small' | 'medium';
    start?: number;
    className?: ClassValue;
}) {
    const { items, size = 'medium', start = 0, className } = props;
    const itemHeight = size === 'small' ? 'h-4' : 'h-5';
    return Array.from({ length: items }).map((_, index) => (
        <li key={index} className={tcls('my-0.5', className)}>
            <LoadingItem
                className={tcls('origin-left', itemHeight)}
                style={{
                    width: `${(4 - ((index + start) % 4)) * 8 + 62}%`,
                    animationDelay: `${(index + start) * 0.1}s`,
                }}
            />
        </li>
    ));
}

/**
 * Placeholder when loading a title.
 */
export function SkeletonHeading(props: { id?: string; style?: ClassValue; animated?: boolean }) {
    const { id, style, animated = true } = props;
    return <LoadingItem id={id} className={tcls('h-12 max-w-3/4', style)} animated={animated} />;
}

/**
 * Placeholder when loading an asset (image, video, etc.)
 */
export function SkeletonImage(props: { id?: string; style?: ClassValue; animated?: boolean }) {
    const { id, style, animated = true } = props;
    return (
        <LoadingItem id={id} className={tcls('aspect-video w-full', style)} animated={animated} />
    );
}

/**
 * Placeholder when loading a card
 */
export function SkeletonCard(props: { id?: string; style?: ClassValue }) {
    const { id, style } = props;
    return (
        <div id={id} role="status" aria-busy className={tcls('flex', 'gap-[25px]', style)}>
            <LoadingPane tile={24} delay={0} style={['rounded-md', 'aspect-[1/1.2]', 'w-full']} />
            <LoadingPane tile={24} delay={1} style={['rounded-md', 'aspect-[1/1.2]', 'w-full']} />
            <LoadingPane tile={24} delay={2} style={['rounded-md', 'aspect-[1/1.2]', 'w-full']} />
        </div>
    );
}

/**
 * Placeholder when loading small elements
 */
export function SkeletonSmall(
    props: { id?: string; className?: ClassValue; animated?: boolean } & React.ComponentProps<'div'>
) {
    const { id, className, ...rest } = props;

    return <LoadingItem role="status" aria-busy id={id} className={tcls(className)} {...rest} />;
}

/**
 * Placeholder when loading an Update block
 */
export function SkeletonUpdate(props: { id?: string; className?: ClassValue; animated?: boolean }) {
    const { id, className } = props;
    return (
        <div
            id={id}
            role="status"
            aria-busy
            className={tcls(
                'flex flex-col gap-2 md:flex-row md:gap-4 lg:gap-12 xl:gap-20',
                className
            )}
        >
            <SkeletonSmall id={id} className={tcls('w-48', className)} />
            <LoadingPane tile={96} delay={0} style={['rounded-md', 'w-full']} />
        </div>
    );
}

function LoadingItem(props: React.ComponentProps<'div'> & { animated?: boolean }): React.ReactNode {
    const { className, animated = true, ...rest } = props;

    return (
        <div
            role="status"
            aria-busy={animated}
            className={tcls(
                animated ? 'animate-[blurIn_500ms_ease-out_both,pulse_2s_infinite]' : '',
                'circular-corners:rounded-2xl rounded-corners:rounded-md bg-tint-solid/2',
                className
            )}
            {...rest}
        />
    );
}
