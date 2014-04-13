define([
    "jQuery",
    "core/progress"
], function($, progress) {
    var prev, next;

    // Prevent cache so that using the back button works
    // See: http://stackoverflow.com/a/15805399/983070
    $.ajaxSetup({
        cache: false
    });

    // Recreate first page when the page loads.
    history.replaceState({ path: window.location.href }, '');

    // Back Button Hijacking :(
    window.onpopstate = function (event) {
        if (event.state === null) {
            return;
        }

        return handleNavigation(event.state.path, false);
    };

    function updateHistory (url, title) {
        history.pushState({ path: url }, title, url);
    }

    function handleNavigation (url, push) {
        if (typeof history.pushState === "undefined") {
          // Refresh the page to the new URL if pushState not supported
          location.href = url;
        }

        return $.get(url).done(function (data) {
            $('.book-body').html($(data).find('.book-body').html());
            $('.book-summary').html($(data).find('.book-summary').html());
            if (push) updateHistory(url, null);
            progress.show();
        }).fail(function () {
            location.href = url;
        });
    }

    var handlePagination = function (e) {
        e.stopPropagation();
        e.preventDefault();

        var url = $(this).attr('href');
        if (url) handleNavigation(url, true);
    };

    var goNext = function() {
        var url = $(".navigation-next").attr("href");
        if (url) handleNavigation(url, true);
    };

    var goPrev = function() {
        var url = $(".navigation-prev").attr("href");
        if (url) handleNavigation(url, true);
    };

    $(document).on('click', ".navigation-prev", handlePagination);
    $(document).on('click', ".navigation-next", handlePagination);
    $(document).on('click', ".summary [data-path] a", handlePagination);

    return {
        goNext: goNext,
        goPrev: goPrev
    };
});