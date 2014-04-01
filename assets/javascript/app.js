require([
    "jQuery"
], function($){
    $(document).ready(function() {
        var $book = $(".book");

        // Toggle summary
        $book.find(".book-header .toggle-summary").click(function(e) {
            e.preventDefault();
            $book.toggleClass("with-summary");
        });

        // Star and watch count
        $.getJSON("https://api.github.com/repos/{{ githubId }}")
        .done(function(repo) {
            $book.find(".count-star span").text(repo.stargazers_count);
            $book.find(".count-watch span").text(repo.subscribers_count);
        });

        // Bind exercises
        $book.find("section.exercise").each(function() {
            var $exercise = $(this);

            var codeSolution = $exercise.find(".code-solution").html();
            var codeValidation = $exercise.find(".code-validation").html();

            var editor = ace.edit($exercise.find(".editor").get(0));
            editor.setTheme("ace/theme/tomorrow");
            editor.getSession().setMode("ace/mode/javascript");

            $exercise.find(".action-submit").click(function(e) {
                e.preventDefault();

                alert("submit");
            });
            $exercise.find(".action-solution").click(function(e) {
                e.preventDefault();

                editor.setValue(codeSolution);
            });
        });
    });
});