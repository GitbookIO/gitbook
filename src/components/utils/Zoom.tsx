'use client';

import ReactZoom, { UncontrolledProps } from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

/**
 * Client component to zoom on an image.
 * See https://github.com/rpearce/react-medium-image-zoom
 */
export function Zoom(props: UncontrolledProps) {
    return <ReactZoom {...props} />;
}
