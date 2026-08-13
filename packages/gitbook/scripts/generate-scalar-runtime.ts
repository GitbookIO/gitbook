import { mkdir, rename, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'bun';

import { SCALAR_RUNTIME_PATH } from '../src/components/DocumentView/OpenAPI/scalar-runtime-path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outputDir = join(scriptDir, '../public/~gitbook/static/scalar');
const temporaryDir = join(outputDir, '.build');
const scalarPackage = createRequire(import.meta.url)('@scalar/api-client-react/package.json') as {
    version: string;
};

if (SCALAR_RUNTIME_PATH !== `scalar/scalar-api-client@${scalarPackage.version}.mjs`) {
    throw new Error(
        'Update SCALAR_RUNTIME_PATH for the installed @scalar/api-client-react version'
    );
}

const reactShim = `
const react = () => globalThis.__gitbookScalarReact;
export const createContext = (...args) => react().createContext(...args);
export const useContext = (...args) => react().useContext(...args);
export const useEffect = (...args) => react().useEffect(...args);
export const useRef = (...args) => react().useRef(...args);
export const useSyncExternalStore = (...args) => react().useSyncExternalStore(...args);
`;

const jsxRuntimeShim = `
const runtime = () => globalThis.__gitbookScalarJSXRuntime;
export const jsx = (...args) => runtime().jsx(...args);
export const jsxs = (...args) => runtime().jsxs(...args);
`;

await rm(outputDir, { force: true, recursive: true });
await mkdir(temporaryDir, { recursive: true });

const result = await build({
    entrypoints: [join(scriptDir, 'scalar-runtime.ts')],
    format: 'esm',
    minify: true,
    outdir: temporaryDir,
    plugins: [
        {
            name: 'scalar-react-shims',
            setup(build) {
                build.onResolve({ filter: /^react$/ }, () => ({
                    namespace: 'scalar-runtime',
                    path: 'react',
                }));
                build.onResolve({ filter: /^react\/jsx-runtime$/ }, () => ({
                    namespace: 'scalar-runtime',
                    path: 'react-jsx-runtime',
                }));
                build.onLoad({ filter: /^react$/, namespace: 'scalar-runtime' }, () => ({
                    contents: reactShim,
                    loader: 'js',
                }));
                build.onLoad(
                    { filter: /^react-jsx-runtime$/, namespace: 'scalar-runtime' },
                    () => ({
                        contents: jsxRuntimeShim,
                        loader: 'js',
                    })
                );
            },
        },
    ],
    target: 'browser',
});

const [output] = result.outputs;
if (!result.success || !output || result.outputs.length !== 1) {
    throw new Error(`Unable to build Scalar runtime: ${result.logs.join('\n')}`);
}

const outputPath = join(outputDir, SCALAR_RUNTIME_PATH.replace('scalar/', ''));
await rename(output.path, outputPath);
await rm(temporaryDir, { force: true, recursive: true });
