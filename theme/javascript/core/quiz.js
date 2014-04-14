define([
    "jQuery",
    "utils/execute",
    "utils/analytic",
    "core/state"
], function($, execute, analytic, state){
    // Bind an exercise
    var prepareQuiz = function($quiz) {

        $quiz.find(".quiz-answers input").click(function(e) {
            e.preventDefault();
        });

        // Submit: test code
        $quiz.find(".action-submit").click(function(e) {
            e.preventDefault();
            analytic.track("exercise.submit", {type: "quiz"});
            $quiz.find("tr.alert-danger,li.alert-danger").removeClass("alert-danger");
            $quiz.find(".alert-success,.alert-danger").addClass("hidden");

            $quiz.find(".question").each(function(q) {
                var result = true;
                var $answers = $quiz.find(".question-answers").slice(q).find("input[type=radio], input[type=checkbox]");
                $(this).find("input[type=radio],input[type=checkbox]").each(function(i) {
                    var correct = $(this).is(":checked") === $answers.slice(i).first().is(":checked");
                    result = result && correct;
                    if (!correct) {
                        $(this).closest("tr, li").addClass("alert-danger");
                    }
                });
                $(this).find(result ? "div.alert-success" : "div.alert-danger").toggleClass("hidden");
            });

        });

        $quiz.find(".action-solution").click(function(e) {
            e.preventDefault();
            $quiz.find(".question-content, .question-answers").toggleClass("hidden");
        });
    };

    // Prepare all exercise
    var init = function() {
        state.$book.find("section.quiz").each(function() {
            prepareQuiz($(this));
        });
    };

    return {
        init: init,
        prepare: prepareQuiz
    };
});