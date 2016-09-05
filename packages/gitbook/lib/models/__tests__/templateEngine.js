
describe('TemplateBlock', function() {
    var TemplateEngine = require('../templateEngine');

    describe('create', function() {
        it('must initialize with a list of filters', function() {
            var engine = TemplateEngine.create({
                filters: {
                    hello: function(name) {
                        return 'Hello ' + name + '!';
                    }
                }
            });
            var env = engine.toNunjucks();
            var res = env.renderString('{{ "Luke"|hello }}');

            expect(res).toBe('Hello Luke!');
        });

        it('must initialize with a list of globals', function() {
            var engine = TemplateEngine.create({
                globals: {
                    hello: function(name) {
                        return 'Hello ' + name + '!';
                    }
                }
            });
            var env = engine.toNunjucks();
            var res = env.renderString('{{ hello("Luke") }}');

            expect(res).toBe('Hello Luke!');
        });

        it('must pass context to filters and blocks', function() {
            var engine = TemplateEngine.create({
                filters: {
                    hello: function(name) {
                        return 'Hello ' + name + ' ' + this.lastName + '!';
                    }
                },
                context: {
                    lastName: 'Skywalker'
                }
            });
            var env = engine.toNunjucks();
            var res = env.renderString('{{ "Luke"|hello }}');

            expect(res).toBe('Hello Luke Skywalker!');
        });
    });
});