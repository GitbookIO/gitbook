define([
    "execute/javascript"
], function(javascript) {
    var LANGUAGES = {
        "javascript": javascript
    };


    var evalJS = function(lang, code, callback) {
        var ready = false;
        var finished = false;

        var finish = function() {
            if(finished) {
                return console.error('Already finished');
            }
            finished = true;
            return callback.apply(null, arguments);
        };

        var repl;

        // Handles all our events
        var eventHandler = function(data, eventType) {
            console.log([eventType, data]);
            switch(eventType) {
                case 'progress':
                    // Update UI loading bar
                    break;
                case 'timeout':
                    finish(new Error(data));
                    break;
                case 'result':
                    finish(null, {
                        value: data,
                        type: 'result'
                    });
                    break;
                case 'error':
                    if(ready) {
                        return finish(null, {
                            value: data,
                            type: 'error'
                        });
                    }
                    return finish(new Error(data));
                    break
                case 'ready':
                    // We're good to get results and stuff back now
                    ready = true;
                    // Eval our code now that the runtime is ready
                    repl.eval(code);
                    break;
                default:
                    console.log('Unhandled event =', eventType, 'data =', data);
            }
        };

        repl = new lang.REPL({
            input: eventHandler,
            output: eventHandler,
            result: eventHandler,
            error: eventHandler,
            progress: eventHandler,
            timeout: {
                time: 30000,
                callback: eventHandler
            }
        });

        repl.loadLanguage(lang.id, eventHandler);
    };

    var execute = function(lang, solution, validation, context, callback) {
        // Language data
        var langd =  LANGUAGES[lang];

        // Check language is supported
        if (!langd) return callback(new Error("Language '"+lang+"' not available for execution"));

        // Validate with validation code
        var code = [
            context,
            solution,
            langd.assertCode,
            validation,
        ].join(langd.sep);
        evalJS(langd, code, function(err, res) {
            if(err) return callback(err);

            if (res.type == "error") callback(new Error(res.value));
            else callback(null, res.value);
        });
    };

    return execute;
});
