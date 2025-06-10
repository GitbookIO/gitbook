import { tcls } from '@/lib/tailwind';
import React from 'react';
import { useAskController } from './state';

export function AskInput() {
    const controller = useAskController();
    const [value, setValue] = React.useState('');

    return (
        <textarea
            className={tcls('resize-none', 'bg-tint-base', 'rounded-lg', 'm-2', 'p-2', 'flex-1')}
            value={value}
            placeholder="Ask a question..."
            onChange={(event) => {
                setValue(event.currentTarget.value);
            }}
            onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    controller.postMessage({
                        message: value,
                    });
                    setValue('');
                }
            }}
        />
    );
}
