// In this script, we use the args from the cli to update the PREVIEW_URL vars in the wrangler config file for the middleware
const fs = require('node:fs');
const path = require('node:path');

const wranglerConfigPath = path.join(__dirname, '../middlewareWrangler.jsonc');

const file = fs.readFileSync(wranglerConfigPath, 'utf-8');

const args = process.argv.slice(2);
// The versionId is in the format xxx-xxx-xxx-xxx, we need the first part to reconstruct the preview URL
const versionId = args[0];

// The preview URL is in the format https://<versionId>-gitbook-open-v2-server-preview.gitbook.workers.dev
const previewUrl = `https://${versionId.split('-')[0]}-gitbook-open-v2-server-preview.gitbook.workers.dev`;

const updatedFile = file.replace(/"PREVIEW_URL": "TO_REPLACE"/, `"PREVIEW_URL": "${previewUrl}"`);

fs.writeFileSync(wranglerConfigPath, updatedFile);
