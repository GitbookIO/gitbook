import * as React from 'react';

import { IconName, IconStyle } from './types';
import { getAssetURL } from './assets';
import { getIconStyle } from './getIconStyle';

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
    const { className } = props;

    const [iconStyle, icon] = getIconStyle(props.iconStyle ?? IconStyle.Regular, props.icon);
    const url = getAssetURL(`svgs/${iconStyle}/${icon}.svg`);

    return (
        <svg
            style={{
                maskImage: `url(${url})`,
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
            }}
            className={'gb-icon ' + className}
        ></svg>
    );
}
