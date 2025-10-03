'use client';
import React from 'react';

export interface ToolbarControlsContextValue {
    minimize: () => void;
    closeSession?: () => void;
    closePersistent?: () => void;
}

const ToolbarControlsContext = React.createContext<ToolbarControlsContextValue | null>(null);

/*
 * Provides reusable state setters (mainly for hiding/showing the toolbar) for the toolbar controls propagated through to the children
 */
export function ToolbarControlsProvider(
    props: React.PropsWithChildren<{ value: ToolbarControlsContextValue | null }>
) {
    const { children, value } = props;
    return (
        <ToolbarControlsContext.Provider value={value}>{children}</ToolbarControlsContext.Provider>
    );
}

export function useToolbarControls() {
    return React.useContext(ToolbarControlsContext);
}
