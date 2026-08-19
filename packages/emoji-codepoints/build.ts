import emojisRaws from 'emoji-assets/emoji.json';
import fs from 'node:fs';
import path from 'node:path';

interface EmojiData {
    code_points: {
        base: string;
        fully_qualified: string;
    };
}

const emojis = emojisRaws as Record<string, EmojiData>;
const sequences: string[] = [];

Object.entries(emojis).forEach(([key, value]) => {
    const emoji = value.code_points?.fully_qualified;
    if (emoji && key !== emoji) {
        // The base form is always the fully-qualified one minus its `fe0f`/`200d` joiners, so only
        // the qualified sequence is shipped and the lookup key is derived at runtime.
        sequences.push(emoji);
    }
});

fs.mkdirSync(path.resolve(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(
    path.resolve(__dirname, 'dist/index.ts'),
    `export const emojiSequences = ${JSON.stringify(sequences.join('\n'))};\n`
);
