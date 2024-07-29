'use client';

import * as React from 'react';

import { IconStyle } from './types';
import { IconProps } from './Icon';
import { getIconStyle } from './getIconStyle';
import { getAssetURL, IconsContextType, useIcons } from './IconsProvider';

export interface IconSpriteProps extends IconProps {}

const loadedStyles = new Set<string>();

/**
 * Renders an icon using a common sprite.
 * This method is more efficient when rendering a large set of icons.
 */
export function IconSprite(props: IconSpriteProps) {
    const { className = '' } = props;

    const context = useIcons();
    const [iconStyle, icon] = getIconStyle(props.iconStyle ?? context.iconStyle, props.icon);

    if (typeof window !== 'undefined') {
        loadSprite(context, iconStyle);
    }

    const id = getIDPrefix(iconStyle) + icon;

    return (
        <svg className={'gb-icon-s ' + className}>
            <use xlinkHref={`#${id}`} />
        </svg>
    );
}

function loadSprite(context: IconsContextType, style: string) {
    if (loadedStyles.has(style)) {
        return;
    }
    loadedStyles.add(style);

    const url = getAssetURL(context, `sprites/${style}.svg`);

    fetch(url)
        .then((response) => response.text())
        .then((svg) => {
            // To ensure the sprite IDs don't conflict with the page's IDs, we prefix them
            const idPrefix = getIDPrefix(style);
            const idRegex = new RegExp(`id="([^"]+)"`, 'g');
            svg = svg.replace(idRegex, (_, id) => `id="${idPrefix}${id}"`);

            // Then we insert in the DOM
            const div = document.createElement('div');
            div.style.display = 'none';
            div.innerHTML = svg;
            document.body.appendChild(div);
        })
        .catch((error) => {
            console.error(`Failed to load icon sprite: ${url}`, error);
        });
}

function getIDPrefix(style: string) {
    return `gbi-${style}-`;
}