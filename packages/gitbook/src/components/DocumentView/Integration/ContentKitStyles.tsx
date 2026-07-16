'use client';

import { createLazyStylesheet } from '../createLazyStylesheet';

/**
 * Lazy-loads the ContentKit stylesheet so it only downloads on pages that actually render
 * an integration block, instead of shipping in every page's CSS chunk.
 */
export default createLazyStylesheet(() => import('./contentkit.css'));
