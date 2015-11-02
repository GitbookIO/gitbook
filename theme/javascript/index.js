var $ = require('jquery');
var _ = require('lodash');

var storage = require('./storage');
var dropdown = require('./dropdown');
var events = require('./events');
var state = require('./state');
var keyboard = require('./keyboard');
var navigation = require('./navigation');
var sidebar = require('./sidebar');
var toolbar = require('./toolbar');


function start(config) {
    // Init sidebar
    sidebar.init();

    // Init keyboard
    keyboard.init();

    // Bind dropdown
    dropdown.init();

    // Init navigation
    navigation.init();


    // Add action to toggle sidebar
    toolbar.createButton({
        index: 0,
        icon: 'fa fa-align-justify',
        onClick: function(e) {
            e.preventDefault();
            sidebar.toggle();
        }
    });

    events.trigger('start', config);
    navigation.notify();
}

// Export APIs for plugins
var gitbook = {
    start: start,
    events: events,
    state: state,

    // UI sections
    toolbar: toolbar,
    sidebar: sidebar,

    // Read/Write the localstorage
    storage: storage,

    // Create keyboard shortcuts
    keyboard: keyboard
};


// Modules mapping for plugins
var MODULES = {
    'gitbook': gitbook,
    'jquery': $,
    'lodash': _
};

window.gitbook = gitbook;
window.$ = $;
window.jQuery = $;
window.require = function(mods, fn) {
    mods = _.map(mods, function(mod) {
        mod = mod.toLowerCase();
        if (!MODULES[mod]) {
            throw new Error('GitBook module '+mod+' doesn\'t exist');
        }

        return MODULES[mod];
    });

    fn.apply(null, mods);
};

module.exports = {};

