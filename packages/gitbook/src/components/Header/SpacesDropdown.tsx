import type { SiteSpace } from '@gitbook/api';
import { useMemo } from 'react';

import type { GitBookSiteContext } from '@/lib/context';
import { getSiteSpaceURL } from '@/lib/sites';
import { tcls } from '@/lib/tailwind';
import { Button, type ButtonProps } from '../primitives';
import { DropdownChevron, DropdownMenu } from '../primitives/DropdownMenu';
import { SpacesDropdownMenuItems } from './SpacesDropdownMenuItem';

// Memoized regex for checking if a string starts with an emoji
const EMOJI_REGEX = /^\p{Emoji}/u;

function startsWithEmoji(text: string): boolean {
    return EMOJI_REGEX.test(text);
}

export function SpacesDropdown(props: {
    context: GitBookSiteContext;
    siteSpace: SiteSpace;
    siteSpaces: SiteSpace[];
    className?: string;
    variant?: ButtonProps['variant'];
    icon?: ButtonProps['icon'];
}) {
    const { context, siteSpace, siteSpaces, className, variant = 'secondary', icon } = props;

    return (
        <DropdownMenu
            className={tcls(
                'group-hover/dropdown:invisible', // Prevent hover from opening the dropdown, as it's annoying in this context
                'group-focus-within/dropdown:group-hover/dropdown:visible' // When the dropdown is already open, it should remain visible when hovered
            )}
            button={
                <Button
                    icon={icon}
                    data-testid="space-dropdown-button"
                    size="medium"
                    variant={variant}
                    trailing={<DropdownChevron />}
                    className={tcls('bg-tint-base', className)}
                >
                    <span className="button-content">{siteSpace.title}</span>
                </Button>
            }
        >
            <SpacesDropdownMenuItems
                slimSpaces={siteSpaces.map((space) => ({
                    id: space.id,
                    title: space.title,
                    url: getSiteSpaceURL(context, space),
                    isActive: space.id === siteSpace.id,
                }))}
                curPath={siteSpace.path}
            />
        </DropdownMenu>
    );
}

export function TranslationsDropdown(props: {
    context: GitBookSiteContext;
    siteSpace: SiteSpace;
    siteSpaces: SiteSpace[];
    className?: string;
}) {
    const { context, siteSpace, siteSpaces, className } = props;

    // Memoize the emoji check to avoid repeated regex execution
    const hasEmojiPrefix = useMemo(() => startsWithEmoji(siteSpace.title), [siteSpace.title]);

    return (
        <SpacesDropdown
            icon="globe"
            context={context}
            siteSpace={siteSpace}
            siteSpaces={siteSpaces}
            variant="blank"
            className={tcls(
                '-mx-2 bg-transparent px-2 md:py-1 lg:max-w-64 max-md:[&_.button-content]:hidden',
                hasEmojiPrefix
                    ? 'md:[&_.button-leading-icon]:hidden' // If the title starts with an emoji, don't show the icon (on desktop)
                    : '',
                className
            )}
        />
    );
}
