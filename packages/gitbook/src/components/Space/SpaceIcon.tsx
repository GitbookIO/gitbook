import { CustomizationThemedURL } from '@gitbook/api';
import { headers } from 'next/headers';

import { Image } from '@/components/utils';
import { getGitBookContextFromHeaders } from '@/lib/gitbook-context';
import { getAbsoluteHref } from '@/lib/links';

import { Emoji } from '../primitives';

/**
 * Icon for a space.
 */
export async function SpaceIcon(
    props: { icon?: CustomizationThemedURL; emoji?: string } & Omit<
        React.ComponentProps<typeof Image>,
        'sources'
    >,
) {
    const ctx = getGitBookContextFromHeaders(await headers());
    const { icon, emoji, alt, ...imageProps } = props;

    if (emoji && !icon) {
        return <Emoji code={emoji} style="text-xl" />;
    }

    return (
        <Image
            alt={alt ?? ''}
            sources={
                icon
                    ? {
                          light: {
                              src: icon.light,
                              aspectRatio: '1',
                          },
                          dark: {
                              src: icon.dark,
                              aspectRatio: '1',
                          },
                      }
                    : {
                          light: {
                              src: getAbsoluteHref(
                                  ctx,
                                  '~gitbook/icon?size=medium&theme=light',
                                  true,
                              ),
                              size: { width: 256, height: 256 },
                          },
                          dark: {
                              src: getAbsoluteHref(
                                  ctx,
                                  '~gitbook/icon?size=medium&theme=dark',
                                  true,
                              ),
                              size: { width: 256, height: 256 },
                          },
                      }
            }
            {...imageProps}
        />
    );
}
