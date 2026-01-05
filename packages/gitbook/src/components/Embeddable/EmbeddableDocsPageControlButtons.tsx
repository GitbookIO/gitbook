'use client';

import { tString, useLanguage } from '@/intl/client';
import { Button } from '../primitives';

export function EmbeddableDocsPageControlButtons(props: { href: string }) {
    const { href } = props;
    const language = useLanguage();

    return (
        <Button
            icon="arrow-up-right-from-square"
            label={tString(language, 'open_in_new_tab')}
            href={href}
            target="_blank"
            iconOnly
            variant="blank"
        />
    );
}
