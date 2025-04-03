'use client';
import React from 'react';

import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import { tcls } from '@/lib/tailwind';
import { Button } from '../primitives';
import { AIPageNextRecommendedPages } from './AIPageNextRecommendedPages';
import { AIPageTopics } from './AIPageTopics';
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
            <div className="sticky top-28 my-4 flex flex-col rounded-md bg-tint-subtle theme-gradient:bg-tint-1/1 p-4">
                <div className="flex items-center gap-2 pb-2">
                    <div className="flex grow flex-col gap-1">
                        <h2
                            className={tcls(
                                'flex-1',
                                'text-xs',
                                'tracking-wide',
                                'font-semibold',
                                'uppercase'
                            )}
                        >
                            Recommended
                        </h2>
                        <p className="text-tint text-xs">Based on your context</p>
                    </div>
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
                <div className="flex flex-col gap-6">
                    <AIPageTopics spaceId={spaceId} pageId={pageId} revisionId={revisionId} />
                    <AIPageNextRecommendedPages
                        spaceId={spaceId}
                        pageId={pageId}
                        revisionId={revisionId}
                    />
                    {/* <AIPageRecommendedQuestions
                        spaceId={spaceId}
                        pageId={pageId}
                        revisionId={revisionId}
                    /> */}
                </div>
            </div>
        </div>
    );
}
