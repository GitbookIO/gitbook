'use client';

import * as React from 'react';

import { IconStyle } from './types';
import { IconProps } from './Icon';
import { getAssetURL } from './assets';
import { getIconStyle } from './getIconStyle';

export interface IconSpriteProps extends IconProps {}

const loadedStyles = new Set<IconStyle>();

/**
 * Renders an icon using a common sprite.
 * This method is more efficient when rendering a large set of icons.
 */
export function IconSprite(props: IconSpriteProps) {
    const { icon, iconStyle = IconStyle.Regular, className = '' } = props;

    const parsed = getIconStyle(iconStyle, icon);

    if (typeof window !== 'undefined') {
        loadSprite(parsed[0]);
    }

    const id = getIDPrefix(parsed[0]) + parsed[1];

    return (
        <svg className={'gb-icon ' + className}>
            <use xlinkHref={`#${id}`} />
        </svg>
    );
}

function loadSprite(style: IconStyle) {
    if (loadedStyles.has(style)) {
        return;
    }
    loadedStyles.add(style);

    const url = getAssetURL(`sprites/${style}.svg`);

    fetch(url)
    .then(response => response.text())
    .then(svg => {
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
    })
}


function getIDPrefix(style: IconStyle) {
    return `gbi-${style}-`;
}