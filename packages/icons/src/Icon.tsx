import * as React from 'react';

import { IconName, IconStyle } from './types';
import { IconSprite } from './IconSprite';

/**
 * Props for the icon component.
 */
export interface IconProps {
    /**
     * Name of the icon to render.
     */
    icon: IconName;

    /**
     * Style of the icon to render.
     * @default 'solid'
     */
    iconStyle?: IconStyle;

    /**
     * Class name to apply to the icon.
     */
    className?: string;
}

/**
 * Renders an icon component from the library.
 */
export function Icon(props: IconProps) {
    const { icon, iconStyle = 'solid', className } = props;

    return (
        <IconSprite {...props} />
    );
}
