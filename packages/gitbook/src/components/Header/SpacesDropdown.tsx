import type { SiteSpace } from '@gitbook/api';
import type { IconName } from '@gitbook/icons';

import type { GitBookSiteContext } from '@/lib/context';
import { getSiteSpaceURL } from '@/lib/sites';
import type { ButtonProps } from '../primitives';
import { SpacesDropdownClient } from './SpacesDropdownClient';
import {
    getSlimSiteSpaces,
    getSpacesDropdownMenuClassName,
    getSpacesDropdownTitle,
    getTranslationsDropdownClassName,
} from './SpacesDropdownData';

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

    const slimSpaces = getSlimSiteSpaces({
        siteSpace,
        siteSpaces,
        currentLanguage,
        getURL: (siteSp) => getSiteSpaceURL(context, siteSp),
    });

    return (
        <SpacesDropdownClient
            title={getSpacesDropdownTitle(siteSpace, currentLanguage)}
            icon={icon}
            variant={variant}
            className={className}
            dropdownClassName={getSpacesDropdownMenuClassName()}
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

    const title = getSpacesDropdownTitle(siteSpace, context.locale);

    return (
        <SpacesDropdown
            icon="globe"
            context={context}
            siteSpace={siteSpace}
            siteSpaces={siteSpaces}
            variant="blank"
            className={getTranslationsDropdownClassName({ title, className })}
        />
    );
}
