// Regenerates the committed font manifest from the Google Fonts CSS API. download-fonts.ts runs it
// automatically when definitions.ts changed since the last generation; `bun run generate:fonts`
// forces it (e.g. to pick up new Google Fonts releases).
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ABC_FAVORIT, FONT_DEFINITIONS, type FontDefinition } from '../src/fonts/definitions';
import type {
    FontFacesData,
    FontFallbackFaceData,
    FontSourcesData,
    FontVariantData,
} from '../src/fonts/types';
import { getFontDefinitionsHash } from './font-definitions-hash';

// Google Fonts picks the file format from the user agent — the same modern Chrome `next/font` sends,
// so we keep getting compact woff2 (and vector rather than bitmap emoji).
const USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36';

// The precalculated metrics `next/font/google` uses, so the fallback faces stay identical.
const { calculateSizeAdjustValues } = createRequire(import.meta.url)(
    'next/dist/server/font-utils'
) as {
    calculateSizeAdjustValues: (family: string) => {
        ascent: string;
        descent: string;
        lineGap: string;
        fallbackFont: string;
        sizeAdjust: string;
    };
};

type ResolvedFace = {
    weight: string;
    style: string;
    file: string;
    source: string;
    unicodeRange: string;
};

const scriptDir = dirname(fileURLToPath(import.meta.url));
const faces: FontFacesData = {};
const sources: FontSourcesData = {
    definitionsHash: await getFontDefinitionsHash(),
    google: {},
    local: {},
};

for (const [name, definition] of Object.entries(FONT_DEFINITIONS)) {
    const resolved = definition.googleId
        ? await getGoogleFaces(definition)
        : await getABCFavoritFaces();

    if (resolved.length === 0) {
        throw new Error(`No font faces resolved for ${name}`);
    }

    recordSources(definition, resolved);

    const subsets = [...new Set(resolved.map((face) => face.unicodeRange))];
    const variants = new Map<string, FontVariantData>();

    for (const face of resolved) {
        const key = `${face.weight}|${face.style}`;
        let variant = variants.get(key);
        if (!variant) {
            variant = { weight: face.weight, style: face.style, files: [] };
            variants.set(key, variant);
        }
        variant.files[subsets.indexOf(face.unicodeRange)] = face.file;
    }

    faces[name] = {
        family: definition.family,
        variable: definition.variable,
        fontFamilyValue: [
            `"${definition.family}"`,
            ...(definition.adjustFallback ? [`"${definition.family} Fallback"`] : []),
            ...definition.fallback,
        ].join(','),
        subsets,
        variants: [...variants.values()],
        fallbackFace: definition.adjustFallback ? getFallbackFace(name, definition.family) : null,
        ...(definition.googleId ? {} : { ascentOverride: ABC_FAVORIT.ascentOverride }),
    };
}

const generatedDir = join(scriptDir, '../src/fonts/generated');
await writeFile(join(generatedDir, 'faces.json'), `${JSON.stringify(faces, null, 4)}\n`);
await writeFile(join(generatedDir, 'sources.json'), `${JSON.stringify(sources, null, 4)}\n`);

/** Google serves every file of a family from one versioned directory, so only the names differ. */
function recordSources(definition: FontDefinition, resolved: ResolvedFace[]) {
    if (!definition.googleId) {
        for (const face of resolved) {
            sources.local[face.file] = face.source;
        }
        return;
    }

    const prefixes = new Set(
        resolved.map((face) => face.source.slice(0, face.source.lastIndexOf('/')))
    );
    if (prefixes.size !== 1) {
        throw new Error(`${definition.family} spans several Google Fonts directories`);
    }

    sources.google[definition.googleId] = {
        prefix: [...prefixes][0] as string,
        files: [...new Set(resolved.map((face) => basename(face.file)))],
    };
}

async function getGoogleFaces(definition: FontDefinition): Promise<ResolvedFace[]> {
    const { family, googleId, weights } = definition;
    const url = `https://fonts.googleapis.com/css2?family=${family.replaceAll(' ', '+')}:wght@${weights.join(';')}&display=swap`;

    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!response.ok) {
        throw new Error(`Unable to fetch ${family} from Google Fonts: ${response.status} (${url})`);
    }

    const resolved = [...(await response.text()).matchAll(/@font-face\s*\{([^}]*)\}/g)].map(
        (match) => {
            const block = match[1] ?? '';
            const source = read(block, 'src')?.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
            const weight = read(block, 'font-weight');
            const unicodeRange = read(block, 'unicode-range');

            if (!source || !weight || !unicodeRange) {
                throw new Error(`Unexpected @font-face for ${family}: ${block}`);
            }

            return {
                weight,
                style: read(block, 'font-style') ?? 'normal',
                // Google's filenames are content-addressed, so the asset can stay immutable.
                file: `${googleId}/${basename(new URL(source).pathname)}`,
                source,
                unicodeRange: unicodeRange.toLowerCase(),
            };
        }
    );

    const missing = weights.filter((weight) => !resolved.some((face) => face.weight === weight));
    if (missing.length > 0) {
        throw new Error(`Google Fonts returned no ${missing.join('/')} weight for ${family}`);
    }

    return resolved;
}

async function getABCFavoritFaces(): Promise<ResolvedFace[]> {
    return Promise.all(
        ABC_FAVORIT.sources.map(async (source) => {
            const path = join(scriptDir, '../src/fonts/ABCFavorit', source.file);
            const digest = createHash('sha256')
                .update(await readFile(path))
                .digest('hex');

            return {
                weight: source.weight,
                style: source.style,
                file: `abcfavorit/${digest.slice(0, 16)}.woff2`,
                source: `./ABCFavorit/${source.file}`,
                unicodeRange: '',
            };
        })
    );
}

function getFallbackFace(name: string, family: string): FontFallbackFaceData {
    if (name === 'ABCFavorit') {
        return { family: `${family} Fallback`, local: 'Arial', ...ABC_FAVORIT.fallbackMetrics };
    }

    const metrics = calculateSizeAdjustValues(family);
    return {
        family: `${family} Fallback`,
        local: metrics.fallbackFont,
        ascentOverride: `${metrics.ascent}%`,
        descentOverride: `${metrics.descent}%`,
        lineGapOverride: `${metrics.lineGap}%`,
        sizeAdjust: `${metrics.sizeAdjust}%`,
    };
}

function read(block: string, property: string): string | undefined {
    return block.match(new RegExp(`${property}\\s*:\\s*([^;]+);`))?.[1]?.trim();
}
