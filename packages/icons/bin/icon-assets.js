import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import { absolutize, parsePath } from './path-data.js';

export const allStyles = ['brands', 'duotone', 'solid', 'regular', 'light', 'thin', 'custom-icons'];

const metadataStyleByOutputStyle = {
    'custom-icons': 'custom',
};

const VIEWBOX_PRECISION = 10_000;
const FLOAT_EPSILON = 1e-9;

/**
 * Normalize the icon assets from the Font Awesome kit to safe SVGs with metrics.
 */
export async function collectNormalizedIconAssets(source, styles = allStyles) {
    const iconsMetadata = await loadIconsMetadata(source);
    const records = [];

    for (const style of styles) {
        const stylePath = path.join(source, 'svgs', style);
        if (!existsSync(stylePath)) {
            continue;
        }

        const files = (await fs.readdir(stylePath))
            .filter((file) => file.endsWith('.svg'))
            .sort((left, right) => left.localeCompare(right));

        for (const file of files) {
            const icon = file.slice(0, -4);
            const svgPath = path.join(stylePath, file);
            const svg = await fs.readFile(svgPath, 'utf8');
            const originalViewBox = parseSvgViewBox(svg);
            const pathData = getIconPaths(iconsMetadata, icon, style);
            const safeViewBox = pathData
                ? getSafeViewBox(pathData, originalViewBox)
                : originalViewBox;

            records.push({
                style,
                icon,
                originalViewBox,
                safeViewBox,
                svg: replaceSvgViewBox(svg, safeViewBox),
            });
        }
    }

    return records;
}

/**
 * Create a manifest keyed by "style/icon" to keep runtime lookups simple.
 */
export function createMetricsManifest(records) {
    return Object.fromEntries(
        records
            .filter((record) => !viewBoxesEqual(record.originalViewBox, record.safeViewBox))
            .map((record) => [
                `${record.style}/${record.icon}`,
                {
                    originalViewBox: record.originalViewBox,
                    safeViewBox: record.safeViewBox,
                },
            ])
    );
}

/**
 * Calculate a safe viewBox that contains both the declared Font Awesome box and the actual paint.
 */
export function getSafeViewBox(paths, originalViewBox) {
    const paintBounds = getPaintBounds(paths);
    if (!paintBounds) {
        return originalViewBox;
    }

    const [originalX, originalY, originalWidth, originalHeight] = originalViewBox;
    const originalMaxX = originalX + originalWidth;
    const originalMaxY = originalY + originalHeight;

    const minX = preserveMinEdge(originalX, paintBounds.minX);
    const minY = preserveMinEdge(originalY, paintBounds.minY);
    const maxX = preserveMaxEdge(originalMaxX, paintBounds.maxX);
    const maxY = preserveMaxEdge(originalMaxY, paintBounds.maxY);

    return [
        normalizeNumber(minX),
        normalizeNumber(minY),
        normalizeNumber(maxX - minX),
        normalizeNumber(maxY - minY),
    ];
}

/**
 * Compute the exact painted bounds for filled SVG paths.
 */
