define([
    "jQuery",
    "utils/execute",
    "utils/analytic",
    "core/state"
], function($, execute, analytic, state){
    // Bind an exercise
    var prepareExercise = function($exercise) {
        var codeSolution = $exercise.find(".code-solution").text();
        var codeValidation = $exercise.find(".code-validation").text();

        var editor = ace.edit($exercise.find(".editor").get(0));
        editor.setTheme("ace/theme/tomorrow");
        editor.getSession().setUseWorker(false);
        editor.getSession().setMode("ace/mode/javascript");

        // Submit: test code
        $exercise.find(".action-submit").click(function(e) {
            e.preventDefault();

            analytic.track("exercise.submit");

            execute("javascript", editor.getValue(), codeValidation, function(err, result) {
                $exercise.toggleClass("return-error", err != null);
                $exercise.toggleClass("return-success", err == null);
                if (err) $exercise.find(".alert-danger").text(err.message || err);
            });
        });

        // Set solution
        $exercise.find(".action-solution").click(function(e) {
            e.preventDefault();

            editor.setValue(codeSolution);
            editor.gotoLine(0);
        });
    };

    // Prepare all exercise
    var init = function() {
        state.$book.find("section.exercise").each(function() {
            prepareExercise($(this));
        });
    };

    return {
        init: init,
        prepare: prepareExercise
    };
});