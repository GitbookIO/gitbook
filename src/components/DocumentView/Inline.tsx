import { ClassValue } from 'clsx';

export interface InlineProps<T> {
    inline: T;

    /**
     * If defined, replace the content of the inline.
     */
    children?: React.ReactNode;
}

export function Inline<T>(props: InlineProps<T>) {
    const { inline } = props;

    switch (inline.type) {
        default:
            return <span>Unsupported inline {inline.type}</span>;
    }
}
