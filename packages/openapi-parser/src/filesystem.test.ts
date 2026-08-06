import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { normalize } from '@scalar/openapi-parser';
import type { Server } from 'bun';
import { createFileSystem } from './filesystem';

async function serveFixture(fixture: string) {
    //@ts-ignore - Typescript fail for some reason here, but not locally.
    return new Response(await Bun.file(new URL(`./fixtures/${fixture}`, import.meta.url)).bytes(), {
        headers: { 'Content-Type': 'application/yaml' },
    });
}

describe('#createFileSystem', () => {
    let server: Server;

    beforeEach(async () => {
        server = Bun.serve({
            static: {
                '/root/spec.yaml': await serveFixture('/remote-ref/root/spec.yaml'),
                '/root/user.yaml': await serveFixture('/remote-ref/root/user.yaml'),
                '/root/pet.yaml': await serveFixture('/remote-ref/root/pet.yaml'),
                '/root/invalid.yaml': await serveFixture('/remote-ref/root/invalid.txt'),
                '/tag.yaml': await serveFixture('/remote-ref/tag.yaml'),
            },
            fetch() {
                return new Response('<404>', {
                    status: 404,
                });
            },
            port: 3020,
        });
    });

    afterEach(async () => {
        await server.stop();
    });

    it('creates a filesystem by resolving URLs', async () => {
        const url = new URL('/root/spec.yaml', server.url).href;
        const filesystem = await createFileSystem({
            value: url,
            rootURL: url,
        });
        expect(filesystem).toHaveLength(1);
        expect(filesystem[0]?.isEntrypoint).toBe(true);
        expect(filesystem[0]?.filename).toBe('openapi.json');
    });

    // `parseOpenAPIV3` passes the already-parsed document, not the URL, so the object input is
    // the path that actually runs in production — and the one where the bundler has no origin
    // of its own to fall back on.
    it('resolves relative references when given a parsed document instead of a URL', async () => {
        const url = new URL('/root/spec.yaml', server.url).href;
        const value = (await normalize(await (await fetch(url)).text())) as unknown as Record<
            string,
            unknown
        >;

        const filesystem = await createFileSystem({ value, rootURL: url });
        const serialized = JSON.stringify(filesystem[0]?.specification);

        // Sibling-relative (`user.yaml`) and parent-relative (`../tag.yaml`) refs both resolve
        // against the spec's own directory, not against the server root.
        expect(serialized).toContain('io.swagger.petstore.model.User');
        expect(serialized).toContain('io.swagger.petstore.model.Tag');
        // Absolute refs keep working.
        expect(serialized).toContain('io.swagger.petstore.model.Pet');
    });

    // OpenAPI 3.1 allows JSON Schema keywords, and the bundler ranks a root-level `$id` above the
    // origin we pass. A spec carrying a stale or foreign `$id` therefore resolves its relative
    // references against that `$id`, not against the URL it was actually served from.
    it('lets a root $id outrank the spec URL when resolving relative references', async () => {
        const url = new URL('/root/spec.yaml', server.url).href;
        const load = async () =>
            (await normalize(await (await fetch(url)).text())) as unknown as Record<
                string,
                unknown
            >;

        const matching = await load();
        matching.$id = url;
        const resolved = await createFileSystem({ value: matching, rootURL: url });
        expect(JSON.stringify(resolved[0]?.specification)).toContain(
            'io.swagger.petstore.model.User'
        );

        // Same document, same rootURL — only the `$id` differs, and `user.yaml` now resolves
        // against /elsewhere/ and silently fails to load.
        const foreign = await load();
        foreign.$id = new URL('/elsewhere/spec.yaml', server.url).href;
        const unresolved = await createFileSystem({ value: foreign, rootURL: url });
        expect(JSON.stringify(unresolved[0]?.specification)).not.toContain(
            'io.swagger.petstore.model.User'
        );
    });
});
