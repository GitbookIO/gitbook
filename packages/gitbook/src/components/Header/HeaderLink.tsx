import { isSiteAuthLoginHref } from '@/lib/auth-login-link';
import type { GitBookSiteContext } from '@/lib/context';
import type { CustomizationContentLink, CustomizationHeaderItem } from '@gitbook/api';

import { resolveContentRef } from '@/lib/references';
import { HeaderLinkItem, SubHeaderLinkItem } from './HeaderLinkClient';
import { getHeaderLinkDropdownClassName } from './HeaderLinkStyles';

export async function HeaderLink(props: {
    context: GitBookSiteContext;
    link: CustomizationHeaderItem;
}) {
    const { context, link } = props;
    const { customization } = context;

    const target = link.to ? await resolveContentRef(link.to, context) : null;

    return (
        <HeaderLinkItem
            link={link}
            locale={context.locale}
            headerPreset={customization.header.preset}
            hasTarget={!!target}
            href={target?.href}
            isSiteAuthLoginHref={target ? isSiteAuthLoginHref(context.linker, target.href) : false}
            dropdownClassName={getHeaderLinkDropdownClassName(customization.styling.search)}
        >
            {link.links?.map((subLink, index) => (
                <SubHeaderLink key={index} {...props} link={subLink} />
            ))}
        </HeaderLinkItem>
    );
}

async function SubHeaderLink(props: {
    context: GitBookSiteContext;
    link: CustomizationContentLink;
}) {
    const { context, link } = props;

    const target = await resolveContentRef(link.to, context);

    if (!target) {
        return null;
    }

    return (
        <SubHeaderLinkItem
            link={link}
            locale={context.locale}
            href={target.href}
            isSiteAuthLoginHref={isSiteAuthLoginHref(context.linker, target.href)}
        />
    );
}
