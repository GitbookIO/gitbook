import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';
import { Revision, RevisionPageDocument, Space } from '@gitbook/api';
import Link from 'next/link';
import { Dropdown, DropdownChevron, DropdownMenu, DropdownMenuItem } from './Dropdown';

export async function HeaderLink(props: {
    space: Space;
    revision: Revision;
    page: RevisionPageDocument;
    link: any;
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

    const innerLink = (
        <Link
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
            {link.links?.length > 0 ? <DropdownChevron /> : null}
        </Link>
    );

    if (link.links?.length > 0) {
        return (
            <Dropdown
                dropdown={
                    <DropdownMenu>
                        {link.links.map((subLink, index) => (
                            <SubHeaderLink key={index} {...props} link={subLink} />
                        ))}
                    </DropdownMenu>
                }
            >
                {innerLink}
            </Dropdown>
        );
    }

    return innerLink;
}

async function SubHeaderLink(props: {
    space: Space;
    revision: Revision;
    page: RevisionPageDocument;
    link: any;
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
