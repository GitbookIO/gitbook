
describe('TemplateBlock', function() {
    const TemplateEngine = require('../templateEngine');

    describe('create', function() {
        it('must initialize with a list of filters', function() {
            const engine = TemplateEngine.create({
                filters: {
                    hello(name) {
                        return 'Hello ' + name + '!';
                    }
                }
            });
            const env = engine.toNunjucks();
            const res = env.renderString('{{ "Luke"|hello }}');

            expect(res).toBe('Hello Luke!');
        });

        it('must initialize with a list of globals', function() {
            const engine = TemplateEngine.create({
                globals: {
                    hello(name) {
                        return 'Hello ' + name + '!';
                    }
                }
            });
            const env = engine.toNunjucks();
            const res = env.renderString('{{ hello("Luke") }}');

            expect(res).toBe('Hello Luke!');
        });

        it('must pass context to filters and blocks', function() {
            const engine = TemplateEngine.create({
                filters: {
                    hello(name) {
                        return 'Hello ' + name + ' ' + this.lastName + '!';
                    }
                },
                context: {
                    lastName: 'Skywalker'
                }
            });
            const env = engine.toNunjucks();
            const res = env.renderString('{{ "Luke"|hello }}');

            expect(res).toBe('Hello Luke Skywalker!');
        });
    });
});
