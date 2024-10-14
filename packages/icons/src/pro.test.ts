import { it } from 'bun:test';
import { validateIconName } from './icons';

it('should have the GitBook custom icon', () => {
    if (!validateIconName('gitbook')) {
        throw new Error(
            'The GitBook icon is missing. It indicates that the dependencies were installed without the font-awesome custom package.',
        );
    }
});
