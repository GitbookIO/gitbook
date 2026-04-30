'use client';

import * as React from 'react';

import { IconSymbolLoader } from './IconSymbolLoader';
import { getIconAssetURL, getIconSpriteAssetURL, useIcons } from './IconsProvider';
import { getIconStyle } from './getIconStyle';
import { getIconSymbolId, prefetchServerIconAsset, registerServerIconSymbol } from './symbols';
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
    const maskId = React.useId();
    const iconInstanceId = React.useId();
    const symbolId = getIconSymbolId(iconStyle, icon);
    const iconAssetURL = getIconAssetURL(context, iconStyle, icon);
    const iconSpriteAssetURL = getIconSpriteAssetURL(context, iconStyle);

    if (context.renderMode === 'symbol') {
        prefetchServerIconAsset(iconSpriteAssetURL);
        registerServerIconSymbol({
            style: iconStyle,
            icon,
            symbolId,
        });

        return (
            <svg
                ref={ref}
                {...rest}
                viewBox="0 0 512 512"
                data-gb-icon-instance={iconInstanceId}
                style={{
                    overflow: 'visible',
                    ...(size ? { width: size, height: size } : {}),
                    ...rest.style,
                }}
                className={`gb-icon ${className}`}
            >
                <title>{icon}</title>
                <use data-testid="symbol-use" href={`#${symbolId}`} width="100%" height="100%" />
                {context.symbolLoaderURL ? (
                    <IconSymbolLoader
                        instanceId={iconInstanceId}
                        symbolId={symbolId}
                        style={iconStyle}
                        icon={icon}
                        loaderURL={context.symbolLoaderURL}
                    />
                ) : null}
            </svg>
        );
    }

    return (
        <svg
            ref={ref}
            {...rest}
            style={{
                ...(size ? { width: size, height: size } : {}),
                ...rest.style,
            }}
            className={`gb-icon ${className}`}
        >
            <title>{icon}</title>
            <defs>
                <mask
                    id={maskId}
                    style={{
                        maskType: 'alpha',
                    }}
                >
                    <image
                        data-testid="mask-image"
                        href={iconAssetURL}
                        width="100%"
                        height="100%"
                        preserveAspectRatio="xMidYMid meet"
                    />
                </mask>
            </defs>
            <rect width="100%" height="100%" fill="currentColor" mask={`url(#${maskId})`} />
        </svg>
    );
});