export function getPaintBounds(paths) {
    const allPaths = Array.isArray(paths) ? paths : [paths];
    let bounds = null;

    for (const pathData of allPaths) {
        const segments = absolutize(parsePath(pathData));

        let currentPoint = null;
        let subpathStart = null;
        let lastType = '';
        let lastCubicControl = null;
        let lastQuadraticControl = null;

        for (const segment of segments) {
            switch (segment.key) {
                case 'M':
                    currentPoint = [segment.data[0], segment.data[1]];
                    subpathStart = currentPoint;
                    lastCubicControl = null;
                    lastQuadraticControl = null;
                    break;
                case 'L': {
                    if (!currentPoint) {
                        currentPoint = [segment.data[0], segment.data[1]];
                        break;
                    }

                    const nextPoint = [segment.data[0], segment.data[1]];
                    bounds = includeLineBounds(bounds, currentPoint, nextPoint);
                    currentPoint = nextPoint;
                    lastCubicControl = null;
                    lastQuadraticControl = null;
                    break;
                }
                case 'H': {
                    if (!currentPoint) {
                        currentPoint = [segment.data[0], 0];
                        break;
                    }

                    const nextPoint = [segment.data[0], currentPoint[1]];
                    bounds = includeLineBounds(bounds, currentPoint, nextPoint);
                    currentPoint = nextPoint;
                    lastCubicControl = null;
                    lastQuadraticControl = null;
                    break;
                }
                case 'V': {
                    if (!currentPoint) {
                        currentPoint = [0, segment.data[0]];
                        break;
                    }

                    const nextPoint = [currentPoint[0], segment.data[0]];
                    bounds = includeLineBounds(bounds, currentPoint, nextPoint);
                    currentPoint = nextPoint;
                    lastCubicControl = null;
                    lastQuadraticControl = null;
                    break;
                }
                case 'C': {
                    if (!currentPoint) {
                        currentPoint = [segment.data[4], segment.data[5]];
                        break;
                    }

                    const curveBounds = getCubicBounds(
                        currentPoint,
                        [segment.data[0], segment.data[1]],
                        [segment.data[2], segment.data[3]],
                        [segment.data[4], segment.data[5]]
                    );
                    bounds = mergeBounds(bounds, curveBounds);
                    currentPoint = [segment.data[4], segment.data[5]];
                    lastCubicControl = [segment.data[2], segment.data[3]];
                    lastQuadraticControl = null;
                    break;
                }
                case 'S': {
                    if (!currentPoint) {
                        currentPoint = [segment.data[2], segment.data[3]];
                        break;
                    }

                    const control1 =
                        lastType === 'C' || lastType === 'S'
                            ? reflectPoint(currentPoint, lastCubicControl)
                            : currentPoint;
                    const control2 = [segment.data[0], segment.data[1]];
                    const nextPoint = [segment.data[2], segment.data[3]];
                    bounds = mergeBounds(
                        bounds,
                        getCubicBounds(currentPoint, control1, control2, nextPoint)
                    );
                    currentPoint = nextPoint;
                    lastCubicControl = control2;
                    lastQuadraticControl = null;
                    break;
                }
                case 'Q': {
                    if (!currentPoint) {
                        currentPoint = [segment.data[2], segment.data[3]];
                        break;
                    }

                    const control = [segment.data[0], segment.data[1]];
                    const nextPoint = [segment.data[2], segment.data[3]];
                    bounds = mergeBounds(
                        bounds,
                        getQuadraticBounds(currentPoint, control, nextPoint)
                    );
                    currentPoint = nextPoint;
                    lastCubicControl = null;
                    lastQuadraticControl = control;
                    break;
                }
                case 'T': {
                    if (!currentPoint) {
                        currentPoint = [segment.data[0], segment.data[1]];
                        break;
                    }

                    const control =
                        lastType === 'Q' || lastType === 'T'
                            ? reflectPoint(currentPoint, lastQuadraticControl)
                            : currentPoint;
                    const nextPoint = [segment.data[0], segment.data[1]];
                    bounds = mergeBounds(
                        bounds,
                        getQuadraticBounds(currentPoint, control, nextPoint)
                    );
                    currentPoint = nextPoint;
                    lastCubicControl = null;
                    lastQuadraticControl = control;
                    break;
                }
                case 'A': {
                    if (!currentPoint) {
                        currentPoint = [segment.data[5], segment.data[6]];
                        break;
                    }

                    const nextPoint = [segment.data[5], segment.data[6]];
                    bounds = mergeBounds(
                        bounds,
                        getArcBounds(
                            currentPoint,
                            nextPoint,
                            segment.data[0],
                            segment.data[1],
                            segment.data[2],
                            segment.data[3],
                            segment.data[4]
                        )
                    );
                    currentPoint = nextPoint;
                    lastCubicControl = null;
                    lastQuadraticControl = null;
                    break;
                }
                case 'Z':
                    if (currentPoint && subpathStart) {
                        bounds = includeLineBounds(bounds, currentPoint, subpathStart);
                        currentPoint = subpathStart;
                    }
                    lastCubicControl = null;
                    lastQuadraticControl = null;
                    break;
            }

            lastType = segment.key;
        }
    }

    return bounds;
}

