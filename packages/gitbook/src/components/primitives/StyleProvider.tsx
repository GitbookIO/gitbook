'use client';
import type { ClassValue } from '@/lib/tailwind';
import React from 'react';

import { RecordCardStyles } from '../DocumentView/Table/styles';
import {
    PageLinkItemStyles,
    ToggleableLinkItemActiveStyles,
    ToggleableLinkItemStyles,
} from '../TableOfContents/styles';
import { ButtonStyles } from './Button';
import { CardStyles } from './Card';
import { linkStyles as LinkStyles } from './StyledLink';

export type DesignTokenName =
    | 'LinkStyles'
    | 'CardStyles'
    | 'ButtonStyles'
    | 'RecordCardStyles'
    | 'PageLinkItemStyles'
    | 'ToggleableLinkItemStyles'
    | 'ToggleableLinkItemActiveStyles';

const StyleContext = React.createContext<(names: DesignTokenName[]) => ClassValue[]>(() => []);

export function StyleProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const styles = React.useMemo(
        () =>
            ({
                LinkStyles,
                CardStyles,
                ButtonStyles,
                RecordCardStyles,
                PageLinkItemStyles,
                ToggleableLinkItemStyles,
                ToggleableLinkItemActiveStyles,
            }) as Record<DesignTokenName, ClassValue>,
        []
    );

    return (
        <StyleContext.Provider value={(names) => names.flatMap((name) => styles[name] || [])}>
            {children}
        </StyleContext.Provider>
    );
}

export function useClassnames(names: DesignTokenName[]): ClassValue[] {
    const context = React.useContext(StyleContext);
    if (!context) {
        throw new Error('useStyles must be used within a StyleProvider');
    }

    return context(names);
}
