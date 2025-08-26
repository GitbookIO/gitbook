'use client';

import type { ClientTOCPageGroup } from './encodeClientTableOfContents';

import { tcls } from '@/lib/tailwind';

import { PagesList } from './PagesList';
import { TOCPageIcon } from './TOCPageIcon';

export function PageGroupItem(props: { page: ClientTOCPageGroup }) {
    const { page } = props;

    return (
        <li className="group/page-group-item flex flex-col">
            <div
                className={tcls(
                    '-top-6 group-first/page-group-item:-mt-6 sticky z-1 flex items-center gap-3 px-3 pt-6',
                    'font-semibold text-xs uppercase tracking-wide',
                    'pb-3', // Add extra padding to make the header fade a bit nicer
                    '-mb-1.5', // Then pull the page items a bit closer, effective bottom padding is 1.5 units / 6px.
                    'mask-[linear-gradient(rgba(0,0,0,1)_70%,rgba(0,0,0,0))]', // Fade out effect of fixed page items. We want the fade to start past the header, this is a good approximation.
                    'bg-tint-base',
                    'sidebar-filled:bg-tint-subtle',
                    'theme-muted:bg-tint-subtle',
                    '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-subtle',
                    '[html.sidebar-filled.theme-muted_&]:bg-tint-base',
                    '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-base',
                    '[html.sidebar-default.theme-gradient_&]:bg-gradient-primary',
                    '[html.sidebar-default.theme-gradient.tint_&]:bg-gradient-tint'
                )}
            >
                <TOCPageIcon page={page} />
                {page.title}
            </div>
            {page.descendants && page.descendants.length > 0 ? (
                <PagesList pages={page.descendants} />
            ) : null}
        </li>
    );
}
