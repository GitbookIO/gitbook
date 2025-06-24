'use client';

import * as React from 'react';
import { useAIPage } from '../AI';
import { SkeletonHeading, SkeletonParagraph } from '../primitives';
import { MessageInput } from './MessageInput';

export function AdaptivePage(props: {
    responseId?: string;
}) {
    const [inputValue, setInputValue] = React.useState('');
    const page = useAIPage({
        initialResponseId: props.responseId,
    });

    const onSubmit = (value: string) => {
        page.generate(value);
    };

    return (
        <div className="page-no-toc mx-16 mt-6 flex w-full max-w-3xl page-full-width:max-w-screen-2xl flex-row flex-wrap items-center gap-4 text-tint contrast-more:text-tint-strong">
            <div className="flex flex-col gap-4">
                <div>{page.body || <PageSkeleton />}</div>
                <div>
                    <MessageInput value={inputValue} onChange={setInputValue} onSubmit={onSubmit} />
                </div>
            </div>
        </div>
    );
}

function PageSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <SkeletonHeading />
            <SkeletonParagraph />
            <SkeletonParagraph />
            <SkeletonParagraph />
            <SkeletonParagraph />
        </div>
    );
}
