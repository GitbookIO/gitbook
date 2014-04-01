require([
    "jQuery",
    "core/state",
    "core/exercise",
    "core/progress",
    "core/sidebar"
], function($, _state, exercise, progress, sidebar){
    $(document).ready(function() {
        var state = _state();
        var $book = state.$book;

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