'use client';

import * as React from 'react';

import { IconName, IconStyle } from './types';
import { getIconStyle } from './getIconStyle';
import { getIconAssetURL, useIcons } from './IconsProvider';

/**
 * Props for the icon component.
 */
export type IconProps = React.SVGProps<SVGSVGElement> & {
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

    /**
     * Size of the icon.
     * If none is defined, the size should be defined using CSS / class name.
     */
    size?: number;
};

/**
 * Renders an icon component from the library.
 * The icon is loaded as a standalone image.
 */
export const Icon = React.forwardRef(function Icon(
    props: IconProps,
    ref: React.Ref<SVGSVGElement>,
) {
    const context = useIcons();
    const {
        icon: propIcon,
        iconStyle: propIconStyle = context.iconStyle,
        className = '',
        size,
        ...rest
    } = props;

    const [iconStyle, icon] = getIconStyle(propIconStyle, propIcon);
    const url = getIconAssetURL(context, iconStyle, icon);

    return (
        <svg
            ref={ref}
            {...rest}
            style={{
                maskImage: `url(${url})`,
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                ...(size ? { width: size, height: size } : {}),
                ...rest.style,
            }}
            className={'gb-icon ' + className}
        ></svg>
    );
});
