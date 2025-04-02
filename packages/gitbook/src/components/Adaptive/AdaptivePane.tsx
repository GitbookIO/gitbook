'use client';
import React from 'react';

import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import { tcls } from '@/lib/tailwind';
import Link from 'next/link';
import { Button } from '../primitives';
import { useAdaptivePane } from './state';

export function AdaptivePane(props: { spaceId: string; revisionId: string; pageId: string }) {
    const language = useLanguage();
    const { opened, open, close } = useAdaptivePane();

    const { spaceId, revisionId, pageId } = props;

    React.useEffect(() => {
        if (opened) {
            document.body.classList.add('adaptive-pane');
        } else {
            document.body.classList.remove('adaptive-pane');
        }
    }, [opened]);

    const pages = [
        'GitBook Documentation',
        'GitHub & GitLab Sync',
        'Troubleshooting',
        'Version control',
    ];

    return (
        <div className={tcls('w-80 flex-col text-sm', opened ? 'flex' : 'hidden')}>
            <div className="sticky top-28 my-4 flex flex-col gap-2 rounded-md border border-tint-subtle bg-tint-subtle theme-gradient:bg-tint-1/1 p-4">
                <div className='flex items-center gap-2 border-tint-subtle border-b pb-2'>
                    <h2
                        className={tcls(
                            'flex-1',
                            'text-xs',
                            'tracking-wide',
                            'font-semibold',
                            'uppercase'
                        )}
                    >
                        History
                    </h2>
                    <Button
                        iconOnly
                        variant="blank"
                        size="medium"
                        icon={opened ? 'chevrons-right' : 'chevrons-left'}
                        label={
                            opened
                                ? tString(language, 'adaptive_pane_close')
                                : tString(language, 'adaptive_pane_open')
                        }
                        onClick={() => {
                            close();
                        }}
                    />
                </div>
                <div>
                    <ol className="-mx-2 flex flex-col gap-0.5 text-tint-subtle">
                        {pages.map((page) => (
                            <li key={page}>
                                <Link
                                    className="block rounded px-2 py-1.5 last:bg-primary-hover hover:bg-primary-hover"
                                    href="#"
                                >
                                    {page}
                                </Link>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
}
