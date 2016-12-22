const { Record, Map } = require('immutable');

const TemplateBlock = require('./templateBlock');
const PluginDependency = require('./pluginDependency');
const THEME_PREFIX = require('../constants/themePrefix');

const DEFAULT_VERSION = '*';

const DEFAULTS = {
    name:    String(),
    // Requirement version (ex: ">1.0.0")
    version: String(DEFAULT_VERSION),
    // Path to load this plugin
    path:    String(),
    // Depth of this plugin in the dependency tree
    depth:   Number(0),
    // Parent depending on this plugin
    parent:  String(),
    // Content of the "package.json"
    package: Map(),
    // Content of the package itself
    content: Map()
};

class Plugin extends Record(DEFAULTS) {
    getName() {
        return this.get('name');
    }

    getPath() {
        return this.get('path');
    }

    getVersion() {
        return this.get('version');
    }

    getPackage() {
        return this.get('package');
    }

    getContent() {
        return this.get('content');
    }

    getDepth() {
        return this.get('depth');
    }

    getParent() {
        return this.get('parent');
    }

    /**
     * Return the ID on NPM for this plugin
     * @return {String}
     */
    getNpmID() {
        return PluginDependency.nameToNpmID(this.getName());
    }

    /**
     * Check if a plugin is loaded
     * @return {Boolean}
     */
    isLoaded() {
        return Boolean(this.getPackage().size > 0);
    }

    /**
     * Check if a plugin is a theme given its name
     * @return {Boolean}
     */
    isTheme() {
        const name = this.getName();
        return (name && name.indexOf(THEME_PREFIX) === 0);
    }

    /**
     * Return map of hooks
     * @return {Map<String:Function>}
     */
    getHooks() {
        return this.getContent().get('hooks') || Map();
    }

    /**
     * Return map of filters
     * @return {Map<String:Function>}
     */
    getFilters() {
        return this.getContent().get('filters');
    }

    /**
     * Return map of blocks
     * @return {Map<String:TemplateBlock>}
     */
    getBlocks() {
        let blocks = this.getContent().get('blocks');
        blocks = blocks || Map();

        return blocks
            .map(function(block, blockName) {
                return TemplateBlock.create(blockName, block);
            });
    }

    /**
     * Return a specific hook
     * @param {String} name
     * @return {Function|undefined}
     */
    getHook(name) {
        return this.getHooks().get(name);
    }

    /**
     * Create a plugin from a string
     * @param {String}
     * @return {Plugin}
     */
    static createFromString(s) {
        const parts = s.split('@');
        const name = parts[0];
        const version = parts.slice(1).join('@');

        return new Plugin({
            name,
            version: version || DEFAULT_VERSION
        });
    }

    /**
     * Create a plugin from a dependency
     * @param {PluginDependency}
     * @return {Plugin}
     */
    static createFromDep(dep) {
        return new Plugin({
            name: dep.getName(),
            version: dep.getVersion()
        });
    }
}

Plugin.nameToNpmID = PluginDependency.nameToNpmID;

module.exports = Plugin;
