export type SimplifiedFileType = 'image' | 'pdf' | 'archive';

/**
 * Get a simplified content type for the given mime type.
 */
export function getSimplifiedContentType(mimeType: string): SimplifiedFileType | null {
    if (mimeType.startsWith('image')) {
        return 'image';
    }

    switch (mimeType) {
        case 'application/pdf':
        case 'application/x-pdf':
            return 'pdf';
        case 'application/zip':
        case 'application/x-7z-compressed':
        case 'application/x-zip-compressed':
        case 'application/x-tar':
        case 'application/x-rar-compressed':
        case 'application/vnd.rar':
            return 'archive';
        default:
            return null;
    }
}
