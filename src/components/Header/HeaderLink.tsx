import {
    CustomizationContentLink,
    CustomizationHeaderLink,
    Revision,
    RevisionPageDocument,
    Space,
} from '@gitbook/api';
import Link from 'next/link';

import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import {
    Dropdown,
    DropdownButtonProps,
    DropdownChevron,
    DropdownMenu,
    DropdownMenuItem,
} from './Dropdown';

export async function HeaderLink(props: {
    space: Space;
    revision: Revision;
    page: RevisionPageDocument;
    link: CustomizationHeaderLink;
}) {
    const { space, revision, page, link } = props;

    const target = await resolveContentRef(link.to, {
        space,
        revision,
        page,
    });

    if (!target) {
        return null;
    }

    const renderLink = (linkProps: DropdownButtonProps<HTMLAnchorElement>) => (
        <Link
            {...linkProps}
            href={target.href}
            className={tcls(
                'flex',
                'flex-row',
                'items-center',
                'text-base',
                'text-header-link-500',
                'px-2',
                'py-1',
                'rounded',
                target.active ? ['bg-header-background-300'] : ['hover:text-header-link-700'],
            )}
        >
            {link.title}
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
    space: Space;
    revision: Revision;
    page: RevisionPageDocument;
    link: CustomizationContentLink;
}) {
    const { space, revision, page, link } = props;

    const target = await resolveContentRef(link.to, {
        space,
        revision,
        page,
    });

    if (!target) {
        return null;
    }

    return <DropdownMenuItem href={target.href}>{link.title}</DropdownMenuItem>;
}
