import { it } from 'bun:test';
import { validateIconName } from './icons';

it('should have the GitBook custom icon', () => {
    if (!validateIconName('gitbook')) {
        const message =
            'The GitBook icon is missing. It indicates that the dependencies were installed without the correct font-awesome package. These changes have probably been persisted in the Bun lockfile. Read the README for more information.';

        if (process.env.CI) {
            throw new Error(message);
        }
    }
});
