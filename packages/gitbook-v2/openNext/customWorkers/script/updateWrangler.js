// In this script, we use the args from the cli to update the PREVIEW_URL vars in the wrangler config file for the middleware
const fs = require('node:fs');
const path = require('node:path');

const wranglerConfigPath = path.join(__dirname, '../middlewareWrangler.jsonc');

const file = fs.readFileSync(wranglerConfigPath, 'utf-8');

const args = process.argv.slice(2);
// The versionId is in the format xxx-xxx-xxx-xxx, we need the first part to reconstruct the preview URL
const versionId = args[0];

const updatedFile = file.replace(/"VERSION_ID": "TO_REPLACE"/, `"VERSION_ID": "${versionId}"`);

fs.writeFileSync(wranglerConfigPath, updatedFile);
