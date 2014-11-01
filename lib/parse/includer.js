// Return a fs inclduer
module.exports = function(ctx, folders, resolveFile, readFile) {
    return function(name) {
        return ctx[name] ||
        folders.map(function(folder) {
            // Try including snippet from FS
            try {
                var fname = resolveFile(folder, name);
                // Trim trailing newlines/space of imported snippets
                return readFile(fname, 'utf8').trimRight();
            } catch(err) {}
        })
        .filter(Boolean)[0];
    }
};
