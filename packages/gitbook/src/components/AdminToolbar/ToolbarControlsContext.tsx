'use client';
import React from 'react';

export interface ToolbarControlsContextValue {
    minimize: () => void;
    closeSession?: () => void;
    closePersistent?: () => void;
}

const ToolbarControlsContext = React.createContext<ToolbarControlsContextValue | null>(null);

export function ToolbarControlsProvider(
    props: React.PropsWithChildren<{ value: ToolbarControlsContextValue | null }>
) {
    const { children, value } = props;
    return <ToolbarControlsContext.Provider value={value}>{children}</ToolbarControlsContext.Provider>;
}

export function useToolbarControls() {
    return React.useContext(ToolbarControlsContext);
}
