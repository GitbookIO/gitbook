require([
    "jQuery",
    "utils/storage",
    "utils/analytic",
    "utils/sharing",

    "core/state",
    "core/keyboard",
    "core/exercise",
    "core/progress",
    "core/sidebar",
    "core/search"
], function($, storage, analytic, sharing, state, keyboard, exercise, progress, sidebar, search){
    $(document).ready(function() {
        var $book = state.$book;

        // Initialize storage
        storage.setBaseKey(state.githubId);

        // Init sidebar
        sidebar.init();

        // Load search
        search.init();

        // Init keyboard
        keyboard.init();

        // Star and watch count
        $.getJSON("https://api.github.com/repos/" + state.githubId).done(function (repo) {
            $book.find(".count-star span").text(repo.stargazers_count);
            $book.find(".count-watch span").text(repo.subscribers_count);
        });

        // Bind exercise
        exercise.init();

        // Bind sharing button
        sharing.init();

        // Show progress
        progress.show();

        // Focus on content
        $(".book-body").focus();
    });
});