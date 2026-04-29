// Adapted from path-data-parser (MIT) to keep the icon CLI self-contained.

const COMMAND = 0;
const NUMBER = 1;
const EOD = 2;

const PARAMS = {
    A: 7,
    a: 7,
    C: 6,
    c: 6,
    H: 1,
    h: 1,
    L: 2,
    l: 2,
    M: 2,
    m: 2,
    Q: 4,
    q: 4,
    S: 4,
    s: 4,
    T: 2,
    t: 2,
    V: 1,
    v: 1,
    Z: 0,
    z: 0,
};

/**
 * Parse an SVG path string into segment commands.
 */
export function parsePath(d) {
    const segments = [];
    const tokens = tokenize(d);
    let mode = 'BOD';
    let index = 0;
    let token = tokens[index];

    while (!isType(token, EOD)) {
        let paramsCount = 0;
        const params = [];

        if (mode === 'BOD') {
            if (token.text === 'M' || token.text === 'm') {
                index++;
                paramsCount = PARAMS[token.text];
                mode = token.text;
            } else {
                return parsePath(`M0,0${d}`);
            }
        } else if (isType(token, NUMBER)) {
            paramsCount = PARAMS[mode];
        } else {
            index++;
            paramsCount = PARAMS[token.text];
            mode = token.text;
        }

        if (index + paramsCount >= tokens.length) {
            throw new Error('Path data ended short');
        }

        for (let i = index; i < index + paramsCount; i++) {
            const numberToken = tokens[i];
            if (!isType(numberToken, NUMBER)) {
                throw new Error(`Param not a number: ${mode},${numberToken.text}`);
            }

            params.push(Number(numberToken.text));
        }

        if (typeof PARAMS[mode] !== 'number') {
            throw new Error(`Bad segment: ${mode}`);
        }

        segments.push({ key: mode, data: params });
        index += paramsCount;
        token = tokens[index];

        if (mode === 'M') {
            mode = 'L';
        }
        if (mode === 'm') {
            mode = 'l';
        }
    }

    return segments;
}

/**
 * Translate relative SVG commands to absolute commands.
 */
export function absolutize(segments) {
    let currentX = 0;
    let currentY = 0;
    let subpathX = 0;
    let subpathY = 0;
    const output = [];

    for (const { key, data } of segments) {
        switch (key) {
            case 'M':
                output.push({ key: 'M', data: [...data] });
                [currentX, currentY] = data;
                [subpathX, subpathY] = data;
                break;
            case 'm':
                currentX += data[0];
                currentY += data[1];
                output.push({ key: 'M', data: [currentX, currentY] });
                subpathX = currentX;
                subpathY = currentY;
                break;
            case 'L':
                output.push({ key: 'L', data: [...data] });
                [currentX, currentY] = data;
                break;
            case 'l':
                currentX += data[0];
                currentY += data[1];
                output.push({ key: 'L', data: [currentX, currentY] });
                break;
            case 'C':
                output.push({ key: 'C', data: [...data] });
                currentX = data[4];
                currentY = data[5];
                break;
            case 'c': {
                const nextData = data.map((value, index) =>
                    index % 2 === 0 ? value + currentX : value + currentY
                );
                output.push({ key: 'C', data: nextData });
                currentX = nextData[4];
                currentY = nextData[5];
                break;
            }
            case 'Q':
                output.push({ key: 'Q', data: [...data] });
                currentX = data[2];
                currentY = data[3];
                break;
            case 'q': {
                const nextData = data.map((value, index) =>
                    index % 2 === 0 ? value + currentX : value + currentY
                );
                output.push({ key: 'Q', data: nextData });
                currentX = nextData[2];
                currentY = nextData[3];
                break;
            }
            case 'A':
                output.push({ key: 'A', data: [...data] });
                currentX = data[5];
                currentY = data[6];
                break;
            case 'a':
                currentX += data[5];
                currentY += data[6];
                output.push({
                    key: 'A',
                    data: [data[0], data[1], data[2], data[3], data[4], currentX, currentY],
                });
                break;
            case 'H':
                output.push({ key: 'H', data: [...data] });
                currentX = data[0];
                break;
            case 'h':
                currentX += data[0];
                output.push({ key: 'H', data: [currentX] });
                break;
            case 'V':
                output.push({ key: 'V', data: [...data] });
                currentY = data[0];
                break;
            case 'v':
                currentY += data[0];
                output.push({ key: 'V', data: [currentY] });
                break;
            case 'S':
                output.push({ key: 'S', data: [...data] });
                currentX = data[2];
                currentY = data[3];
                break;
            case 's': {
                const nextData = data.map((value, index) =>
                    index % 2 === 0 ? value + currentX : value + currentY
                );
                output.push({ key: 'S', data: nextData });
                currentX = nextData[2];
                currentY = nextData[3];
                break;
            }
            case 'T':
                output.push({ key: 'T', data: [...data] });
                currentX = data[0];
                currentY = data[1];
                break;
            case 't':
                currentX += data[0];
                currentY += data[1];
                output.push({ key: 'T', data: [currentX, currentY] });
                break;
            case 'Z':
            case 'z':
                output.push({ key: 'Z', data: [] });
                currentX = subpathX;
                currentY = subpathY;
                break;
        }
    }

    return output;
}

