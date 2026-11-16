import React from 'react';

import { CONTENT_STYLE } from '../layout';
import { ThemeToggler } from '../ThemeToggler';
import { FooterLinksGroup } from './FooterLinksGroup';
import { SocialAccountButton } from './SocialAccounts';
import { Image } from '@/components/utils';
import { partition } from '@/lib/arrays';
import { cx } from '@/lib/classnames';
import type { GitBookSiteContext } from '@/lib/context';

const FOOTER_COLUMNS = 4;

export function Footer(props: { context: GitBookSiteContext }) {
    const { context } = props;
    const { customization } = context;

    const hasLogo = customization.footer.logo;
    const groupCount = customization.footer.groups?.length ?? 0;
    const hasGroups = groupCount > 0;
    const hasCopyright = customization.footer.copyright;
    const hasThemeToggle = customization.themes.toggeable;
    const socialLinks = customization.socialAccounts.filter((account) => account.display?.footer);

    const mobileOnly =
        !hasLogo && !hasGroups && !hasCopyright && !socialLinks.length && hasThemeToggle;

    return (
        <footer data-gb-site-footer className={cx('footer', mobileOnly && 'footer-toggle-only')}>
            <div className="chrome-shift-padding">
                <div className="footer-container">
                    <div className={cx(CONTENT_STYLE, 'footer-grid')}>
                        {
                            // Footer Logo
                            customization.footer.logo ? (
                                <div className="footer-logo">
                                    <Image
                                        alt="Logo"
                                        resize={context.imageResizer}
                                        sources={{
                                            light: {
                                                src: customization.footer.logo.light,
                                            },
                                            dark: customization.footer.logo.dark
                                                ? {
                                                      src: customization.footer.logo.dark,
                                                  }
                                                : null,
                                        }}
                                        loading="lazy"
                                        style="footer-logo-img"
                                        sizes={[
                                            {
                                                width: 320,
                                            },
                                        ]}
                                    />
                                </div>
                            ) : null
                        }

                        {
                            // Theme Toggle
                            customization.themes.toggeable ? (
                                // Hidden where the outline column is pinned open (see PageAside),
                                // since that column carries its own toggle.
                                <div className="footer-toggle">
                                    <React.Suspense fallback={null}>
                                        <ThemeToggler />
                                    </React.Suspense>
                                </div>
                            ) : null
                        }

                        {
                            // Navigation groups (split into equal columns)
                            customization.footer.groups?.length > 0 ? (
                                <div className="footer-groups">
                                    <div className="footer-columns">
                                        {partition(customization.footer.groups, FOOTER_COLUMNS).map(
                                            (column, columnIndex) => (
                                                <div key={columnIndex} className="footer-column">
                                                    {column.map((group, groupIndex) => (
                                                        <FooterLinksGroup
                                                            key={groupIndex}
                                                            group={group}
                                                            context={context}
                                                        />
                                                    ))}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            ) : null
                        }

                        {
                            // Social Links
                            socialLinks.length > 0 ? (
                                <div className="footer-social">
                                    {socialLinks.map((account) => (
                                        <SocialAccountButton
                                            key={`${account.platform}-${account.handle}`}
                                            account={account}
                                            target={customization.externalLinks.target}
                                        />
                                    ))}
                                </div>
                            ) : null
                        }

                        {
                            // Legal
                            customization.footer.copyright ? (
                                <div className="footer-legal">
                                    <p>{customization.footer.copyright}</p>
                                </div>
                            ) : null
                        }
                    </div>
                </div>
            </div>
        </footer>
    );
}
