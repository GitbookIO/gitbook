import { describe, expect, it } from 'bun:test';

import * as llmsFullPageRoute from '@/app/sites/static/[mode]/[siteURL]/[siteData]/llms-full.txt/[page]/route';
import * as llmsFullRoute from '@/app/sites/static/[mode]/[siteURL]/[siteData]/llms-full.txt/route';
import * as llmsRoute from '@/app/sites/static/[mode]/[siteURL]/[siteData]/llms.txt/route';

describe('llms route rendering strategy', () => {
    it('renders llms.txt dynamically so new pages show up immediately', () => {
        expect(llmsRoute.dynamic).toBe('force-dynamic');
    });

    it('renders llms-full.txt dynamically for fresh exports', () => {
        expect(llmsFullRoute.dynamic).toBe('force-dynamic');
        expect(llmsFullPageRoute.dynamic).toBe('force-dynamic');
    });
});
