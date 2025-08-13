import { describe, expect, it } from 'bun:test';
import { OpenAPIParseError } from './error';
import { parseOpenAPI } from './parse';

const spec = await Bun.file(new URL('./fixtures/recursive-spec.json', import.meta.url)).text();
const specV2 = await Bun.file(new URL('./fixtures/spec-v2.json', import.meta.url)).text();
const petstoreyaml = await Bun.file(new URL('./fixtures/petstore.yaml', import.meta.url)).text();
const petstoreInvalid = await Bun.file(
    new URL('./fixtures/petstore-invalid.json', import.meta.url)
).text();

const html = `<!DOCTYPE html><html lang=\"en\"><head> <meta charset=\"utf-8\"> <title>API Documentation</title> <base href=\"/api-docs/\"> <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> <link rel=\"icon\" type=\"image/x-icon\" href=\"favicon.ico\"> <link rel=\"stylesheet\" href=\"https://use.fontawesome.com/releases/v5.7.0/css/all.css\" integrity=\"sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ\" crossorigin=\"anonymous\"> <style>@import\"https://fonts.googleapis.com/css2?family=Nunito:wght@200&display=swap\";@charset \"UTF-8\";:root{--bs-blue:#0d6efd;--bs-indigo:#6610f2;--bs-purple:#6f42c1;--bs-pink:#d63384;--bs-red:#dc3545;--bs-orange:#fd7e14;--bs-yellow:#ffc107;--bs-green:#198754;--bs-teal:#20c997;--bs-cyan:#0dcaf0;--bs-black:#000;--bs-white:#fff;--bs-gray:#6c757d;--bs-gray-dark:#343a40;--bs-gray-100:#f8f9fa;--bs-gray-200:#e9ecef;--bs-gray-300:#dee2e6;--bs-gray-400:#ced4da;--bs-gray-500:#adb5bd;--bs-gray-600:#6c757d;--bs-gray-700:#495057;--bs-gray-800:#343a40;--bs-gray-900:#212529;--bs-primary:#0d6efd;--bs-secondary:#6c757d;--bs-success:#198754;--bs-info:#0dcaf0;--bs-warning:#ffc107;--bs-danger:#dc3545;--bs-light:#f8f9fa;--bs-dark:#212529;--bs-primary-rgb:13,110,253;--bs-secondary-rgb:108,117,125;--bs-success-rgb:25,135,84;--bs-info-rgb:13,202,240;--bs-warning-rgb:255,193,7;--bs-danger-rgb:220,53,69;--bs-light-rgb:248,249,250;--bs-dark-rgb:33,37,41;--bs-white-rgb:255,255,255;--bs-black-rgb:0,0,0;--bs-body-color-rgb:33,37,41;--bs-body-bg-rgb:255,255,255;--bs-font-sans-serif:system-ui,-apple-system,\"Segoe UI\",Roboto,\"Helvetica Neue\",\"Noto Sans\",\"Liberation Sans\",Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\",\"Noto Color Emoji\";--bs-font-monospace:SFMono-Regular,Menlo,Monaco,Consolas,\"Liberation Mono\",\"Courier New\",monospace;--bs-gradient:linear-gradient(180deg, rgba(255, 255, 255, .15), rgba(255, 255, 255, 0));--bs-body-font-family:var(--bs-font-sans-serif);--bs-body-font-size:1rem;--bs-body-font-weight:400;--bs-body-line-height:1.5;--bs-body-color:#212529;--bs-body-bg:#fff;--bs-border-width:1px;--bs-border-style:solid;--bs-border-color:#dee2e6;--bs-border-color-translucent:rgba(0, 0, 0, .175);--bs-border-radius:.375rem;--bs-border-radius-sm:.25rem;--bs-border-radius-lg:.5rem;--bs-border-radius-xl:1rem;--bs-border-radius-2xl:2rem;--bs-border-radius-pill:50rem;--bs-link-color:#0d6efd;--bs-link-hover-color:#0a58ca;--bs-code-color:#d63384;--bs-highlight-bg:#fff3cd}*,:after,:before{box-sizing:border-box}@media (prefers-reduced-motion:no-preference){:root{scroll-behavior:smooth}}body{margin:0;font-family:var(--bs-body-font-family);font-size:var(--bs-body-font-size);font-weight:var(--bs-body-font-weight);line-height:var(--bs-body-line-height);color:var(--bs-body-color);text-align:var(--bs-body-text-align);background-color:var(--bs-body-bg);-webkit-text-size-adjust:100%;-webkit-tap-highlight-color:transparent}:root{--primaryColor1:#373e3e;--primaryColor2:#373e3e;--white:#ffffff;--lightGrey:#F8F9F9;--grey:#F8F9F9;--darkGrey:#6c757d;--black:black}*{box-sizing:border-box}body{font-family:Nunito,sans-serif;background-color:var(--grey);margin:5px auto}</style><link rel=\"stylesheet\" href=\"styles.css\" media=\"print\" onload=\"this.media='all'\"><noscript><link rel=\"stylesheet\" href=\"styles.css\"></noscript></head> <body> <app-root></app-root> <script> parent.postMessage(location.hash, location.origin); </script> <script src=\"runtime.js\" type=\"module\"></script><script src=\"polyfills.js\" type=\"module\"></script><script src=\"scripts.js\" defer></script><script src=\"main.js\" type=\"module\"></script> <script type=\"text/javascript\" src=\"/_Incapsula_Resource?SWJIYLWA=719d34d31c8e3a6e6fffd425f7e032f3&ns=2&cb=242625292\" async></script></body></html>`;

describe('#parseOpenAPI', () => {
    it('parses a recursive OpenAPI document', async () => {
        const result = await parseOpenAPI({
            value: spec,
            rootURL: null,
        });
        // Ensure the structure returned is not recursive (not dereferenced).
        JSON.stringify(result.filesystem);
    });

    it('parses a swagger v2', async () => {
        const result = await parseOpenAPI({
            value: specV2,
            rootURL: null,
        });
        // Ensure the structure returned is not recursive (not dereferenced).
        JSON.stringify(result.filesystem);
    });

    it('throws an error for invalid OpenAPI document', async () => {
        expect.assertions(1);
        try {
            await parseOpenAPI({
                value: html,
                rootURL: null,
            });
        } catch (error) {
            if (error instanceof OpenAPIParseError) {
                expect(error.message).toContain(
                    'Can’t find supported Swagger/OpenAPI version in the provided document, version must be a string.'
                );
            }
        }
    });

    it('allows a document yaml', async () => {
        const result = await parseOpenAPI({
            value: petstoreyaml,
            rootURL: null,
        });
        // Ensure the structure returned is not recursive (not dereferenced).
        JSON.stringify(result.filesystem);
    });

    it('allows a document with errors', async () => {
        const result = await parseOpenAPI({
            value: petstoreInvalid,
            rootURL: null,
        });
        // Ensure the structure returned is not recursive (not dereferenced).
        JSON.stringify(result.filesystem);
        expect(result.errors).toHaveLength(1);
    });
});
