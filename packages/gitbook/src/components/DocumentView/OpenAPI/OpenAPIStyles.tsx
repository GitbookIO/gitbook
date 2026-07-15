'use client';

import { createLazyStylesheet } from '../createLazyStylesheet';

/**
 * Lazy-loads the OpenAPI/Scalar stylesheet. Kept out of the static import graph so the
 * ~148KB Scalar CSS only downloads on pages that actually render an OpenAPI block.
 */
export default createLazyStylesheet(() => import('./style.css'));