function getIconPaths(iconsMetadata, icon, style) {
    const metadataStyle = metadataStyleByOutputStyle[style] ?? style;
    const styleMetadata = iconsMetadata[icon]?.svg?.[metadataStyle];
    if (!styleMetadata) {
        return null;
    }

    return Array.isArray(styleMetadata.path) ? styleMetadata.path : [styleMetadata.path];
}

async function loadIconsMetadata(source) {
    const metadataFile = path.join(source, 'metadata/icons.json');
    return JSON.parse(await fs.readFile(metadataFile, 'utf8'));
}

function parseSvgViewBox(svg) {
    const match = svg.match(/\bviewBox="([^"]+)"/);
    if (!match) {
        throw new Error('SVG is missing a viewBox');
    }

    const numbers = match[1]
        .trim()
        .split(/\s+/)
        .map((value) => Number.parseFloat(value));

    if (numbers.length !== 4 || numbers.some((value) => Number.isNaN(value))) {
        throw new Error(`Invalid SVG viewBox: ${match[1]}`);
    }

    return numbers;
}

function replaceSvgViewBox(svg, viewBox) {
    return svg.replace(/\bviewBox="[^"]+"/, `viewBox="${formatViewBox(viewBox)}"`);
}

function formatViewBox(viewBox) {
    return viewBox.map((value) => formatNumber(value)).join(' ');
}

function formatNumber(value) {
    const normalized = normalizeNumber(value);
    return Number.isInteger(normalized) ? `${normalized}` : `${normalized}`;
}

function preserveMinEdge(originalMin, paintMin) {
    if (paintMin >= originalMin - FLOAT_EPSILON) {
        return originalMin;
    }

    return roundDown(paintMin);
}

function preserveMaxEdge(originalMax, paintMax) {
    if (paintMax <= originalMax + FLOAT_EPSILON) {
        return originalMax;
    }

    return roundUp(paintMax);
}

function roundDown(value) {
    return Math.floor(value * VIEWBOX_PRECISION) / VIEWBOX_PRECISION;
}

function roundUp(value) {
    return Math.ceil(value * VIEWBOX_PRECISION) / VIEWBOX_PRECISION;
}

function normalizeNumber(value) {
    return Math.round(value * VIEWBOX_PRECISION) / VIEWBOX_PRECISION;
}

function viewBoxesEqual(left, right) {
    return left.every((value, index) => Math.abs(value - right[index]) < FLOAT_EPSILON);
}

function includeLineBounds(bounds, start, end) {
    return mergeBounds(bounds, {
        minX: Math.min(start[0], end[0]),
        minY: Math.min(start[1], end[1]),
        maxX: Math.max(start[0], end[0]),
        maxY: Math.max(start[1], end[1]),
    });
}

function mergeBounds(bounds, nextBounds) {
    if (!bounds) {
        return nextBounds;
    }

    return {
        minX: Math.min(bounds.minX, nextBounds.minX),
        minY: Math.min(bounds.minY, nextBounds.minY),
        maxX: Math.max(bounds.maxX, nextBounds.maxX),
        maxY: Math.max(bounds.maxY, nextBounds.maxY),
    };
}

function reflectPoint(origin, point) {
    if (!point) {
        return origin;
    }

    return [2 * origin[0] - point[0], 2 * origin[1] - point[1]];
}

function getQuadraticBounds(start, control, end) {
    const cubicControl1 = [
        start[0] + (2 * (control[0] - start[0])) / 3,
        start[1] + (2 * (control[1] - start[1])) / 3,
    ];
    const cubicControl2 = [
        end[0] + (2 * (control[0] - end[0])) / 3,
        end[1] + (2 * (control[1] - end[1])) / 3,
    ];

    return getCubicBounds(start, cubicControl1, cubicControl2, end);
}

