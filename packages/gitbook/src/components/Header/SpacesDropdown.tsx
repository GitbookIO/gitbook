import type { SiteSpace } from '@gitbook/api';
import type { IconName } from '@gitbook/icons';

import type { GitBookSiteContext } from '@/lib/context';
import { getLocalizedTitle, getSiteSpaceURL } from '@/lib/sites';
import { tcls } from '@/lib/tailwind';
import type { ButtonProps } from '../primitives';
import { SpacesDropdownClient } from './SpacesDropdownClient';

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
    icon?: IconName;
}) {
    const { context, siteSpace, siteSpaces, className, variant = 'secondary', icon } = props;
    const currentLanguage = context.locale;

    const dropdownClassName = tcls(
        'group-hover/dropdown:invisible', // Prevent hover from opening the dropdown, as it's annoying in this context
        'group-focus-within/dropdown:group-hover/dropdown:visible' // When the dropdown is already open, it should remain visible when hovered
    );

    const slimSpaces = siteSpaces.map((siteSp) => ({
        id: siteSp.id,
        title: getLocalizedTitle(siteSp, currentLanguage),
        url: getSiteSpaceURL(context, siteSp),
        isActive: siteSp.id === siteSpace.id,
        spaceId: siteSp.space.id,
    }));

    return (
        <SpacesDropdownClient
            title={getLocalizedTitle(siteSpace, currentLanguage)}
            icon={icon}
            variant={variant}
            className={className}
            dropdownClassName={dropdownClassName}
            slimSpaces={slimSpaces}
            curPath={siteSpace.path}
        />
    );
}

export function TranslationsDropdown(props: {
    context: GitBookSiteContext;
    siteSpace: SiteSpace;
    siteSpaces: SiteSpace[];
    className?: string;
}) {
    const { context, siteSpace, siteSpaces, className } = props;

    const title = getLocalizedTitle(siteSpace, context.locale);
    const hasEmojiPrefix = startsWithEmoji(title);

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
