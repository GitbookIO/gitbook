
export type GetImageSizeOptions = {
    dpr?: number;
}

export type ResizeImageOptions = GetImageSizeOptions & {
    width?: number;
    height?: number;
    dpr?: number;
    quality?: number;
}

interface ImageSize {
    width: number;
    height: number;
}

export type ImageResizer = {
    /**
     * Resize an image.
     * @param input - The image URL to resize.
     * @param options - The options to resize the image.
     */
    resize(input: string): null | ((options: ResizeImageOptions) => Promise<string>);

    /**
     * Get the size of an image.
     */
    getImageSize(input: string, options: GetImageSizeOptions): Promise<ImageSize | null>;
};
