import fs from 'fs';
import emojisRaws from 'emoji-assets/emoji.json';

interface EmojiData {
    code_points: {
        base: string;
        fully_qualified: string;
    };
}

const emojis = emojisRaws as Record<string, EmojiData>;
const output: Record<string, string> = {};

Object.entries(emojis).forEach(([key, value]) => {
    const emoji = value.code_points?.fully_qualified;
    if (emoji && key !== emoji) {
        output[key] = emoji;
    } else if (!emoji) {
        console.log('No emoji for', key);
    }
});

fs.writeFileSync(
    'index.ts',
    `export const emojiCodepoints: Record<string, string> = ${JSON.stringify(output, null, 4)};`,
);
