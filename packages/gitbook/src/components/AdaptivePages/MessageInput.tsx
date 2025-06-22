import { tcls } from '@/lib/tailwind';

export function MessageInput(props: {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
}) {
    const { value, onChange, onSubmit } = props;
    return (
        <textarea
            className={tcls('resize-none', 'bg-tint-base', 'rounded-lg', 'm-2', 'p-2', 'flex-1')}
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
