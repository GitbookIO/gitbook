import { CustomizationSettings, Revision, RevisionPageDocument, Space } from '@gitbook/api';
import React from 'react';

import { Image } from '@/components/utils';
import { tcls } from '@/lib/tailwind';

import { FooterLinksGroup } from './FooterLinksGroup';
import { CONTAINER_MAX_WIDTH_NORMAL, CONTAINER_PADDING } from '../layout';
import { ThemeToggler } from '../ThemeToggler';

export function Footer(props: {
    space: Space;
    revision: Revision;
    page: RevisionPageDocument;
    customization: CustomizationSettings;
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
                <div className={tcls('flex-1', 'flex', 'flex-col', 'gap-6')}>
                    {customization.footer.logo || customization.footer.groups?.length > 0 ? (
                        <div className={tcls('flex', 'flex-row', 'gap-20')}>
                            {customization.footer.logo ? (
                                <div>
                                    <Image
                                        alt="Logo"
                                        src={customization.footer.logo}
                                        fetchPriority="low"
                                        style={['h-9', 'max-w-80']}
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
                {customization.themes.toggeable ? (
                    <div>
                        <React.Suspense fallback={null}>
                            <ThemeToggler space={space} />
                        </React.Suspense>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
