/* eslint-disable @next/next/no-img-element */
import { ClassValue, tcls } from '@/lib/tailwind';

import { PolymorphicComponentProp } from './types';

/**
 * Render an image that will be swapped depending on the theme.
 * We don't use the `next/image` component because we need to load images from external sources.
 */
export function Image(
    props: PolymorphicComponentProp<
        'img',
        {
            src: {
                light: string;
                dark: string;
            };
            alt: string;
            style?: ClassValue;
        }
    >,
) {
    const { src, style, alt, ...rest } = props;
    return (
        <>
            <img {...rest} alt={alt} src={src.light} className={tcls('dark:hidden', style)} />
            <img
                {...rest}
                alt={alt}
                src={src.dark}
                className={tcls('hidden', 'dark:block', style)}
            />
        </>
    );
}
