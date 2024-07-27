'use client';

import * as React from 'react';

import { IconName, IconStyle } from './types';
import { getIconStyle } from './getIconStyle';
import { getAssetURL, useIcons } from './IconsProvider';

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
 * The icon is loaded as a standalone image.
 */
export function Icon(props: IconProps) {
    const { className = '' } = props;

    const context = useIcons();
    const [iconStyle, icon] = getIconStyle(props.iconStyle ?? context.iconStyle, props.icon);
    const url = getAssetURL(context, `svgs/${iconStyle}/${icon}.svg`);

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
