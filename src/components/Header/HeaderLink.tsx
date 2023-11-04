import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';
import { Revision, RevisionPageDocument, Space } from '@gitbook/api';
import Link from 'next/link';
import IconChevronDown from '@geist-ui/icons/chevrondown';

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
            {link.links?.length > 0 ? (
                <IconChevronDown className={tcls('w-4', 'h-4', 'ms-2')} />
            ) : null}
        </Link>
    );

    if (link.links?.length > 0) {
        return (
            <div className={tcls('group/headerlink', 'relative')}>
                {innerLink}
                <div
                    className={tcls(
                        'absolute',
                        'top-full',
                        'hidden',
                        'group-hover/headerlink:flex',
                    )}
                >
                    <div
                        className={tcls(
                            'mt-3',
                            'w-36',
                            'max-h-48',
                            'bg-white',
                            'rounded',
                            'p-2',
                            'shadow',
                            'overflow-auto',
                        )}
                    >
                        {link.links.map((subLink, index) => (
                            <SubHeaderLink key={index} {...props} link={subLink} />
                        ))}
                    </div>
                </div>
            </div>
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

    return (
        <Link
            href={target.href}
            className={tcls(
                'flex',
                'flex-row',
                'items-center',
                'text-base',
                'text-slate-700',
                'px-2',
                'py-1',
                'rounded',
                target.active ? ['bg-primary-50'] : ['hover:bg-slate-100'],
            )}
        >
            {link.title}
        </Link>
    );
}
