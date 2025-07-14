'use client';

import * as React from 'react';

import { getIconAssetURL, useIcons } from './IconsProvider';
import { getIconStyle } from './getIconStyle';
import type { IconName, IconStyle } from './types';

/**
 * Props for the icon component.
 */
export type IconProps = React.SVGProps<SVGSVGElement> & {
    /**
     * Name of the icon to render.
     */
    icon: IconName;

    /**
     * Style of the icon to render. Defaults to the current icon style from the context.
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
    ref: React.Ref<SVGSVGElement>
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
                //@ts-ignore // For compatibility with older browsers
                '-webkit-mask-image': `url(${url})`,
                maskRepeat: 'no-repeat',
                '-webkit-mask-repeat': 'no-repeat',
                maskPosition: 'center',
                '-webkit-mask-position': 'center',
                ...(size ? { width: size, height: size } : {}),
                ...rest.style,
            }}
            className={`gb-icon ${className}`}
        />
    );
});
