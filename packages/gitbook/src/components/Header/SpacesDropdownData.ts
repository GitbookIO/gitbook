import type { SiteSpace, TranslationLanguage } from '@gitbook/api';

import { getLocalizedTitle } from '@/lib/sites';
import { type ClassValue, tcls } from '@/lib/tailwind';

export type SlimSiteSpace = {
    id: string;
    title: string;
    url: string;
    isActive: boolean;
    spaceId: string;
};

// Memoized regex for checking if a string starts with an emoji
const EMOJI_REGEX = /^\p{Emoji}/u;

function startsWithEmoji(text: string): boolean {
    return EMOJI_REGEX.test(text);
}

export function getSpacesDropdownTitle(
    siteSpace: SiteSpace,
    currentLanguage: TranslationLanguage | undefined
) {
    return getLocalizedTitle(siteSpace, currentLanguage);
}

export function getSlimSiteSpaces(props: {
    siteSpace: SiteSpace;
    siteSpaces: SiteSpace[];
    currentLanguage: TranslationLanguage | undefined;
    getURL: (siteSpace: SiteSpace) => string;
}): SlimSiteSpace[] {
    const { siteSpace, siteSpaces, currentLanguage, getURL } = props;

    return siteSpaces.map((siteSp) => ({
        id: siteSp.id,
        title: getSpacesDropdownTitle(siteSp, currentLanguage),
        url: getURL(siteSp),
        isActive: siteSp.id === siteSpace.id,
        spaceId: siteSp.space.id,
    }));
}

export function getTranslationsDropdownClassName(props: {
    title: string;
    className?: ClassValue;
}) {
    const { title, className } = props;
    const hasEmojiPrefix = startsWithEmoji(title);

    return tcls(
        '-mx-3 bg-transparent lg:max-w-64 max-md:[&_.button-content]:hidden',
        hasEmojiPrefix
            ? 'md:[&_.button-leading-icon]:hidden' // If the title starts with an emoji, don't show the icon (on desktop)
            : '',
        className
    );
}

export function getSpacesDropdownMenuClassName() {
    return tcls(
        'group-hover/dropdown:invisible', // Prevent hover from opening the dropdown, as it's annoying in this context
        'group-focus-within/dropdown:group-hover/dropdown:visible' // When the dropdown is already open, it should remain visible when hovered
    );
}
