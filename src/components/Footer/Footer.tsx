import { tcls } from '@/lib/tailwind';
import { Revision, RevisionPageDocument, Space } from '@gitbook/api';
import { ThemeToggler } from '../ThemeToggler';
import React from 'react';
import { CONTAINER_MAX_WIDTH_NORMAL, CONTAINER_PADDING } from '../layout';
import { FooterLinksGroup } from './FooterLinksGroup';

export function Footer(props: {
    space: Space;
    revision: Revision;
    page: RevisionPageDocument;
    customization: any;
    asFullWidth: boolean;
}) {
    const { space, revision, page, customization, asFullWidth } = props;

    return (
        <div
            className={tcls(
                'border-t',
                'border-slate-200',
                'dark:border-slate-800',
                'bg-slate-50',
                'dark:bg-slate-900',
                'px-4',
            )}
        >
            <div
                className={tcls(
                    'flex',
                    'flex-row',
                    CONTAINER_PADDING,
                    asFullWidth ? null : [CONTAINER_MAX_WIDTH_NORMAL, 'mx-auto'],

                    'py-6',
                )}
            >
                <div className={tcls('flex-1', 'flex', 'flex-col', 'gap-4')}>
                    {customization.footer.logo && customization.footer.groups?.length > 0 ? (
                        <div className={tcls('flex', 'flex-row', 'gap-4')}>
                            {customization.footer.logo ? (
                                <div>
                                    <img
                                        src={customization.footer.logo.light}
                                        fetchPriority="low"
                                        className={tcls('dark:hidden')}
                                    />
                                    <img
                                        src={customization.footer.logo.dark}
                                        fetchPriority="low"
                                        className={tcls('hidden', 'dark:visible')}
                                    />
                                </div>
                            ) : null}

                            {customization.footer.groups.map((group, index) => (
                                <FooterLinksGroup
                                    key={index}
                                    group={group}
                                    context={{ space, revision, page }}
                                />
                            ))}
                        </div>
                    ) : null}
                    {customization.footer.copyright ? (
                        <p className={tcls('text-sm', 'text-slate-400')}>
                            {customization.footer.copyright}
                        </p>
                    ) : null}
                </div>
                <div>
                    <React.Suspense fallback={null}>
                        <ThemeToggler space={space} />
                    </React.Suspense>
                </div>
            </div>
        </div>
    );
}
