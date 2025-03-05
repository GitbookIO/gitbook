import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type { Server } from 'bun';
import { createFileSystem } from './filesystem';

async function serveFixture(fixture: string) {
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
        expect(filesystem).toHaveLength(4);
        expect(filesystem[0]?.isEntrypoint).toBe(true);
        expect(filesystem[1]?.isEntrypoint).toBe(false);
        expect(filesystem[1]?.filename).toBe('user.yaml');
        expect(filesystem[2]?.filename).toBe('../tag.yaml');
        expect(filesystem[3]?.filename).toBe('http://localhost:3020/root/pet.yaml');
    });
});