function getCubicBounds(start, control1, control2, end) {
    const candidates = [
        0,
        1,
        ...getCubicExtrema(start[0], control1[0], control2[0], end[0]),
        ...getCubicExtrema(start[1], control1[1], control2[1], end[1]),
    ];

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const t of candidates) {
        if (t < 0 || t > 1) {
            continue;
        }

        const point = evaluateCubic(start, control1, control2, end, t);
        minX = Math.min(minX, point[0]);
        minY = Math.min(minY, point[1]);
        maxX = Math.max(maxX, point[0]);
        maxY = Math.max(maxY, point[1]);
    }

    return { minX, minY, maxX, maxY };
}

function getArcBounds(start, end, rawRadiusX, rawRadiusY, angle, largeArcFlag, sweepFlag) {
    const arc = endpointToCenterArc(
        start[0],
        start[1],
        end[0],
        end[1],
        rawRadiusX,
        rawRadiusY,
        angle,
        largeArcFlag,
        sweepFlag
    );

    if (!arc) {
        return {
            minX: Math.min(start[0], end[0]),
            minY: Math.min(start[1], end[1]),
            maxX: Math.max(start[0], end[0]),
            maxY: Math.max(start[1], end[1]),
        };
    }

    const extrema = getArcExtremaAngles(arc.radiusX, arc.radiusY, arc.rotation);
    const candidates = [arc.startAngle, arc.startAngle + arc.deltaAngle, ...extrema];

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const candidate of candidates) {
        if (!isAngleOnArc(candidate, arc.startAngle, arc.deltaAngle)) {
            continue;
        }

        const point = pointOnArc(arc, candidate);
        minX = Math.min(minX, point[0]);
        minY = Math.min(minY, point[1]);
        maxX = Math.max(maxX, point[0]);
        maxY = Math.max(maxY, point[1]);
    }

    return { minX, minY, maxX, maxY };
}

function endpointToCenterArc(
    startX,
    startY,
    endX,
    endY,
    rawRadiusX,
    rawRadiusY,
    angle,
    largeArcFlag,
    sweepFlag
) {
    let radiusX = Math.abs(rawRadiusX);
    let radiusY = Math.abs(rawRadiusY);

    if (
        radiusX < FLOAT_EPSILON ||
        radiusY < FLOAT_EPSILON ||
        (Math.abs(startX - endX) < FLOAT_EPSILON && Math.abs(startY - endY) < FLOAT_EPSILON)
    ) {
        return null;
    }

    const rotation = degToRad(angle % 360);
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);

    const translatedX = (startX - endX) / 2;
    const translatedY = (startY - endY) / 2;
    const primeX = cosine * translatedX + sine * translatedY;
    const primeY = -sine * translatedX + cosine * translatedY;

    const lambda =
        (primeX * primeX) / (radiusX * radiusX) + (primeY * primeY) / (radiusY * radiusY);
    if (lambda > 1) {
        const scale = Math.sqrt(lambda);
        radiusX *= scale;
        radiusY *= scale;
    }

    const radiusXSquared = radiusX * radiusX;
    const radiusYSquared = radiusY * radiusY;
    const primeXSquared = primeX * primeX;
    const primeYSquared = primeY * primeY;
    const numerator =
        radiusXSquared * radiusYSquared -
        radiusXSquared * primeYSquared -
        radiusYSquared * primeXSquared;
    const denominator = radiusXSquared * primeYSquared + radiusYSquared * primeXSquared;
    const factor =
        (largeArcFlag === sweepFlag ? -1 : 1) * Math.sqrt(Math.max(0, numerator / denominator));

    const centerPrimeX = (factor * radiusX * primeY) / radiusY;
    const centerPrimeY = (-factor * radiusY * primeX) / radiusX;
    const centerX = cosine * centerPrimeX - sine * centerPrimeY + (startX + endX) / 2;
    const centerY = sine * centerPrimeX + cosine * centerPrimeY + (startY + endY) / 2;

    const startVector = [(primeX - centerPrimeX) / radiusX, (primeY - centerPrimeY) / radiusY];
    const endVector = [(-primeX - centerPrimeX) / radiusX, (-primeY - centerPrimeY) / radiusY];

    const startAngle = vectorAngle([1, 0], startVector);
    let deltaAngle = vectorAngle(startVector, endVector);

    if (!sweepFlag && deltaAngle > 0) {
        deltaAngle -= 2 * Math.PI;
    }
    if (sweepFlag && deltaAngle < 0) {
        deltaAngle += 2 * Math.PI;
    }

    return {
        centerX,
        centerY,
        radiusX,
        radiusY,
        rotation,
        startAngle,
        deltaAngle,
    };
}

