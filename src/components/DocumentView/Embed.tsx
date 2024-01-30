import { DocumentBlockEmbed } from '@gitbook/api';

import { Card } from '@/components/primitives';
import { api } from '@/lib/api';
import { getNodeFragmentByName, isNodeEmpty } from '@/lib/document';
import { ClassValue, tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { Caption } from './Caption';
import { Inlines } from './Inlines';

export async function Embed(props: BlockProps<DocumentBlockEmbed>) {
    const { block } = props;

    const { data: embed } = await api().urls.getEmbedByUrl({ url: block.data.url });

    return (
        <Caption {...props}>
            {embed.type === 'rich' ? (
                <div
                    dangerouslySetInnerHTML={{
                        __html: embed.html,
                    }}
                />
            ) : (
                <Card
                    leadingIcon={
                        embed.icon ? (
                            <img src={embed.icon} className={tcls('w-5', 'h-5')} alt="Logo" />
                        ) : null
                    }
                    href={block.data.url}
                    title={embed.title}
                    postTitle={embed.site}
                />
            )}
        </Caption>
    );
}
