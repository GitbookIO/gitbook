import * as React from 'react';
import { IconName, library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { far } from '@fortawesome/free-regular-svg-icons';
// import { fas } from '@fortawesome/free-solid-svg-icons';

import { far } from '@awesome.me/kit-a463935e93/icons';

// TODO: lazy load
library.add(far);

/**
 * Name of the icon component.
 */
export type { IconName };

/**
 * Style for the icon component.
 */
export type IconStyle = 'solid' | 'outline';

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

    return <FontAwesomeIcon icon={["far", icon]} fixedWidth className={'gb-icon ' + className} />
}
