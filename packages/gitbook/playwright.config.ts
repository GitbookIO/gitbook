import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: [
        process.env.CI ? ['dot'] : ['list'],
        ['@argos-ci/playwright/reporter', { uploadToArgos: !!process.env.CI }],
    ],
    projects: [
        // To speed up CI, we only test on Chrome.
        // https://github.com/microsoft/playwright/issues/14434
        // https://playwright.dev/docs/browsers#google-chrome--microsoft-edge
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                channel: 'chrome',
                launchOptions: {
                    args: [
                        // Disable subpixel (LCD) text so glyphs always render with
                        // grayscale antialiasing — removes the red/blue edge fringing
                        // that varies between macOS (local) and Linux (CI) runs.
                        '--disable-lcd-text',
                        // Disable font hinting so glyph rasterization is platform-independent.
                        '--font-render-hinting=none',
                        // Force software rendering everywhere so image compositing/downscaling
                        // always goes through the same filter, whether or not a GPU is present —
                        // a machine with a real GPU renders images more sharply than headless CI
                        // (no GPU, SwiftShader fallback), causing smooth-vs-pixelated diffs.
                        '--disable-gpu',
                        '--use-gl=swiftshader',
                    ],
                },
            },
        },
    ],
    use: {
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        contextOptions: {
            reducedMotion: 'reduce',
        },
    },
});
