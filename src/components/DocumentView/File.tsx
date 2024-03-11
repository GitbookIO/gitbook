import IconDownload from '@geist-ui/icons/download';
import IconFileText from '@geist-ui/icons/fileText';
import IconImage from '@geist-ui/icons/image';
import IconPaperClip from '@geist-ui/icons/paperclip';
import { DocumentBlockFile } from '@gitbook/api';

import { getRevisionFile } from '@/lib/api';
import { tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';

export async function File(props: BlockProps<DocumentBlockFile>) {
    const { block, context, style } = props;

    const file = context.content
        ? await getRevisionFile(
              context.content.spaceId,
              context.content.revisionId,
              block.data.ref.file,
          )
        : null;
    if (!file) {
        return null;
    }

    const contentType = (() => {
        switch (file.contentType) {
            case 'application/pdf':
            case 'application/x-pdf':
                return 'pdf';
            case 'image/png':
            case 'image/jpeg':
            case 'image/gif':
            case 'image/webp':
            case 'image/tiff':
            case 'image/svg+xml':
                return 'image';
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
    })();

    const icon = (() => {
        switch (contentType) {
            case 'pdf':
                return <IconFileText />;
            case 'image':
                return <IconImage />;
            case 'archive':
                return <IconPaperClip />;
            default:
                return <IconDownload />;
        }
    })();

    return (
        <a
            href={file.downloadURL}
            download={file.name}
            className={tcls(
                'group/file',
                'flex',
                'flex-row',
                'items-center',
                'border',
                'border-b-0',
                'px-5',
                'py-3',
                'border-dark/3',

                //all
                '[&]:mt-[0px]',
                //select first child
                '[&:first-child]:mt-5',
                '[&:first-child]:rounded-t-lg',
                //select first in group
                '[:not(&)_+&]:mt-5',
                '[:not(&)_+&]:rounded-t-lg',
                //select last in group
                '[&:not(:has(+_&))]:mb-5',
                '[&:not(:has(+_&))]:rounded-b-lg',
                '[&:not(:has(+_&))]:border-b',

                'hover:text-primary-600',
                'dark:border-light/3',
                'dark:hover:text-primary-300',
                style,
            )}
        >
            <div
                className={tcls(
                    'min-w-14',
                    'mr-5',
                    'pr-5',
                    'flex',
                    'flex-col',
                    'items-center',
                    'gap-1',
                    'border-r',
                    'border-dark/2',
                    'dark:border-light/2',
                )}
            >
                <div className={tcls('*:w-5', '*:h-5', '*:stroke-primary')}>{icon}</div>
                <div
                    className={tcls(
                        'text-xs',
                        'text-dark-4/8',
                        'group-hover/file:text-dark',
                        'dark:text-light-4/7',
                        'dark:group-hover/file:text-light',
                    )}
                >
                    {getHumanFileSize(file.size)}
                </div>
            </div>
            <div>
                <div className={tcls('text-base')}>{file.name}</div>
                <div className={tcls('text-sm', 'opacity-9', 'dark:opacity-8')}>{contentType}</div>
            </div>
        </a>
    );
}

const ONE_KB = 1024;
const ONE_MB = ONE_KB * 1024;

/**
 * Return a file size as human readable formatted string.
 */
function getHumanFileSize(size: number): string {
    if (size > ONE_MB) {
        const mbSize = size / ONE_MB;
        return `${mbSize.toFixed(0)}MB`;
    }
    if (size > ONE_KB) {
        const kbSize = size / ONE_KB;
        return `${kbSize.toFixed(0)}KB`;
    }

    return `${size}B`;
}
