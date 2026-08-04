'use client';

import { useSelect } from '@/components/Select';
import { slugifySelectValue } from '@/lib/select';
import { Button, type ButtonProps } from '../primitives';

/**
 * Renders a "Select" button action: clicking it activates the slug derived from `value`, so any
 * block containing that slug (tabs, and future consumers) switches to it. This is what turns cards
 * into content switchers.
 */
export function SelectActionButton(props: { value: string; buttonProps: ButtonProps }) {
    const { value, buttonProps } = props;
    const { activate } = useSelect();
    const slug = slugifySelectValue(value);
    const label = `Select "${slug}"`;
    return (
        <Button {...buttonProps} disabled={!slug} onClick={() => activate(slug)} label={label}>
            {label !== buttonProps.label ? buttonProps.label : null}
        </Button>
    );
}
