'use client';
import { Button, type ButtonProps } from './Button';

/**
 * Button that triggers a file download when clicked.
 */
export function DownloadButton(
    props: Omit<ButtonProps, 'onClick' | 'href'> & { downloadUrl: string; filename: string }
) {
    const { downloadUrl, filename, ...buttonProps } = props;

    return (
        <Button
            {...buttonProps}
            onClick={(e) => {
                e.preventDefault();
                void forceDownload(downloadUrl, filename);
            }}
        />
    );
}

/**
 * Force download a file from a given URL with a specified filename.
 */
async function forceDownload(url: string, filename: string) {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(objectUrl);
}
