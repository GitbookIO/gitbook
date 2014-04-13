require([
    "jQuery",
    "utils/storage",
    "utils/analytic",
    "utils/sharing",

    "core/state",
    "core/keyboard",
    "core/exercise",
    "core/quiz",
    "core/progress",
    "core/sidebar",
    "core/search"
], function($, storage, analytic, sharing, state, keyboard, exercise, quiz, progress, sidebar, search){
    function changeNavigationPosition()
    {
        var bodyInnerWidth, pageWrapperWidth;
        bodyInnerWidth = parseInt($('.body-inner').css('width'), 10);
        pageWrapperWidth = parseInt($('.page-wrapper').css('width'), 10);
        $('.navigation-next').css('margin-right', (bodyInnerWidth - pageWrapperWidth) + 'px');
    }
    $(window).on('resize', changeNavigationPosition);
    $(document).ready(function() {
        var $book;
        $book = state.$book;

        // Init sidebar
        sidebar.init();

        // Load search
        search.init();

        // Init keyboard
        keyboard.init();

        if (state.githubId) {
            // Initialize storage
            storage.setBaseKey(state.githubId);

            // Star and watch count
            $.getJSON("https://api.github.com/repos/"+state.githubId)
            .done(function(repo) {
                $book.find(".count-star span").text(repo.stargazers_count);
                $book.find(".count-watch span").text(repo.subscribers_count);
            });
        }

        // Bind exercises
        exercise.init();
        quiz.init();

        // Bind sharing button
        sharing.init();

        // Show progress
        progress.show();

        // Focus on content
        $(".book-body").focus();

        // Move, if needed, right navigation control to allow scrolling.
        changeNavigationPosition();
    });
});
