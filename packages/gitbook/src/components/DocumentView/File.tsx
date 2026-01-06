import { type DocumentBlockFile, SiteInsightsLinkPosition } from '@gitbook/api';

import { t } from '@/intl/translate';
import { getSimplifiedContentType } from '@/lib/files';
import { resolveContentRef } from '@/lib/references';

import { getSpaceLanguage } from '@/intl/server';
import { Button, Link } from '../primitives';
import { DownloadButton } from '../primitives/DownloadButton';
import type { BlockProps } from './Block';
import { Caption } from './Caption';
import { FileIcon } from './FileIcon';

export async function File(props: BlockProps<DocumentBlockFile>) {
    const { block, context } = props;

    if (!context.contentContext) {
        return null;
    }

    const contentRef = await resolveContentRef(block.data.ref, context.contentContext);
    const file = contentRef?.file;

    if (!file) {
        return null;
    }

    const language = getSpaceLanguage(context.contentContext);
    const contentType = getSimplifiedContentType(file.contentType);
    const insights = {
        type: 'link_click' as const,
        link: {
            target: block.data.ref,
            position: SiteInsightsLinkPosition.Content,
        },
    };

    return (
        <Caption {...props} withBorder>
            <div className="flex flex-wrap items-center gap-5 px-5 py-3">
                <div className="flex min-w-14 flex-col items-center gap-1 border-tint-subtle border-r pr-5">
                    <FileIcon contentType={contentType} className="size-5 text-primary" />
                    <div className="text-hint text-xs">{getHumanFileSize(file.size)}</div>
                </div>
                <div className="min-w-24 flex-1">
                    <div className="text-base">
                        <Link
                            href={file.downloadURL}
                            target="_blank"
                            insights={insights}
                            className="hover:underline"
                        >
                            {file.name}
                        </Link>
                    </div>
                    <div className="text-sm opacity-9 dark:opacity-8">{contentType}</div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                    <DownloadButton
                        icon="download"
                        size="xsmall"
                        variant="secondary"
                        downloadUrl={file.downloadURL}
                        filename={file.name}
                        insights={insights}
                    >
                        {t(language, 'download')}
                    </DownloadButton>
                    <Button
                        icon="arrow-up-right-from-square"
                        size="xsmall"
                        variant="secondary"
                        href={file.downloadURL}
                        target="_blank"
                        insights={insights}
                    >
                        {t(language, 'open')}
                    </Button>
                </div>
            </div>
        </Caption>
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
