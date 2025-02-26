import type { CustomizationThemedURL } from '@gitbook/api';

import { Image } from '@/components/utils';
import { getAbsoluteHref } from '@/lib/links';

import { Emoji } from '../primitives';

/**
 * Icon for a space.
 */
export async function SpaceIcon(
    props: { icon?: CustomizationThemedURL; emoji?: string } & Omit<
        React.ComponentProps<typeof Image>,
        'sources'
    >
) {
    const { icon, emoji, alt, ...imageProps } = props;

    if (emoji && !icon) {
        return <Emoji code={emoji} style="text-xl" />;
    }

    return (
        <Image
            alt={alt ?? ''}
            // The logo display is flaky and sometimes does not render,
            // so we hide it to make visual testing usable
            data-visual-test={icon ? undefined : 'blackout'}
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
                              src: await getAbsoluteHref(
                                  '~gitbook/icon?size=medium&theme=light',
                                  true
                              ),
                              size: { width: 256, height: 256 },
                          },
                          dark: {
                              src: await getAbsoluteHref(
                                  '~gitbook/icon?size=medium&theme=dark',
                                  true
                              ),
                              size: { width: 256, height: 256 },
                          },
                      }
            }
            {...imageProps}
        />
    );
}
