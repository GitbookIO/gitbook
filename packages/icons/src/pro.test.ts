import { it } from 'bun:test';
import { validateIconName } from './icons';

it('should have the GitBook custom icon', () => {
    if (!validateIconName('gitbook')) {
        const message =
            'The GitBook icon is missing. It indicates that the dependencies were installed without the font-awesome custom package.';
        if (process.env.CI) {
            throw new Error(message);
        } else {
            console.warn(message);
        }
    }
});
