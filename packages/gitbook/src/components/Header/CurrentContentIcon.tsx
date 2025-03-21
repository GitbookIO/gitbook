import { Image } from '@/components/utils';

import type { GitBookSiteContext } from '@v2/lib/context';
import { Emoji } from '../primitives';

/**
 * Icon for the current content.
 */
export function CurrentContentIcon(
    props: {
        context: GitBookSiteContext;
    } & Omit<React.ComponentProps<typeof Image>, 'sources' | 'resize'>
) {
    const { alt, context, ...imageProps } = props;
    const { customization, linker, imageResizer } = context;

    const customIcon = 'icon' in customization.favicon ? customization.favicon.icon : undefined;
    const customEmoji = 'emoji' in customization.favicon ? customization.favicon.emoji : undefined;

    if (customEmoji && !customIcon) {
        return <Emoji code={customEmoji} style="text-xl" />;
    }

    return (
        <Image
            alt={alt ?? ''}
            // The logo display is flaky and sometimes does not render,
            // so we hide it to make visual testing usable
            data-visual-test={customIcon ? undefined : 'blackout'}
            resize={imageResizer}
            sources={
                customIcon
                    ? {
                          light: {
                              src: customIcon.light,
                              aspectRatio: '1',
                          },
                          dark: {
                              src: customIcon.dark,
                              aspectRatio: '1',
                          },
                      }
                    : {
                          light: {
                              src: linker.toPathInSpace('~gitbook/icon?size=medium&theme=light'),
                              size: { width: 256, height: 256 },
                          },
                          dark: {
                              src: linker.toPathInSpace('~gitbook/icon?size=medium&theme=dark'),
                              size: { width: 256, height: 256 },
                          },
                      }
            }
            {...imageProps}
        />
    );
}
