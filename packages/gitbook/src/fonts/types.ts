/** Which of the document's font variables a picked family is bound to. */
export type FontRole = 'content' | 'heading' | 'mono';

export interface FontVariantData {
    weight: string;
    style: string;
    /** Path under `~gitbook/static/fonts`, index-aligned with the family's `subsets`. */
    files: string[];
}

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
    /** `unicode-range` per subset. Held once per family rather than repeated on every variant. */
    subsets: string[];
    variants: FontVariantData[];
    fallbackFace: FontFallbackFaceData | null;
    /** Applied to every face of the family. */
    ascentOverride?: string;
}

export type FontFacesData = Record<string, FontFamilyData>;

/** Where `scripts/download-fonts.ts` fetches (or copies) each file from. */
export interface FontSourcesData {
    /** Hash of definitions.ts at generation time, used to detect a stale manifest. */
    definitionsHash: string;
    google: Record<string, { prefix: string; files: string[] }>;
    local: Record<string, string>;
}
