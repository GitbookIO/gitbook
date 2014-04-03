require([
    "jQuery",
    "utils/storage",
    "utils/analytic",
    "utils/sharing",

    "core/state",
    "core/keyboard",
    "core/exercise",
    "core/progress",
    "core/sidebar"
], function($, storage, analytic, sharing, _state, keyboard, exercise, progress, sidebar){
    $(document).ready(function() {
        var state = _state();
        var $book = state.$book;

        // Initialize storage
        storage.setBaseKey(state.githubId);

        // Tract page view
        analytic.track("View");

        // Init sidebar
        sidebar.init();

        // Init keyboard
        keyboard.init();

        // Star and watch count
        $.getJSON("https://api.github.com/repos/"+state.githubId)
        .done(function(repo) {
            $book.find(".count-star span").text(repo.stargazers_count);
            $book.find(".count-watch span").text(repo.subscribers_count);
        });

        // Bind exercise
        exercise.init();

        // Bind sharing button
        sharing.init();

        // Show progress
        progress.show();
    });
});