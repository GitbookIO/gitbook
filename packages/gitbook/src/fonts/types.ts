export interface FontFaceData {
    weight: string;
    style: string;
    /** Path under `~gitbook/static/fonts`. */
    file: string;
    unicodeRange?: string;
    ascentOverride?: string;
}

/** Where `scripts/download-fonts.ts` fetches (or copies) each file from, keyed by its path. */
export type FontSourcesData = Record<string, string>;

export interface FontFallbackFaceData {
    family: string;
    local: string;
    ascentOverride: string;
    descentOverride: string;
    lineGapOverride: string;
    sizeAdjust: string;
}

export interface FontFamilyData {
    family: string;
    variable: string;
    /** Full value for the CSS variable, fallbacks included. */
    fontFamilyValue: string;
    faces: FontFaceData[];
    fallbackFace: FontFallbackFaceData | null;
}

export type FontFacesData = Record<string, FontFamilyData>;
