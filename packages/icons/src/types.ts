import type { IconName as BasicIconName } from '@fortawesome/fontawesome-svg-core';

export enum IconStyle {
    // Regular
    Regular = 'regular',
    SharpRegular = 'sharp-regular',
    // Solid
    Solid = 'solid',
    SharpSolid = 'sharp-solid',
    // Duotone
    Duotone = 'duotone',
    SharpDuotoneSolid = 'sharp-duotone-solid',
    // Light
    Light = 'light',
    SharpLight = 'sharp-light',
    // Thin
    Thin = 'thin',
    SharpThin = 'sharp-thin',
}

type CustomIconName =
    | 'gitbook'
    | 'gitbook-assistant'
    | 'cursor'
    | 'vscode'
    | 'mcp'
    | 'chatgpt'
    | 'claude';

export type IconName = BasicIconName | CustomIconName;
