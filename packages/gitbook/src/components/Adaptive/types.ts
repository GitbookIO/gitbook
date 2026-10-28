export type AdaptiveVisitorClaimsData = Record<string, unknown> & {
    unsigned: Record<string, unknown>;
};

export type AdaptiveVisitorClaims = {
    visitor: {
        claims: AdaptiveVisitorClaimsData;
    };
};
