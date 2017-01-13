#!/bin/bash

defaultTag=latest

echo ""
echo "You are trying to publish a new version of GitBook"
echo "⚠️  Currently, because of NPM access, this script can only be run by Samy"
echo ""
echo "Steps:"
echo " 1. Enter the new version"
echo " 2. Packages will be published on NPM"
echo " 3. Commit the changes with message 'Bump version to X 🚀 '"
echo " 4. Tag the commit"
echo " 5. Push"
echo ""

read -p "Version: " version
read -p "NPM Tag [$defaultTag]:" tag
tag=${tag:-$defaultTag}
echo ""

echo "You are going to publish version ${version} on NPM (tagged as ${tag})"
echo "Press [ENTER] tp confirm"
read

lerna publish --skip-git --repo-version $[version] --npm-tag ${tag} --force-publish=*
