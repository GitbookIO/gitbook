import * as React from 'react';
import type * as allSolid from '@heroicons/react/24/solid';
import { toCamel, ToSnake } from 'ts-case-convert/lib/caseConvert';

/**
 * Extracts the icon name from the component name.
 * For example 'AdjustmentsVerticalIcon' becomes 'adjustments-vertical'
 */
type IconNameFromComponentName<ComponentName extends string> =
    ComponentName extends `${infer Prefix}Icon` ? ToSnake<Prefix> : never;

type IconComponentName = keyof typeof allSolid;

type IconComponent = (typeof allSolid)[keyof typeof allSolid];

/**
 * Name of the icon component.
 */
export type IconName = IconNameFromComponentName<IconComponentName>;

/**
 * Style for the icon component.
 */
export type IconStyle = 'solid' | 'outline';

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
    const IconComponent = getIconComponent(icon, iconStyle);

    return (
        <React.Suspense fallback={<span className={className} />}>
            <IconComponent className={className} />
        </React.Suspense>
    );
}

/**
 * Lazy-loads the icon component from the specified style.
 */
const iconStyles: Record<IconStyle, () => Promise<typeof allSolid>> = {
    solid: () => import('@heroicons/react/24/solid'),
    outline: () => import('@heroicons/react/24/outline'),
};

const iconComponents: Record<IconStyle, { [name in IconName]?: IconComponent }> = {
    solid: {},
    outline: {},
};

function getIconComponent(icon: IconName, iconStyle: IconStyle) {
    if (!iconComponents[iconStyle][icon]) {
        iconComponents[iconStyle][icon] = React.lazy(() =>
            // @ts-ignore
            iconStyles[iconStyle]().then((style) => style[getIconComponentName(icon)]),
        );
    }
    return iconComponents[iconStyle][icon];
}

function getIconComponentName(icon: IconName): IconComponentName {
    return `${toCamel(icon)}Icon` as IconComponentName;
}
