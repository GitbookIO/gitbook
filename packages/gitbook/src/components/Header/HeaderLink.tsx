import {
    CustomizationContentLink,
    CustomizationHeaderLink,
    CustomizationSettings,
    CustomizationHeaderPreset,
    SiteCustomizationSettings,
} from '@gitbook/api';
import assertNever from 'assert-never';

import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import {
    Dropdown,
    DropdownButtonProps,
    DropdownChevron,
    DropdownMenu,
    DropdownMenuItem,
} from './Dropdown';
import { Button, Link } from '../primitives';

// @TODO Remove it once we have the proper types in API
type CustomizationHeaderLinkWithStyle = CustomizationHeaderLink & {
    style?: 'link' | 'button-primary' | 'button-secondary';
};

export async function HeaderLink(props: {
    context: ContentRefContext;
    link: CustomizationHeaderLinkWithStyle;
    customization: CustomizationSettings | SiteCustomizationSettings;
}) {
    const { context, link, customization } = props;

    const target = await resolveContentRef(link.to, context);

    if (!target) {
        return null;
    }

    const headerPreset = customization.header.preset;

    const renderLink = (linkProps: DropdownButtonProps<HTMLAnchorElement>) => {
        const linkStyle = link.style ?? 'link';

        switch (linkStyle) {
            case 'button-secondary':
            case 'button-primary': {
                const variant = (() => {
                    switch (linkStyle) {
                        case 'button-secondary':
                            return 'secondary';
                        case 'button-primary':
                            return 'primary';
                        default:
                            assertNever(linkStyle);
                    }
                })();
                return (
                    <Button
                        href={target.href}
                        variant={variant}
                        className={tcls(
                            {
                                'button-primary':
                                    headerPreset === CustomizationHeaderPreset.Custom ||
                                    headerPreset === CustomizationHeaderPreset.Bold
                                        ? tcls(
                                              'bg-header-link-500 hover:bg-text-header-link-300 text-header-button-text',
                                              'dark:bg-header-link-500 dark:hover:bg-text-header-link-300 dark:text-header-button-text',
                                          )
                                        : null,
                                'button-secondary': tcls(
                                    'dark:bg-transparent dark:hover:bg-transparent',
                                    'ring-header-link-500 hover:ring-header-link-300 dark:ring-header-link-500 dark:hover:ring-header-link-300 text-header-link-500 dark:text-header-link-500',
                                ),
                            }[linkStyle],
                        )}
                    >
                        {link.title}
                    </Button>
                );
            }
            case 'link': {
                return (
                    <Link
                        {...linkProps}
                        href={target.href}
                        className={tcls(
                            'overflow-hidden',
                            'text-sm lg:text-base',
                            'flex flex-row items-center',
                            'whitespace-nowrap',
                            'hover:text-header-link-400 dark:hover:text-light',

                            headerPreset === CustomizationHeaderPreset.Default
                                ? ['text-dark/8', 'dark:text-light/8']
                                : ['text-header-link-500 hover:text-header-link-400'],
                        )}
                    >
                        <span className={tcls('truncate')}>{link.title}</span>
                        {link.links && link.links.length > 0 ? <DropdownChevron /> : null}
                    </Link>
                );
            }
            default:
                assertNever(linkStyle);
        }
    };

    if (link.links && link.links.length > 0) {
        return (
            <Dropdown button={renderLink}>
                <DropdownMenu>
                    {link.links.map((subLink, index) => (
                        <SubHeaderLink key={index} {...props} link={subLink} />
                    ))}
                </DropdownMenu>
            </Dropdown>
        );
    }

    return renderLink({});
}

async function SubHeaderLink(props: {
    context: ContentRefContext;
    link: CustomizationContentLink;
}) {
    const { context, link } = props;

    const target = await resolveContentRef(link.to, context);

    if (!target) {
        return null;
    }

    return <DropdownMenuItem href={target.href}>{link.title}</DropdownMenuItem>;
}
