import {
    Collection,
    CustomizationSettings,
    Site,
    SiteCustomizationSettings,
    Space,
} from '@gitbook/api';

/**
 * Get the title to display for a content.
 */
export function getContentTitle(
    space: Space,
    customization: CustomizationSettings | SiteCustomizationSettings,
    parent: Site | Collection | null,
) {
    // When we are rendering a site, always give priority to the customization title first
    // and then fallback to the site title
    if (parent?.object === 'site') {
        return parent.title ?? space.title;
    }

    // Otherwise the legacy behavior is not changed to avoid regressions
    return parent ? parent.title : customization.title ?? space.title;
}
