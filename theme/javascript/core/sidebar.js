define([
    'jQuery',
    'lodash',
    'utils/storage',
    'utils/platform',
    'core/state'
], function($, _, storage, platform, state) {
    // Toggle sidebar with or withour animation
    function toggleSidebar(_state, animation) {
        if (state != null && isOpen() == _state) return;
        if (animation == null) animation = true;

        state.$book.toggleClass('without-animation', !animation);
        state.$book.toggleClass('with-summary', _state);

        storage.set('sidebar', isOpen());
    }

    // Return true if sidebar is open
    function isOpen() {
        return state.$book.hasClass('with-summary');
    }

    // Prepare sidebar: state and toggle button
    function init() {
        // Init last state if not mobile
        if (!platform.isMobile) {
            toggleSidebar(storage.get('sidebar', true), false);
        }
    }

    // Filter summary with a list of path
    function filterSummary(paths) {
        var $summary = $('.book-summary');

        $summary.find('li').each(function() {
            var path = $(this).data('path');
            var st = paths == null || _.contains(paths, path);

            $(this).toggle(st);
            if (st) $(this).parents('li').show();
        });
    }

    return {
        init: init,
        isOpen: isOpen,
        toggle: toggleSidebar,
        filter: filterSummary
    };
});