import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ABC_FAVORIT, FONT_DEFINITIONS, type FontDefinition } from '../src/fonts/definitions';
import type {
    FontFaceData,
    FontFacesData,
    FontFallbackFaceData,
    FontSourcesData,
} from '../src/fonts/types';

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

const scriptDir = dirname(fileURLToPath(import.meta.url));
const output: FontFacesData = {};
// Kept out of `faces.json` so the URLs never reach the server bundle: only the downloader needs them.
const sources: FontSourcesData = {};

for (const [name, definition] of Object.entries(FONT_DEFINITIONS)) {
    const resolved = definition.googleId
        ? await getGoogleFaces(definition)
        : await getABCFavoritFaces();

    if (resolved.length === 0) {
        throw new Error(`No font faces resolved for ${name}`);
    }

    const faces = resolved.map(({ source, ...face }) => {
        sources[face.file] = source;
        return face;
    });

    output[name] = {
        family: definition.family,
        variable: definition.variable,
        fontFamilyValue: [
            `"${definition.family}"`,
            ...(definition.adjustFallback ? [`"${definition.family} Fallback"`] : []),
            ...definition.fallback,
        ].join(','),
        faces,
        fallbackFace: definition.adjustFallback ? getFallbackFace(name, definition.family) : null,
    };
}

const generatedDir = join(scriptDir, '../src/fonts/generated');
await writeFile(join(generatedDir, 'faces.json'), `${JSON.stringify(output, null, 4)}\n`);
await writeFile(join(generatedDir, 'sources.json'), `${JSON.stringify(sources, null, 4)}\n`);

type ResolvedFace = FontFaceData & { source: string };

async function getGoogleFaces(definition: FontDefinition): Promise<ResolvedFace[]> {
    const { family, googleId, weights } = definition;
    const url = `https://fonts.googleapis.com/css2?family=${family.replaceAll(' ', '+')}:wght@${weights.join(';')}&display=swap`;

    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!response.ok) {
        throw new Error(`Unable to fetch ${family} from Google Fonts: ${response.status} (${url})`);
    }

    const faces = [...(await response.text()).matchAll(/@font-face\s*\{([^}]*)\}/g)].map(
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

    const missing = weights.filter((weight) => !faces.some((face) => face.weight === weight));
    if (missing.length > 0) {
        throw new Error(`Google Fonts returned no ${missing.join('/')} weight for ${family}`);
    }

    return faces;
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
                ascentOverride: ABC_FAVORIT.ascentOverride,
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
