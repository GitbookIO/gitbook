import type { GitBookSiteContext } from '@/lib/context';

import { getSpaceLanguage, t } from '@/intl/server';
import { tcls } from '@/lib/tailwind';
import type { SiteSpace } from '@gitbook/api';
import { SocialAccountButton } from '../Footer/SocialAccounts';
import { SearchContainer, getSearchBaseProps } from '../Search';
import { SiteSectionTabs, encodeClientSiteSections } from '../SiteSections';
import { HeaderLayout } from './HeaderLayout';
import { HeaderLink } from './HeaderLink';
import { HeaderLinkMore } from './HeaderLinkMore';
import { HeaderLinks } from './HeaderLinks';
import { HeaderLogo } from './HeaderLogo';
import { HeaderMobileMenu } from './HeaderMobileMenu';
import { TranslationsDropdown } from './SpacesDropdown';

/**
 * Render the header for the space.
 */
export async function Header(props: {
    context: GitBookSiteContext;
    withTopHeader?: boolean;
    variants: {
        generic: SiteSpace[];
        translations: SiteSpace[];
    };
}) {
    const { context, withTopHeader, variants } = props;
    const { siteSpace, visibleSections, customization } = context;
    const searchProps = getSearchBaseProps(context);
    const language = await getSpaceLanguage(context);

    const withSections = Boolean(
        visibleSections &&
            (visibleSections.list.length > 1 || // Show section tabs if there are at least 2 sections or at least 1 section group
                visibleSections.list.some((s) => s.object === 'site-section-group'))
    );

    const headerSocialAccounts = customization.socialAccounts.filter(
        (account) => account.display.header === true
    );

    return (
        <HeaderLayout
            withTopHeader={withTopHeader}
            searchStyle={customization.styling.search}
            leading={
                <>
                    <HeaderMobileMenu
                        className={tcls(
                            '-ml-2',
                            'text-tint-strong',
                            'site-header:theme-bold:text-header-link',
                            'hover:bg-tint-hover',
                            'hover:site-header:theme-bold:bg-header-link/3',
                            variants.generic.length > 1
                                ? 'lg:hidden'
                                : 'no-sidebar:hidden lg:hidden'
                        )}
                    />
                    <HeaderLogo context={context} />
                </>
            }
            search={
                <SearchContainer
                    {...searchProps}
                    style={customization.styling.search}
                    viewport={!withTopHeader ? 'mobile' : undefined}
                />
            }
            links={
                customization.header.links.length > 0 ||
                headerSocialAccounts.length > 0 ||
                (!withSections && variants.translations.length > 1) ? (
                    <HeaderLinks>
                        {customization.header.links.map((link) => {
                            return <HeaderLink key={link.title} link={link} context={context} />;
                        })}
                        {headerSocialAccounts.length > 0 ? (
                            <div className="flex items-center gap-1">
                                {headerSocialAccounts.map((account) => {
                                    return (
                                        <SocialAccountButton
                                            key={`${account.platform}-${account.handle}`}
                                            account={account}
                                            target={customization.externalLinks.target}
                                            className="p-2 theme-bold:text-header-link hover:site-header:theme-bold:bg-header-link/3 hover:theme-bold:text-header-link focus-visible:site-header:theme-bold:bg-header-link/3"
                                        />
                                    );
                                })}
                            </div>
                        ) : null}
                        {customization.header.links.length > 0 ||
                        headerSocialAccounts.length > 0 ? (
                            <HeaderLinkMore
                                label={t(language, 'more')}
                                links={customization.header.links}
                                socialAccounts={headerSocialAccounts}
                                context={context}
                            />
                        ) : null}
                        {!withSections && variants.translations.length > 1 ? (
                            <TranslationsDropdown
                                context={context}
                                siteSpace={
                                    variants.translations.find(
                                        (space) => space.id === siteSpace.id
                                    ) ?? siteSpace
                                }
                                siteSpaces={variants.translations}
                                className="flex! site-header:theme-bold:text-header-link hover:site-header:theme-bold:bg-header-link/3 focus-visible:site-header:theme-bold:bg-header-link/3 aria-expanded:site-header:theme-bold:bg-header-link/5"
                            />
                        ) : null}
                    </HeaderLinks>
                ) : null
            }
            sections={
                visibleSections && withSections ? (
                    <SiteSectionTabs sections={encodeClientSiteSections(context, visibleSections)}>
                        {variants.translations.length > 1 ? (
                            <TranslationsDropdown
                                context={context}
                                siteSpace={
                                    variants.translations.find(
                                        (space) => space.id === siteSpace.id
                                    ) ?? siteSpace
                                }
                                siteSpaces={variants.translations}
                                className="my-1.5 ml-2 self-start"
                            />
                        ) : null}
                    </SiteSectionTabs>
                ) : null
            }
        />
    );
}
