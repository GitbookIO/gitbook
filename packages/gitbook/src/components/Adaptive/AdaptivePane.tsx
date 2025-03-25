'use client';
import React from 'react';

import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import { tcls } from '@/lib/tailwind';
import { Button } from '../primitives';
import { useAdaptivePane } from './state';

export function AdaptivePane() {
    const language = useLanguage();
    const { opened, open, close } = useAdaptivePane();

    React.useEffect(() => {
        if (opened) {
            document.body.classList.add('adaptive-pane');
        } else {
            document.body.classList.remove('adaptive-pane');
        }
    }, [opened]);

    return (
        <div className={tcls('w-80 flex-col', opened ? 'flex' : 'hidden')}>
            <div className="sticky top-28 flex flex-col gap-4 py-4">
                <div className="flex items-center gap-2">
                    <h2
                        className={tcls(
                            'flex-1',
                            'text-xs',
                            'tracking-wide',
                            'font-semibold',
                            'uppercase'
                        )}
                    >
                        {tString(language, 'adaptive_pane_title')}
                    </h2>
                    <Button
                        iconOnly
                        variant="blank"
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
            </div>
        </div>
    );
}
