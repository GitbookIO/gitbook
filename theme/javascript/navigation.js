var $ = require('jquery');
var url = require('url');

var events = require('./events');
var state = require('./state');
var loading = require('./loading');


var usePushState = (typeof history.pushState !== 'undefined');

function handleNavigation(relativeUrl, push) {
    var uri = url.resolve(window.location.pathname, relativeUrl);

    if (!usePushState) {
        // Refresh the page to the new URL if pushState not supported
        location.href = relativeUrl;
        return;
    }

    return loading.show($.get(uri)
    .done(function (html) {
        // Push url to history
        if (push) history.pushState({ path: uri }, null, uri);

        // Replace html content
        html = html.replace( /<(\/?)(html|head|body)([^>]*)>/ig, function(a,b,c,d){
            return '<' + b + 'div' + ( b ? '' : ' data-element="' + c + '"' ) + d + '>';
        });

        var $page = $(html);
        var $pageHead = $page.find('[data-element=head]');
        var $pageBody = $page.find('.book');

        // Merge heads
        // !! Warning !!: we only update necessary portions to avoid strange behavior (page flickering etc ...)

        // Update title
        document.title = $pageHead.find('title').text();

        // Reference to $('head');
        var $head = $('head');

        // Update next & prev <link> tags
        // Remove old
        $head.find('link[rel=prev]').remove();
        $head.find('link[rel=next]').remove();

        // Add new next * prev <link> tags
        $head.append($pageHead.find('link[rel=prev]'));
        $head.append($pageHead.find('link[rel=next]'));

        // Merge body
        var bodyClass = $('.book').attr('class');
        var scrollPosition = $('.book-summary .summary').scrollTop();
        $pageBody.toggleClass('with-summary', $('.book').hasClass('with-summary'));

        $('.book').replaceWith($pageBody);
        $('.book').attr('class', bodyClass);
        $('.book-summary .summary').scrollTop(scrollPosition);

        // Update state
        state.update($('html'));
        preparePage();
    })
    .fail(function (e) {
        location.href = relativeUrl;
    }));
}

function updateNavigationPosition() {
    var bodyInnerWidth, pageWrapperWidth;

    bodyInnerWidth = parseInt($('.body-inner').css('width'), 10);
    pageWrapperWidth = parseInt($('.page-wrapper').css('width'), 10);
    $('.navigation-next').css('margin-right', (bodyInnerWidth - pageWrapperWidth) + 'px');
}

function notifyPageChange() {
    events.trigger('page.change');
}

function preparePage(notify) {
    var $bookBody = $('.book-body');
    var $bookInner = $bookBody.find('.body-inner');
    var $pageWrapper = $bookInner.find('.page-wrapper');

    // Update navigation position
    updateNavigationPosition();

    // Focus on content
    $pageWrapper.focus();

    // Reset scroll
    $bookInner.scrollTop(0);
    $bookBody.scrollTop(0);

    // Notify
    if (notify !== false) notifyPageChange();
}

function isLeftClickEvent(e) {
    return e.button === 0;
}

function isModifiedEvent(e) {
    return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}

function handlePagination(e) {
    if (isModifiedEvent(e) || !isLeftClickEvent(e)) {
        return;
    }

    e.stopPropagation();
    e.preventDefault();

    var url = $(this).attr('href');
    if (url) handleNavigation(url, true);
}

function goNext() {
    var url = $('.navigation-next').attr('href');
    if (url) handleNavigation(url, true);
}

function goPrev() {
    var url = $('.navigation-prev').attr('href');
    if (url) handleNavigation(url, true);
}


function init() {
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

    $(document).on('click', '.navigation-prev', handlePagination);
    $(document).on('click', '.navigation-next', handlePagination);
    $(document).on('click', '.summary [data-path] a', handlePagination);

    $(window).resize(updateNavigationPosition);

    // Prepare current page
    preparePage(false);
}

module.exports = {
    init: init,
    goNext: goNext,
    goPrev: goPrev,
    notify: notifyPageChange
};
