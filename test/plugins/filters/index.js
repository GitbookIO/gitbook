module.exports = {
    filters: {
        hello: function(text) {
            return "Hello "+text;
        },
        helloCtx: function(text) {
            return text+":"+this.book.root;
        }
    }
};