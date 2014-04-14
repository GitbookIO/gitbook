define([
    "jQuery",
    "core/progress",
    "core/exercise",
    "core/quiz"
], function($, progress, exercises, quiz) {
    var prev, next;

    var updateHistory = function(url, title) {
        history.pushState({ path: url }, title, url);
    };

    var handleNavigation = function(url, push) {
        if (typeof history.pushState === "undefined") {
            // Refresh the page to the new URL if pushState not supported
            location.href = url;
            return
        }

        console.log("load url", url);
        return $.get(url)
        .done(function (data) {
            var $newPage = $(data);
            var title = data.match("<title>(.*?)</title>")[1];
            
            $('title').text(title);
            $('.book-body').html($newPage.find('.book-body').html());
            $('.book-summary').html($newPage.find('.book-summary').html());

            if (push) updateHistory(url, null);
            preparePage();
        })
        .fail(function () {
            location.href = url;
        });
    };

    var preparePage = function() {
        // Bind exercises/quiz
        exercises.init();
        quiz.init();

        // Show progress
        progress.show();
    };

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

    

    var init = function() {
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

        $(document).on('click', ".navigation-prev", handlePagination);
        $(document).on('click', ".navigation-next", handlePagination);
        $(document).on('click', ".summary [data-path] a", handlePagination);

        // Prepare current page
        preparePage();
    };

    return {
        init: init,
        goNext: goNext,
        goPrev: goPrev
    };
});