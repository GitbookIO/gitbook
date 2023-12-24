import { DocumentInlineEmoji } from '@gitbook/api';

import { InlineProps } from './Inline';

export async function Emoji(props: InlineProps<DocumentInlineEmoji>) {
    const { inline } = props;
    const { code } = inline.data;

    const emojiCodepointDecimal = parseInt(code, 16);
    const emoji = String.fromCodePoint(emojiCodepointDecimal);

    return <span>{emoji}</span>;
}
