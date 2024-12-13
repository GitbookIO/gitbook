import { CustomizationSettings, Site, SiteCustomizationSettings, Space } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { HeaderLogo } from './HeaderLogo';

/**
 * Header to display on top of the table of contents when the space has no header configured.
 */
export function CompactHeader(props: {
    space: Space;
    site: Site | null;
    spaces: Space[];
    customization: CustomizationSettings | SiteCustomizationSettings;
}) {
    const { space, site, customization } = props;

    return (
        <div
            className={tcls(
                'hidden',
                'pr-4',
                'mt-5',
                'lg:flex',
                'flex-grow-0',
                'flex-wrap',
                'dark:shadow-light/1',
            )}
        >
            <HeaderLogo site={site} space={space} customization={customization} />
        </div>
    );
}
