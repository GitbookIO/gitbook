import { tcls } from '@/lib/tailwind';

export function AIChatInput(props: {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
}) {
    const { value, onChange, onSubmit } = props;
    return (
        <textarea
            className={tcls(
                'resize-none',
                'bg-tint-base',
                'rounded-lg',
                'flex-1',
                'border',
                'border-tint-subtle',
                'px-4',
                'py-2'
            )}
            value={value}
            placeholder="Ask a question..."
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
    );
}
