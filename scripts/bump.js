#! /usr/bin/env node

const fs = require('fs');
const path = require('path');

const lernaConfig = require('../lerna.json');

// List all the packages
const PACKAGES_DIR = path.resolve(__dirname, '../packages');
const packages = fs.readdirSync(PACKAGES_DIR);

function updateDependencies(dependencies) {
    if (!dependencies) {
        return;
    }

    Object.keys(dependencies).map((key) => {
        if (!packages.includes(key)) {
            return;
        }

        dependencies[key] = lernaConfig.version;
    });
}

packages.forEach((name) => {
    // Avoid .DS_Store
    if (name[0] === '.') {
        return;
    }

    const pkgPath = path.resolve(PACKAGES_DIR, name, 'package.json');
    const pkg = require(pkgPath);

    pkg.version = lernaConfig.version;
    updateDependencies(pkg.dependencies);
    updateDependencies(pkg.devDependencies);

    const json = JSON.stringify(pkg, null, 2);

    fs.writeFileSync(pkgPath, `${json}\n`, 'utf-8');
});