/**
 * Normalize an absolute path to M/L/C/Z commands only.
 */
export function normalize(segments) {
    const output = [];
    let lastType = '';
    let currentX = 0;
    let currentY = 0;
    let subpathX = 0;
    let subpathY = 0;
    let lastControlX = 0;
    let lastControlY = 0;

    for (const { key, data } of segments) {
        switch (key) {
            case 'M':
                output.push({ key: 'M', data: [...data] });
                [currentX, currentY] = data;
                [subpathX, subpathY] = data;
                break;
            case 'C':
                output.push({ key: 'C', data: [...data] });
                currentX = data[4];
                currentY = data[5];
                lastControlX = data[2];
                lastControlY = data[3];
                break;
            case 'L':
                output.push({ key: 'L', data: [...data] });
                [currentX, currentY] = data;
                break;
            case 'H':
                currentX = data[0];
                output.push({ key: 'L', data: [currentX, currentY] });
                break;
            case 'V':
                currentY = data[0];
                output.push({ key: 'L', data: [currentX, currentY] });
                break;
            case 'S': {
                let controlX = currentX;
                let controlY = currentY;

                if (lastType === 'C' || lastType === 'S') {
                    controlX = currentX + (currentX - lastControlX);
                    controlY = currentY + (currentY - lastControlY);
                }

                output.push({ key: 'C', data: [controlX, controlY, ...data] });
                lastControlX = data[0];
                lastControlY = data[1];
                currentX = data[2];
                currentY = data[3];
                break;
            }
            case 'T': {
                const [x, y] = data;
                let reflectedX = currentX;
                let reflectedY = currentY;

                if (lastType === 'Q' || lastType === 'T') {
                    reflectedX = currentX + (currentX - lastControlX);
                    reflectedY = currentY + (currentY - lastControlY);
                }

                const control1X = currentX + (2 * (reflectedX - currentX)) / 3;
                const control1Y = currentY + (2 * (reflectedY - currentY)) / 3;
                const control2X = x + (2 * (reflectedX - x)) / 3;
                const control2Y = y + (2 * (reflectedY - y)) / 3;

                output.push({
                    key: 'C',
                    data: [control1X, control1Y, control2X, control2Y, x, y],
                });
                lastControlX = reflectedX;
                lastControlY = reflectedY;
                currentX = x;
                currentY = y;
                break;
            }
            case 'Q': {
                const [controlX, controlY, x, y] = data;
                const control1X = currentX + (2 * (controlX - currentX)) / 3;
                const control1Y = currentY + (2 * (controlY - currentY)) / 3;
                const control2X = x + (2 * (controlX - x)) / 3;
                const control2Y = y + (2 * (controlY - y)) / 3;

                output.push({
                    key: 'C',
                    data: [control1X, control1Y, control2X, control2Y, x, y],
                });
                lastControlX = controlX;
                lastControlY = controlY;
                currentX = x;
                currentY = y;
                break;
            }
            case 'A': {
                const radiusX = Math.abs(data[0]);
                const radiusY = Math.abs(data[1]);
                const angle = data[2];
                const largeArcFlag = data[3];
                const sweepFlag = data[4];
                const x = data[5];
                const y = data[6];

                if (radiusX === 0 || radiusY === 0) {
                    output.push({ key: 'C', data: [currentX, currentY, x, y, x, y] });
                    currentX = x;
                    currentY = y;
                    break;
                }

                if (currentX !== x || currentY !== y) {
                    const curves = arcToCubicCurves(
                        currentX,
                        currentY,
                        x,
                        y,
                        radiusX,
                        radiusY,
                        angle,
                        largeArcFlag,
                        sweepFlag
                    );

                    for (const curve of curves) {
                        output.push({ key: 'C', data: curve });
                    }

                    currentX = x;
                    currentY = y;
                }
                break;
            }
            case 'Z':
                output.push({ key: 'Z', data: [] });
                currentX = subpathX;
                currentY = subpathY;
                break;
        }

        lastType = key;
    }

    return output;
}

function tokenize(d) {
    const tokens = [];

    while (d !== '') {
        if (d.match(/^([ \t\r\n,]+)/)) {
            d = d.slice(RegExp.$1.length);
        } else if (d.match(/^([aAcChHlLmMqQsStTvVzZ])/)) {
            tokens.push({ type: COMMAND, text: RegExp.$1 });
            d = d.slice(RegExp.$1.length);
        } else if (d.match(/^(([-+]?[0-9]+(\.[0-9]*)?|[-+]?\.[0-9]+)([eE][-+]?[0-9]+)?)/)) {
            tokens.push({ type: NUMBER, text: `${Number.parseFloat(RegExp.$1)}` });
            d = d.slice(RegExp.$1.length);
        } else {
            return [];
        }
    }

    tokens.push({ type: EOD, text: '' });
    return tokens;
}

