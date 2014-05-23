define([
    "jQuery",
    "utils/url",
    "core/events",
    "core/state",
    "core/progress",
    "core/exercise",
    "core/quiz",
    "core/loading"
], function($, URL, events, state, progress, exercises, quiz, loading) {
    var prev, next;
    var githubCountStars, githubCountWatch;

    var usePushState = (typeof history.pushState !== "undefined");

    var handleNavigation = function(relativeUrl, push) {
        var url = URL.join(window.location.pathname, relativeUrl);
        console.log("navigate to ", url, "baseurl="+relativeUrl, "current="+window.location.pathname);

        if (!usePushState) {
            // Refresh the page to the new URL if pushState not supported
            location.href = relativeUrl;
            return
        }

        return loading.show($.get(url)
        .done(function (html) {
            // Push url to history
            if (push) history.pushState({ path: url }, null, url);

            // Replace html content
            html = html.replace( /<(\/?)(html|head|body)([^>]*)>/ig, function(a,b,c,d){
                return '<' + b + 'div' + ( b ? '' : ' data-element="' + c + '"' ) + d + '>';
            });

            var $page = $(html);
            var $pageHead = $page.find("[data-element=head]");
            var $pageBody = $page.find('.book');

            // Merge heads
            var headContent = $pageHead.html()

            $("head style").each(function() {
                headContent = headContent + this.outerHTML
            });
            $("head").html(headContent);

            // Merge body
            var bodyClass = $(".book").attr("class");
            var scrollPosition = $('.book-summary .summary').scrollTop();
            $pageBody.toggleClass("with-summary", $(".book").hasClass("with-summary"))

            $(".book").replaceWith($pageBody);
            $(".book").attr("class", bodyClass);
            $('.book-summary .summary').scrollTop(scrollPosition);

            // Update state
            state.update($("html"));
            preparePage();
        })
        .fail(function (e) {
            location.href = relativeUrl;
        }));
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
        events.trigger("page.change");
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