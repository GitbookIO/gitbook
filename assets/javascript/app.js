require([
    "jQuery",
    "core/state",
    "core/exercise",
    "core/progress",
], function($, _state, exercise, progress){
    $(document).ready(function() {
        var state = _state();
        var $book = state.$book;

        // Toggle summary
        $book.find(".book-header .toggle-summary").click(function(e) {
            e.preventDefault();
            $book.toggleClass("with-summary");
        });

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