function isType(token, type) {
    return token.type === type;
}

function degToRad(degrees) {
    return (Math.PI * degrees) / 180;
}

function rotate(x, y, angleRad) {
    return [
        x * Math.cos(angleRad) - y * Math.sin(angleRad),
        x * Math.sin(angleRad) + y * Math.cos(angleRad),
    ];
}

function arcToCubicCurves(
    startX,
    startY,
    endX,
    endY,
    radiusX,
    radiusY,
    angle,
    largeArcFlag,
    sweepFlag,
    recursive
) {
    const angleRad = degToRad(angle);
    let params = [];
    let startAngle = 0;
    let endAngle = 0;
    let centerX = 0;
    let centerY = 0;

    if (recursive) {
        [startAngle, endAngle, centerX, centerY] = recursive;
    } else {
        [startX, startY] = rotate(startX, startY, -angleRad);
        [endX, endY] = rotate(endX, endY, -angleRad);

        const deltaX = (startX - endX) / 2;
        const deltaY = (startY - endY) / 2;
        let distance =
            (deltaX * deltaX) / (radiusX * radiusX) + (deltaY * deltaY) / (radiusY * radiusY);

        if (distance > 1) {
            distance = Math.sqrt(distance);
            radiusX *= distance;
            radiusY *= distance;
        }

        const sign = largeArcFlag === sweepFlag ? -1 : 1;
        const radiusXPow = radiusX * radiusX;
        const radiusYPow = radiusY * radiusY;
        const left =
            radiusXPow * radiusYPow - radiusXPow * deltaY * deltaY - radiusYPow * deltaX * deltaX;
        const right = radiusXPow * deltaY * deltaY + radiusYPow * deltaX * deltaX;
        const factor = sign * Math.sqrt(Math.abs(left / right));

        centerX = (factor * radiusX * deltaY) / radiusY + (startX + endX) / 2;
        centerY = (-factor * radiusY * deltaX) / radiusX + (startY + endY) / 2;
        startAngle = Math.asin(Number.parseFloat(((startY - centerY) / radiusY).toFixed(9)));
        endAngle = Math.asin(Number.parseFloat(((endY - centerY) / radiusY).toFixed(9)));

        if (startX < centerX) {
            startAngle = Math.PI - startAngle;
        }
        if (endX < centerX) {
            endAngle = Math.PI - endAngle;
        }
        if (startAngle < 0) {
            startAngle = Math.PI * 2 + startAngle;
        }
        if (endAngle < 0) {
            endAngle = Math.PI * 2 + endAngle;
        }
        if (sweepFlag && startAngle > endAngle) {
            startAngle -= Math.PI * 2;
        }
        if (!sweepFlag && endAngle > startAngle) {
            endAngle -= Math.PI * 2;
        }
    }

    let angleDelta = endAngle - startAngle;
    if (Math.abs(angleDelta) > (Math.PI * 120) / 180) {
        const previousEndAngle = endAngle;
        const previousEndX = endX;
        const previousEndY = endY;

        if (sweepFlag && endAngle > startAngle) {
            endAngle = startAngle + ((Math.PI * 120) / 180) * 1;
        } else {
            endAngle = startAngle + ((Math.PI * 120) / 180) * -1;
        }

        endX = centerX + radiusX * Math.cos(endAngle);
        endY = centerY + radiusY * Math.sin(endAngle);
        params = arcToCubicCurves(
            endX,
            endY,
            previousEndX,
            previousEndY,
            radiusX,
            radiusY,
            angle,
            0,
            sweepFlag,
            [endAngle, previousEndAngle, centerX, centerY]
        );
    }

    angleDelta = endAngle - startAngle;
    const cosineStart = Math.cos(startAngle);
    const sineStart = Math.sin(startAngle);
    const cosineEnd = Math.cos(endAngle);
    const sineEnd = Math.sin(endAngle);
    const tangent = Math.tan(angleDelta / 4);
    const controlX = (4 / 3) * radiusX * tangent;
    const controlY = (4 / 3) * radiusY * tangent;

    const point1 = [startX, startY];
    const point2 = [startX + controlX * sineStart, startY - controlY * cosineStart];
    const point3 = [endX + controlX * sineEnd, endY - controlY * cosineEnd];
    const point4 = [endX, endY];

    point2[0] = 2 * point1[0] - point2[0];
    point2[1] = 2 * point1[1] - point2[1];

    if (recursive) {
        return [point2, point3, point4].concat(params);
    }

    params = [point2, point3, point4].concat(params);
    const curves = [];

    for (let index = 0; index < params.length; index += 3) {
        const rotated1 = rotate(params[index][0], params[index][1], angleRad);
        const rotated2 = rotate(params[index + 1][0], params[index + 1][1], angleRad);
        const rotated3 = rotate(params[index + 2][0], params[index + 2][1], angleRad);
        curves.push([rotated1[0], rotated1[1], rotated2[0], rotated2[1], rotated3[0], rotated3[1]]);
    }

    return curves;
}
