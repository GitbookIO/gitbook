import type { SiteSpace } from '@gitbook/api';

import { SocialAccountButton } from '../Footer/SocialAccounts';
import { SearchContainer, getSearchBaseProps } from '../Search';
import {
    SiteSectionTabs,
    encodeClientSiteSections,
    shouldRenderSiteSectionNavigation,
} from '../SiteSections';
import { HeaderLink } from './HeaderLink';
import { HeaderLinkMore } from './HeaderLinkMore';
import { HeaderLinks } from './HeaderLinks';
import { HeaderLogo } from './HeaderLogo';
import { HeaderMobileMenu } from './HeaderMobileMenu';
import { TranslationsDropdown } from './SpacesDropdown';
import { CONTAINER_STYLE } from '@/components/layout';
import { getSpaceLanguage, t } from '@/intl/server';
import { cx } from '@/lib/classnames';
import type { GitBookSiteContext } from '@/lib/context';

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

    const withSections = shouldRenderSiteSectionNavigation(visibleSections);
    const prominentSearch =
        'search' in customization.styling && customization.styling.search === 'prominent';

    const headerSocialAccounts = customization.socialAccounts.filter(
        (account) => account.display.header === true
    );

    return (
        <header
            data-gb-site-header
            className={cx('header-bar', withTopHeader ? null : 'mobile-only')}
        >
            <div className="header-inner">
                <div className="chrome-shift">
                    <div data-gb-header-content className={cx(CONTAINER_STYLE, 'header-content')}>
                        <div
                            className={cx(
                                'header-start',
                                prominentSearch && 'header-start-prominent'
                            )}
                        >
                            <HeaderMobileMenu
                                className={cx(
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
                        </div>

                        <div
                            className={cx(
                                'header-search',
                                prominentSearch && 'header-search-prominent'
                            )}
                        >
                            <SearchContainer
                                {...searchProps}
                                style={customization.styling.search}
                                viewport={!withTopHeader ? 'mobile' : undefined}
                            />
                        </div>

                        {customization.header.links.length > 0 ||
                        headerSocialAccounts.length > 0 ||
                        (!withSections && variants.translations.length > 1) ? (
                            <HeaderLinks>
                                {customization.header.links.map((link) => {
                                    return (
                                        <HeaderLink
                                            key={link.title}
                                            link={link}
                                            context={context}
                                        />
                                    );
                                })}
                                {headerSocialAccounts.length > 0 ? (
                                    <div className="header-social">
                                        {headerSocialAccounts.map((account) => {
                                            return (
                                                <SocialAccountButton
                                                    key={`${account.platform}-${account.handle}`}
                                                    account={account}
                                                    target={customization.externalLinks.target}
                                                    className="p-2 theme-bold:text-header-link hover:theme-bold:text-header-link hover:site-header:theme-bold:bg-header-link/3 focus-visible:site-header:theme-bold:bg-header-link/3"
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
                                        className="flex! -mx-3 site-header:theme-bold:text-header-link hover:site-header:theme-bold:bg-header-link/3 focus-visible:site-header:theme-bold:bg-header-link/3 aria-expanded:site-header:theme-bold:bg-header-link/5"
                                    />
                                ) : null}
                            </HeaderLinks>
                        ) : null}
                    </div>
                </div>
            </div>

            {visibleSections && withSections ? (
                <div className="chrome-shift-padding">
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
                                className="-mx-3 my-1.5 ml-2 self-start"
                            />
                        ) : null}
                    </SiteSectionTabs>
                </div>
            ) : null}
        </header>
    );
}
