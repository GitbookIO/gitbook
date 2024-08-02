import { DocumentBlockFile } from '@gitbook/api';

import { getSimplifiedContentType } from '@/lib/files';
import { tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { FileIcon } from './FileIcon';

export async function File(props: BlockProps<DocumentBlockFile>) {
    const { block, context, style } = props;

    const contentRef = await context.resolveContentRef(block.data.ref);
    const file = contentRef?.file;

    if (!file) {
        return null;
    }

    const contentType = getSimplifiedContentType(file.contentType);

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
                <div>
                    <FileIcon
                        contentType={contentType}
                        className={tcls('size-5', 'text-primary')}
                    />
                </div>
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
