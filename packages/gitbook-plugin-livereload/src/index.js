const GitBook = require('gitbook-core');

module.exports = GitBook.createPlugin({
    activate: (dispatch, getState, { Components }) => {
        if (typeof window === 'undefined') {
            return;
        }

        const newEl = document.createElement('script');
        const firstScriptTag = document.getElementsByTagName('script')[0];

        if (firstScriptTag) {
            newEl.async = 1;
            newEl.src = '//' + window.location.hostname + ':35729/livereload.js';
            firstScriptTag.parentNode.insertBefore(newEl, firstScriptTag);
        }
    }
});
