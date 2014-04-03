require([
    "jQuery",
    "utils/storage",
    "utils/analytic",
    "core/state",
    "core/exercise",
    "core/progress",
    "core/sidebar"
], function($, storage, analytic, _state, exercise, progress, sidebar){
    $(document).ready(function() {
        var state = _state();
        var $book = state.$book;

        // Initialize storage
        storage.setBaseKey(state.githubId);

        // Tract page view
        analytic.track("View");

        // Init sidebar
        sidebar.init();

        // Star and watch count
        $.getJSON("https://api.github.com/repos/"+state.githubId)
        .done(function(repo) {
            $book.find(".count-star span").text(repo.stargazers_count);
            $book.find(".count-watch span").text(repo.subscribers_count);
        });

        // Bind exercise
        exercise.init();

        // Show progress
        progress.show();
    });
});