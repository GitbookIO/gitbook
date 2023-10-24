import { tcls } from '@/lib/tailwind';
import { Space } from '@gitbook/api';

export function Footer(props: { space: Space }) {
    return (
        <div className={tcls('border-t', 'border-slate-200', 'bg-slate-50', 'py-8', 'px-4')}>
            <div />
        </div>
    );
}
