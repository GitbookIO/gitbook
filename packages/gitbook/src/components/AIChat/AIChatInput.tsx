import { tcls } from '@/lib/tailwind';
import { Button } from '../primitives';

export function AIChatInput(props: {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
}) {
    const { value, onChange, onSubmit } = props;
    return (
        <div className="relative flex w-full">
            <textarea
                className={tcls(
                    'resize-none',
                    'bg-tint-base',
                    'rounded-md',
                    'circular-corners:rounded-2xl',
                    'flex-1',
                    'ring-1',
                    'ring-tint-subtle',
                    // 'border',
                    // 'border-tint-subtle',
                    'focus:outline-none',
                    'pl-4',
                    'pr-10',
                    'pt-3.5',
                    'pb-3.5',
                    'transition-all',
                    'focus:shadow-lg',
                    'focus:ring-primary',
                    'focus:ring-2',
                    'focus:shadow-tint-subtle'
                )}
                value={value}
                rows={1}
                placeholder="Ask, search, or take action..."
                onChange={(event) => {
                    onChange(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        onSubmit(value);
                    }
                }}
            />
            <Button
                icon="arrow-up"
                label="Send"
                iconOnly
                className="!px-2 -translate-y-1/2 absolute top-1/2 right-2"
            />
        </div>
    );
}
