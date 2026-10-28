'use client';

import { Button } from '../primitives';
import { tString, useLanguage } from '@/intl/client';

export function EmbeddableDocsPageControlButtons(props: { href: string }) {
    const { href } = props;
    const language = useLanguage();

    return (
        <Button
            icon="arrow-up-right-from-square"
            data-testid="embed-docs-page-open-in-new-tab"
            className="hover:bg-tint-hover theme-bold:text-header-link hover:theme-bold:bg-header-link/3 hover:theme-bold:text-header-link"
            label={tString(language, 'open_in_new_tab')}
            href={href}
            target="_blank"
            iconOnly
            variant="blank"
        />
    );
}
