'use client';

import type React from 'react';

import { Tooltip } from '@/components/primitives';

export function AnnotationPopover(props: { children: React.ReactNode; body: React.ReactNode }) {
    const { children, body } = props;

    return (
        <Tooltip
            label={body}
            contentProps={{
                role: 'definition',
            }}
            className="bg-tint-base px-4 py-3 text-sm text-tint-strong shadow-lg shadow-tint-12/4 ring-1 ring-tint-subtle dark:shadow-tint-1"
            arrow={true}
            arrowProps={{ className: 'fill-tint-1' }}
        >
            <dfn
                data-testid="annotation-button"
                className="cursor-help underline decoration-1 decoration-dotted underline-offset-2"
                // biome-ignore lint/a11y/noNoninteractiveTabindex: we want to be able to focus the definition to open the tooltip
                tabIndex={0}
            >
                {children}
            </dfn>
        </Tooltip>
    );
}
