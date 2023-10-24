import { pageHref } from "@/lib/links";
import { resolvePrevNextPages } from "@/lib/pages";
import { tcls } from "@/lib/tailwind";
import { Revision, RevisionPageDocument } from "@gitbook/api";
import Link from "next/link";

/**
 * Show cards to go to previous/next pages at the bottom.
 */
export function PageFooterNavigation(props: {
    revision: Revision;
    page: RevisionPageDocument;
}) {
    const { revision, page } = props;
    const { previous, next } = resolvePrevNextPages(revision, page);

    return (
        <div className={tcls('flex', 'flex-row', 'mt-6', 'gap-2')}>
            {previous ? (
                <NavigationCard
                    icon="P"
                    label="Previous"
                    title={previous.title}
                    href={pageHref(previous.path)}
                    reversed
                />
            ) : null}
            {next ? (
                <NavigationCard
                    icon="N"
                    label="Next"
                    title={next.title}
                    href={pageHref(next.path)}
                />
            ) : null}
        </div>
    )
}

function NavigationCard(props: {
    icon: React.ReactNode;
    label: string;
    title: string;
    href: string;
    reversed?: boolean;
}) {
    const { icon, label, title, href, reversed } = props;

    return (
        <Link href={href} className={tcls('group', 'flex', 'flex-1', reversed ? 'flex-row-reverse': 'flex-row', 'align-center', 'p-4', 'border', 'border-slate-200', 'rounded', 'hover:shadow', 'hover:border-primary-500')}>
            <span className={tcls('flex', 'flex-col', 'flex-1', reversed ? 'text-right' : null)}>
                <span className={tcls('text-xs', 'text-slate-400')}>{label}</span>
                <span className={tcls('text-base', 'text-slate-700', 'group-hover:text-primary-600')}>{title}</span>
            </span>
            <span className={tcls('group-hover:text-primary-600')}>
                {icon}
            </span>
        </Link>
    )
}
