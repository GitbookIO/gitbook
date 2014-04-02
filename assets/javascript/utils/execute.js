define(function(){
    var evalJS = function(code, callback) {
        var ready = false;
        var finished = false;

        var finish = function() {
            if(finished) {
                return console.error('Already finished');
            }
            finished = true;
            return callback.apply(null, arguments);
        };

        var jsrepl;

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
                    jsrepl.eval(code);
                    break;
                default:
                    console.log('Unhandled event =', eventType, 'data =', data);
            }
        };

        jsrepl = new JSREPL({
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

        jsrepl.loadLanguage('javascript', eventHandler);
    };


    var ass = "function assert(condition, message) { \nif (!condition) { \n throw message || \"Assertion failed\"; \n } \n }\n";   

    var execute = function(solution, validation, callback) {
        // Validate with validation code
        var code = [solution, ass, validation].join(";\n");
        evalJS(code, function(err, res) {
            if(err) return callback(err);

            if (res.type == "error") callback(new Error(res.value));
            else callback(null, res.value);
        });
    };

    return execute;
});