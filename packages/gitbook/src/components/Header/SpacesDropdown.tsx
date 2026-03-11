import type { SiteSpace } from '@gitbook/api';
import { useMemo } from 'react';

import type { GitBookSiteContext } from '@/lib/context';
import { getLocalizedTitle, getSiteSpaceURL } from '@/lib/sites';
import { tcls } from '@/lib/tailwind';
import { Button, type ButtonProps, ToggleChevron } from '../primitives';
import { DropdownMenu } from '../primitives/DropdownMenu';
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
    const currentLanguage = context.siteSpace.space.language;

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
                    size="small"
                    variant={variant}
                    trailing={<ToggleChevron />}
                    className={tcls('bg-tint-base', className)}
                >
                    <span className="button-content">
                        {getLocalizedTitle(siteSpace, currentLanguage)}
                    </span>
                </Button>
            }
        >
            <SpacesDropdownMenuItems
                slimSpaces={siteSpaces.map((siteSp) => ({
                    id: siteSp.id,
                    title: getLocalizedTitle(siteSp, currentLanguage),
                    url: getSiteSpaceURL(context, siteSp),
                    isActive: siteSp.id === siteSpace.id,
                    spaceId: siteSp.space.id,
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
    const title = getLocalizedTitle(siteSpace, context.siteSpace.space.language);
    const hasEmojiPrefix = useMemo(() => startsWithEmoji(title), [title]);

    return (
        <SpacesDropdown
            icon="globe"
            context={context}
            siteSpace={siteSpace}
            siteSpaces={siteSpaces}
            variant="blank"
            className={tcls(
                '-mx-3 bg-transparent lg:max-w-64 max-md:[&_.button-content]:hidden',
                hasEmojiPrefix
                    ? 'md:[&_.button-leading-icon]:hidden' // If the title starts with an emoji, don't show the icon (on desktop)
                    : '',
                className
            )}
        />
    );
}
