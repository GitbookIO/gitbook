#! /bin/bash
#
# Compile LESS To CSS
lessc -clean-css ./less/main.less ./_assets/website/theme.css

# Compile JS
gitbook-plugin build ./src/index.js ./_assets/theme.js

# Copy fonts
mkdir -p _assets/website/fonts
cp -R node_modules/font-awesome/fonts/ _assets/website/fonts/fontawesome/
