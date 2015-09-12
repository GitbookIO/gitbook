define([
    "jQuery",
    "utils/url",
    "core/events",
    "core/state",
    "core/progress",
    "core/loading",
    "core/search"
], function($, URL, events, state, progress, loading, search) {
    var prev, next;

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

            ////
            // Merge heads
            // !! Warning !!: we only update necessary portions to avoid strange behavior (page flickering etc ...)
            ////

            // Update title
            document.title = $pageHead.find("title").text();

            // Reference to $("head");
            var $head = $("head");

            // Update next & prev <link> tags
            // Remove old
            $head.find("link[rel=prev]").remove();
            $head.find("link[rel=next]").remove();

            // Add new next * prev <link> tags
            $head.append($pageHead.find("link[rel=prev]"));
            $head.append($pageHead.find("link[rel=next]"));

            // Merge body
            var bodyClass = $(".book").attr("class");
            var scrollPosition = $('.book-summary .summary').scrollTop();
            $pageBody.toggleClass("with-summary", $(".book").hasClass("with-summary"))

            $(".book").replaceWith($pageBody);
            $(".book").attr("class", bodyClass);
            $('.book-summary .summary').scrollTop(scrollPosition);

            // Update state
            state.update($("html"));
            // recover search keyword
            search.recover();
            preparePage();
        })
        .fail(function (e) {
            location.href = relativeUrl;
        }));
    };

    var updateNavigationPosition = function() {
        var bodyInnerWidth, pageWrapperWidth;

        bodyInnerWidth = parseInt($('.body-inner').css('width'), 10);
        pageWrapperWidth = parseInt($('.page-wrapper').css('width'), 10);
        $('.navigation-next').css('margin-right', (bodyInnerWidth - pageWrapperWidth) + 'px');
    };

    var preparePage = function() {
        var $bookBody = $(".book-body");
        var $bookInner = $bookBody.find(".body-inner");
        var $pageWrapper = $bookInner.find(".page-wrapper");

        // Show progress
        progress.show();

        // Update navigation position
        updateNavigationPosition();

        // Focus on content
        $pageWrapper.focus();

        // Reset scroll
        $bookInner.scrollTop(0);
        $bookBody.scrollTop(0);

        // Notify
        events.trigger("page.change");
    };

    var isLeftClickEvent = function (e) {
        return e.button === 0;
    };

    var isModifiedEvent = function (e) {
        return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
    };

    var handlePagination = function (e) {
        if (isModifiedEvent(e) || !isLeftClickEvent(e)) {
          return;
        }

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

