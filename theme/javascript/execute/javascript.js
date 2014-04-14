define(function() {
    return {
        id: "javascript",
        assertCode: "function assert(condition, message) { \nif (!condition) { \n throw message || \"Assertion failed\"; \n } \n }\n",
        REPL: JSREPL,
        sep: ";\n",
    };
});
