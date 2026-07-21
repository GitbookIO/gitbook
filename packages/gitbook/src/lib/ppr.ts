export type SiteRouteType = 'dynamic' | 'static' | 'ppr';

/**
 * Keep the PPR rollout limited to ordinary static document pages.
 */
export function getPPRRouteType(
    routeType: SiteRouteType,
    isPPRPage: boolean | undefined,
    hasPPRRouteCookie: boolean
): SiteRouteType {
    return routeType === 'static' && isPPRPage && hasPPRRouteCookie ? 'ppr' : routeType;
}