function getArcExtremaAngles(radiusX, radiusY, rotation) {
    const xAngle = Math.atan2(-radiusY * Math.sin(rotation), radiusX * Math.cos(rotation));
    const yAngle = Math.atan2(radiusY * Math.cos(rotation), radiusX * Math.sin(rotation));

    return [xAngle, xAngle + Math.PI, yAngle, yAngle + Math.PI];
}

function isAngleOnArc(angle, startAngle, deltaAngle) {
    const fullTurn = 2 * Math.PI;
    const endAngle = startAngle + deltaAngle;

    if (deltaAngle >= 0) {
        let normalized = angle;
        while (normalized < startAngle - FLOAT_EPSILON) {
            normalized += fullTurn;
        }
        while (normalized > startAngle + fullTurn + FLOAT_EPSILON) {
            normalized -= fullTurn;
        }
        return normalized <= endAngle + FLOAT_EPSILON;
    }

    let normalized = angle;
    while (normalized > startAngle + FLOAT_EPSILON) {
        normalized -= fullTurn;
    }
    while (normalized < startAngle - fullTurn - FLOAT_EPSILON) {
        normalized += fullTurn;
    }
    return normalized >= endAngle - FLOAT_EPSILON;
}

function pointOnArc(arc, angle) {
    const cosine = Math.cos(arc.rotation);
    const sine = Math.sin(arc.rotation);
    const localX = arc.radiusX * Math.cos(angle);
    const localY = arc.radiusY * Math.sin(angle);

    return [
        arc.centerX + localX * cosine - localY * sine,
        arc.centerY + localX * sine + localY * cosine,
    ];
}

function vectorAngle(left, right) {
    const dot = left[0] * right[0] + left[1] * right[1];
    const magnitude = Math.hypot(left[0], left[1]) * Math.hypot(right[0], right[1]);
    const sign = left[0] * right[1] - left[1] * right[0] < 0 ? -1 : 1;

    return sign * Math.acos(clamp(dot / magnitude, -1, 1));
}

function degToRad(degrees) {
    return (Math.PI * degrees) / 180;
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function getCubicExtrema(start, control1, control2, end) {
    const a = -start + 3 * control1 - 3 * control2 + end;
    const b = 2 * (start - 2 * control1 + control2);
    const c = -start + control1;

    if (Math.abs(a) < FLOAT_EPSILON) {
        if (Math.abs(b) < FLOAT_EPSILON) {
            return [];
        }

        return [-c / b].filter((value) => value > FLOAT_EPSILON && value < 1 - FLOAT_EPSILON);
    }

    const discriminant = b * b - 4 * a * c;
    if (discriminant < -FLOAT_EPSILON) {
        return [];
    }

    if (Math.abs(discriminant) < FLOAT_EPSILON) {
        return [-b / (2 * a)].filter((value) => value > FLOAT_EPSILON && value < 1 - FLOAT_EPSILON);
    }

    const root = Math.sqrt(discriminant);
    return [(-b + root) / (2 * a), (-b - root) / (2 * a)].filter(
        (value) => value > FLOAT_EPSILON && value < 1 - FLOAT_EPSILON
    );
}

function evaluateCubic(start, control1, control2, end, t) {
    const oneMinusT = 1 - t;
    return [
        oneMinusT ** 3 * start[0] +
            3 * oneMinusT ** 2 * t * control1[0] +
            3 * oneMinusT * t ** 2 * control2[0] +
            t ** 3 * end[0],
        oneMinusT ** 3 * start[1] +
            3 * oneMinusT ** 2 * t * control1[1] +
            3 * oneMinusT * t ** 2 * control2[1] +
            t ** 3 * end[1],
    ];
}
