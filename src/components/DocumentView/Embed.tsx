import { tcls } from '@/lib/tailwind';
import { BlockProps } from './Block';
import { Blocks } from './Blocks';
import { DocumentBlockEmbed } from '@gitbook/api';
import { api } from '@/lib/api';

export async function Embed(props: BlockProps<DocumentBlockEmbed>) {
    const { block, style, ...contextProps } = props;

    const { data: embed } = await api().urls.getEmbedByUrl({ url: block.data.url });

    // TODO caption

    if (embed.type === 'rich') {
        return (
            <div
                className={tcls(style)}
                dangerouslySetInnerHTML={{
                    __html: embed.html,
                }}
            />
        );
    } else {
        return (
            <div className={tcls(style)}>
                <div>{embed.title}</div>
            </div>
        );
    }
}
