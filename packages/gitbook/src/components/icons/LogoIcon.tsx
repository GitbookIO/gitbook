import { CustomizationThemedURL } from '@gitbook/api';

import { Image } from '@/components/utils';
import { absoluteHref } from '@/lib/links';

import { Emoji } from '../primitives';

export function LogoIcon(
    props: { icon?: CustomizationThemedURL; emoji?: string } & Omit<
        React.ComponentProps<typeof Image>,
        'sources'
    >,
) {
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
                              src: absoluteHref('~gitbook/icon?size=medium&theme=light', true),
                              size: { width: 256, height: 256 },
                          },
                          dark: {
                              src: absoluteHref('~gitbook/icon?size=medium&theme=dark', true),
                              size: { width: 256, height: 256 },
                          },
                      }
            }
            {...imageProps}
        />
    );
}
