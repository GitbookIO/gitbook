'use client';

import { tString, useLanguage } from '@/intl/client';
import { Button } from '../primitives';

export function EmbeddableDocsPageControlButtons(props: { href: string }) {
    const { href } = props;
    const language = useLanguage();

    return (
        <Button
            icon="arrow-up-right-from-square"
            data-testid="embed-docs-page-open-in-new-tab"
            className="theme-bold:text-header-link hover:bg-tint-hover hover:theme-bold:bg-header-link/3 hover:theme-bold:text-header-link"
            label={tString(language, 'open_in_new_tab')}
            href={href}
            target="_blank"
            iconOnly
            variant="blank"
        />
    );
}
