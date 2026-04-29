'use client';

import * as React from 'react';

import { getIconAssetURL, useIcons } from './IconsProvider';
import { getIconStyle } from './getIconStyle';
import { getIconMetrics } from './iconMetrics';
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
        viewBox: propViewBox,
        ...rest
    } = props;

    const [iconStyle, icon] = getIconStyle(propIconStyle, propIcon);
    const url = getIconAssetURL(context, iconStyle, icon);
    const metrics = getIconMetrics(iconStyle, icon);
    const maskId = React.useId();
    const originalViewBox = metrics?.originalViewBox;
    const safeViewBox = metrics?.safeViewBox;

    return (
        <svg
            ref={ref}
            {...rest}
            viewBox={propViewBox ?? (originalViewBox ? originalViewBox.join(' ') : undefined)}
            style={{
                ...(size ? { width: size, height: size } : {}),
                ...(metrics ? { overflow: 'visible' } : {}),
                ...rest.style,
            }}
            className={`gb-icon ${className}`}
        >
            <title>{icon}</title>
            <defs>
                <mask
                    id={maskId}
                    maskUnits={metrics ? 'userSpaceOnUse' : undefined}
                    maskContentUnits={metrics ? 'userSpaceOnUse' : undefined}
                    x={safeViewBox?.[0]}
                    y={safeViewBox?.[1]}
                    width={safeViewBox?.[2]}
                    height={safeViewBox?.[3]}
                    style={{
                        maskType: 'alpha',
                    }}
                >
                    <image
                        data-testid="mask-image"
                        href={url}
                        x={safeViewBox?.[0] ?? 0}
                        y={safeViewBox?.[1] ?? 0}
                        width={safeViewBox?.[2] ?? '100%'}
                        height={safeViewBox?.[3] ?? '100%'}
                        preserveAspectRatio={metrics ? 'none' : 'xMidYMid meet'}
                    />
                </mask>
            </defs>
            <rect
                x={safeViewBox?.[0] ?? 0}
                y={safeViewBox?.[1] ?? 0}
                width={safeViewBox?.[2] ?? '100%'}
                height={safeViewBox?.[3] ?? '100%'}
                fill="currentColor"
                mask={`url(#${maskId})`}
            />
        </svg>
    );
});
