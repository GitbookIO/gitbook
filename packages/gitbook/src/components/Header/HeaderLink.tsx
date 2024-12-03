import {
    CustomizationContentLink,
    CustomizationSettings,
    CustomizationHeaderPreset,
    SiteCustomizationSettings,
    CustomizationHeaderLink,
} from '@gitbook/api';
import assertNever from 'assert-never';

import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

// @TODO replace by api.CustomizationHeaderItem when available
type CustomizationHeaderItem = Omit<CustomizationHeaderLink, 'to'> & {
    to: CustomizationHeaderLink['to'] | null;
};

import {
    Dropdown,
    DropdownButtonProps,
    DropdownChevron,
    DropdownMenu,
    DropdownMenuItem,
} from './Dropdown';
import { Button, Link } from '../primitives';

export async function HeaderLink(props: {
    context: ContentRefContext;
    link: CustomizationHeaderItem;
    customization: CustomizationSettings | SiteCustomizationSettings;
}) {
    const { context, link, customization } = props;

    const target = link.to ? await resolveContentRef(link.to, context) : null;
    const isDropdownOnly = !link.to;

    // Do not show dropdown if it has no links.
    if (isDropdownOnly && link.links?.length === 0) {
        return null;
    }

    // If it's a link without a target, we don't render it.
    if (!isDropdownOnly && !target) {
        return null;
    }

    const headerPreset = customization.header.preset;

    const renderLink = (linkProps: DropdownButtonProps<HTMLAnchorElement>) => {
        // For dropdown only we don't respect the style, it's always shown as a dropdown.
        const linkStyle = isDropdownOnly ? 'link' : (link.style ?? 'link');

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
                        href={target?.href}
                        variant={variant}
                        size="medium"
                        className={tcls(
                            {
                                ['button-primary']:
                                    headerPreset === CustomizationHeaderPreset.Custom ||
                                    headerPreset === CustomizationHeaderPreset.Bold
                                        ? tcls(
                                              'bg-header-link-500 hover:bg-text-header-link-300 text-header-button-text',
                                              'dark:bg-header-link-500 dark:hover:bg-text-header-link-300 dark:text-header-button-text',
                                          )
                                        : null,
                                ['button-secondary']: tcls(
                                    'bg:transparent hover:bg-transparent',
                                    'dark:bg-transparent dark:hover:bg-transparent',
                                    'ring-header-link-500 hover:ring-header-link-300 text-header-link-500',
                                    'dark:ring-header-link-500 dark:hover:ring-header-link-300 dark:text-header-link-500',
                                ),
                            }[linkStyle],
                        )}
                    >
                        {link.title}
                    </Button>
                );
            }
            case 'link': {
                const props = {
                    ...linkProps,
                    className: tcls(
                        'overflow-hidden',
                        'text-sm lg:text-base',
                        'flex flex-row items-center',
                        'whitespace-nowrap',
                        'hover:text-header-link-400 dark:hover:text-light',
                        // Dropdown is not clickable, items are displayed when hovering.
                        isDropdownOnly && 'cursor-default',

                        headerPreset === CustomizationHeaderPreset.Default
                            ? ['text-dark/8', 'dark:text-light/8']
                            : ['text-header-link-500 hover:text-header-link-400'],
                    ),
                    children: (
                        <>
                            <span className={tcls('truncate')}>{link.title}</span>
                            {link.links && link.links.length > 0 ? <DropdownChevron /> : null}
                        </>
                    ),
                };
                if (target) {
                    return <Link href={target.href} {...props} />;
                }
                return <span {...props} />;
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
