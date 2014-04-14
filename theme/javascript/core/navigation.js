define([
    "jQuery",
    "utils/analytic",
    "core/state",
    "core/search",
    "core/progress",
    "core/exercise",
    "core/quiz"
], function($, analytic, state, search, progress, exercises, quiz) {
    var prev, next;
    var githubCountStars, githubCountWatch;

    var updateHistory = function(url, title) {
        history.pushState({ path: url }, title, url);
    };

    var handleNavigation = function(url, push) {
        if (typeof history.pushState === "undefined") {
            // Refresh the page to the new URL if pushState not supported
            location.href = url;
            return
        }

        return $.get(url)
        .done(function (html) {
            html = html.replace( /<(\/?)(html|head|body)([^>]*)>/ig, function(a,b,c,d){
                return '<' + b + 'div' + ( b ? '' : ' data-element="' + c + '"' ) + d + '>';
            });

            var $page = $(html);
            var $pageHead = $page.find("[data-element=head]");

            // Merge heads
            var headContent = $pageHead.html()

            $("head style").each(function() {
                headContent = headContent + this.outerHTML
            });
            $("head").html(headContent);

            // Update header, body and summary
            $('.book-header').html($page.find('.book-header').html());
            $('.book-body').html($page.find('.book-body').html());
            $('.book-summary').html($page.find('.book-summary').html());

            if (push) updateHistory(url, null);
            preparePage();
        })
        .fail(function () {
            location.href = url;
        });
    };

    var updateGitHubCounts = function() {
        $(".book-header .count-star span").text(githubCountStars);
        $(".book-header .count-watch span").text(githubCountWatch);
    };

    var updateNavigationPosition = function() {
        var bodyInnerWidth, pageWrapperWidth;

        bodyInnerWidth = parseInt($('.body-inner').css('width'), 10);
        pageWrapperWidth = parseInt($('.page-wrapper').css('width'), 10);
        $('.navigation-next').css('margin-right', (bodyInnerWidth - pageWrapperWidth) + 'px');
    };

    var preparePage = function() {
        var $pageWrapper = $(".book-body .page-wrapper");

        // Bind exercises/quiz
        exercises.init();
        quiz.init();

        // Show progress
        progress.show();

        // Update navigation position
        updateNavigationPosition();

        // Reset scroll
        $pageWrapper.scrollTop(0);

        // Focus on content
        $pageWrapper.focus();

        // Prepare search bar
        search.prepare();

        // Update GitHub count
        if (state.githubId) {
            if (githubCountStars) {
                updateGitHubCounts();
            } else {
                $.getJSON("https://api.github.com/repos/"+state.githubId)
                .done(function(repo) {
                    githubCountStars = repo.stargazers_count;
                    githubCountWatch = repo.subscribers_count;
                    updateGitHubCounts();
                });
            }
        }

        // Send to mixpanel
        analytic.track("page.view");
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
        
        $(window).resize(updateNavigationPosition);

        // Prepare current page
        preparePage();
    };

    return {
        init: init,
        goNext: goNext,
        goPrev: goPrev
    };
});