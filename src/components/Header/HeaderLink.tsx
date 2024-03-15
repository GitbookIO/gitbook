import {
    CustomizationContentLink,
    CustomizationHeaderLink,
    CustomizationSettings,
    CustomizationHeaderPreset,
} from '@gitbook/api';
import Link from 'next/link';

import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import {
    Dropdown,
    DropdownButtonProps,
    DropdownChevron,
    DropdownMenu,
    DropdownMenuItem,
} from './Dropdown';

export async function HeaderLink(props: {
    context: ContentRefContext;
    link: CustomizationHeaderLink;
    customization: CustomizationSettings;
}) {
    const { context, link, customization } = props;

    const isCustomizationCustom = customization.header.preset === CustomizationHeaderPreset.Custom;

    const isCustomizationDefault =
        customization.header.preset === CustomizationHeaderPreset.Default;

    const target = await resolveContentRef(link.to, context);

    if (!target) {
        return null;
    }

    const renderLink = (linkProps: DropdownButtonProps<HTMLAnchorElement>) => (
        <Link
            {...linkProps}
            href={target.href}
            className={tcls(
                'overflow-hidden',
                'text-sm',
                'flex',
                'flex-row',
                'items-center',
                'whitespace-nowrap',
                'lg:text-base',

                !isCustomizationDefault
                    ? ['text-header-link-500']
                    : ['text-dark/8', 'dark:text-light/8', 'dark:hover:text-light'],
                target.active
                    ? [
                          isCustomizationCustom
                              ? ['shadow-header-link-500/7']
                              : ['shadow-dark/6', 'dark:shadow-light/7'],
                      ]
                    : ['hover:text-header-link-400'],
            )}
        >
            <span className={tcls('truncate')}> {link.title}</span>

            {link.links && link.links.length > 0 ? <DropdownChevron /> : null}
        </Link>
    );

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
