const MAX_DISPLAYED_BYTES = 512 * 1024;
const TEXT_CONTENT_TYPE = /json|xml|text\/|javascript|yaml|csv|html|x-www-form-urlencoded|graphql/i;
const PREVIEWABLE_IMAGE = /^image\/(png|jpeg|gif|webp|avif|bmp)\b/i;

export interface TryItResponse {
    status: number;
    statusText: string;
    durationMs: number;
    headers: [string, string][];
    size: number;
    contentType: string;
    /** Set for textual responses, pretty-printed when JSON. */
    text: string | null;
    truncated: boolean;
    /** Object URL of the raw body, for binary responses; the caller revokes it. */
    blobUrl: string | null;
    /** Whether `blobUrl` is a raster image safe to show in an `<img>`. */
    isImage: boolean;
}

export async function readTryItResponse(
    response: Response,
    startedAt: number
): Promise<TryItResponse> {
    const buffer = await response.arrayBuffer();
    const durationMs = Math.round(performance.now() - startedAt);
    const contentType = response.headers.get('content-type') ?? '';
    const headers = Array.from(response.headers.entries());
    const base = {
        status: response.status,
        statusText: response.statusText,
        durationMs,
        headers,
        size: buffer.byteLength,
        contentType,
    };

    const isBinary = contentType
        ? !TEXT_CONTENT_TYPE.test(contentType)
        : looksBinary(new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 1024)));
    if (buffer.byteLength > 0 && isBinary) {
        const isImage = PREVIEWABLE_IMAGE.test(contentType);
        // The blob lives on the docs site's origin: never let the API pick a type a browser
        // could render as a document if the reader opens the link.
        const blobType = isImage ? contentType : 'application/octet-stream';
        return {
            ...base,
            text: null,
            truncated: false,
            blobUrl: URL.createObjectURL(new Blob([buffer], { type: blobType })),
            isImage,
        };
    }

    const truncated = buffer.byteLength > MAX_DISPLAYED_BYTES;
    const text = new TextDecoder().decode(
        truncated ? buffer.slice(0, MAX_DISPLAYED_BYTES) : buffer
    );
    return {
        ...base,
        text: truncated ? text : prettyPrint(text, contentType),
        truncated,
        blobUrl: null,
        isImage: false,
    };
}

function looksBinary(bytes: Uint8Array): boolean {
    if (bytes.includes(0)) {
        return true;
    }
    // `stream` holds back a multibyte character cut at the end of the sample instead of flagging it.
    return new TextDecoder().decode(bytes, { stream: true }).includes('\uFFFD');
}

function prettyPrint(text: string, contentType: string): string {
    if (!/json/i.test(contentType)) {
        return text;
    }
    try {
        return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
        return text;
    }
}

export function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
