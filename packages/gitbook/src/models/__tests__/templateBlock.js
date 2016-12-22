const nunjucks = require('nunjucks');
const Immutable = require('immutable');
const Promise = require('../../utils/promise');

describe('TemplateBlock', function() {
    const TemplateBlock = require('../templateBlock');

    describe('.create', function() {
        it('must initialize a simple TemplateBlock from a function', function() {
            const templateBlock = TemplateBlock.create('sayhello', function(block) {
                return { message: 'Hello World' };
            });

            expect(templateBlock.getName()).toBe('sayhello');
            expect(templateBlock.getEndTag()).toBe('endsayhello');
            expect(templateBlock.getBlocks().size).toBe(0);
            expect(templateBlock.getExtensionName()).toBe('BlocksayhelloExtension');
        });
    });

    describe('.toProps', function() {
        it('must handle sync method', function() {
            const templateBlock = TemplateBlock.create('sayhello', function(block) {
                return { message: 'Hello World' };
            });

            return templateBlock.toProps()
            .then(function(props) {
                expect(props).toEqual({ message: 'Hello World' });
            });
        });

        it('must not fail if return a string', function() {
            const templateBlock = TemplateBlock.create('sayhello', function(block) {
                return 'Hello World';
            });

            return templateBlock.toProps()
            .then(function(props) {
                expect(props).toEqual({ children: 'Hello World' });
            });
        });
    });

    describe('.getShortcuts', function() {
        it('must return undefined if no shortcuts', function() {
            const templateBlock = TemplateBlock.create('sayhello', function(block) {
                return { message: 'Hello World' };
            });

            expect(templateBlock.getShortcuts()).toNotExist();
        });

        it('.must return complete shortcut', function() {
            const templateBlock = TemplateBlock.create('sayhello', {
                process(block) {
                    return { message: 'Hello World' };
                },
                shortcuts: {
                    parsers: ['markdown'],
                    start: '$',
                    end: '-'
                }
            });

            const shortcut = templateBlock.getShortcuts();

            expect(shortcut).toBeDefined();
            expect(shortcut.getStart()).toEqual('$');
            expect(shortcut.getEnd()).toEqual('-');
            expect(shortcut.getStartTag()).toEqual('sayhello');
            expect(shortcut.getEndTag()).toEqual('endsayhello');
        });
    });

    describe('.toNunjucksExt()', function() {
        it('should render children correctly', function() {
            const templateBlock = TemplateBlock.create('sayhello', function(block) {
                return 'Hello';
            });

            // Create a fresh Nunjucks environment
            const env = new nunjucks.Environment(null, { autoescape: false });

            // Add template block to environement
            const Ext = templateBlock.toNunjucksExt();
            env.addExtension(templateBlock.getExtensionName(), new Ext());

            // Render a template using the block
            const src = '{% sayhello %}{% endsayhello %}';
            return Promise.nfcall(env.renderString.bind(env), src)
            .then(function(res) {
                expect(res).toBe('<xblock name="sayhello" props="{}">Hello</xblock>');
            });
        });

        it('must handle HTML children', function() {
            const templateBlock = TemplateBlock.create('sayhello', function(block) {
                return '<p>Hello, World!</p>';
            });

            // Create a fresh Nunjucks environment
            const env = new nunjucks.Environment(null, { autoescape: false });

            // Add template block to environement
            const Ext = templateBlock.toNunjucksExt();
            env.addExtension(templateBlock.getExtensionName(), new Ext());

            // Render a template using the block
            const src = '{% sayhello %}{% endsayhello %}';
            return Promise.nfcall(env.renderString.bind(env), src)
            .then(function(res) {
                expect(res).toBe('<xblock name="sayhello" props="{}"><p>Hello, World!</p></xblock>');
            });
        });

        it('must inline props without children', function() {
            const templateBlock = TemplateBlock.create('sayhello', function(block) {
                return {
                    message: block.kwargs.tag + ' ' + block.kwargs.name
                };
            });

            // Create a fresh Nunjucks environment
            const env = new nunjucks.Environment(null, { autoescape: false });

            // Add template block to environement
            const Ext = templateBlock.toNunjucksExt();
            env.addExtension(templateBlock.getExtensionName(), new Ext());

            // Render a template using the block
            const src = '{% sayhello name="Samy", tag="p" %}{% endsayhello %}';
            return Promise.nfcall(env.renderString.bind(env), src)
            .then(function(res) {
                expect(res).toBe('<xblock name="sayhello" props="{&quot;message&quot;:&quot;p Samy&quot;}"></xblock>');
            });
        });

        it('must accept an async function', function() {
            const templateBlock = TemplateBlock.create('sayhello', function(block) {
                return Promise()
                .delay(1)
                .then(function() {
                    return {
                        children: 'Hello ' + block.children
                    };
                });
            });

            // Create a fresh Nunjucks environment
            const env = new nunjucks.Environment(null, { autoescape: false });

            // Add template block to environement
            const Ext = templateBlock.toNunjucksExt();
            env.addExtension(templateBlock.getExtensionName(), new Ext());

            // Render a template using the block
            const src = '{% sayhello %}Samy{% endsayhello %}';
            return Promise.nfcall(env.renderString.bind(env), src)
            .then(function(res) {
                expect(res).toBe('<xblock name="sayhello" props="{}">Hello Samy</xblock>');
            });
        });

        it('must handle nested blocks', function() {
            const templateBlock = new TemplateBlock({
                name: 'yoda',
                blocks: Immutable.List(['start', 'end']),
                process(block) {
                    const nested = {};

                    block.blocks.forEach(function(blk) {
                        nested[blk.name] = blk.children.trim();
                    });

                    return '<p class="yoda">' + nested.end + ' ' + nested.start + '</p>';
                }
            });

            // Create a fresh Nunjucks environment
            const env = new nunjucks.Environment(null, { autoescape: false });

            // Add template block to environement
            const Ext = templateBlock.toNunjucksExt();
            env.addExtension(templateBlock.getExtensionName(), new Ext());

            // Render a template using the block
            const src = '{% yoda %}{% start %}this sentence should be{% end %}inverted{% endyoda %}';
            return Promise.nfcall(env.renderString.bind(env), src)
            .then(function(res) {
                expect(res).toBe('<xblock name="yoda" props="{}"><p class="yoda">inverted this sentence should be</p></xblock>');
            });
        });

        it('must handle multiple inline blocks', function() {
            const templateBlock = new TemplateBlock({
                name: 'math',
                process(block) {
                    return '<math>' + block.children + '</math>';
                }
            });

            // Create a fresh Nunjucks environment
            const env = new nunjucks.Environment(null, { autoescape: false });

            // Add template block to environement
            const Ext = templateBlock.toNunjucksExt();
            env.addExtension(templateBlock.getExtensionName(), new Ext());

            // Render a template using the block after replacing shortcuts
            const src = 'There should be two inline blocks as a result: {% math %}a = b{% endmath %} and {% math %}c = d{% endmath %}';
            return Promise.nfcall(env.renderString.bind(env), src)
            .then(function(res) {
                expect(res).toBe('There should be two inline blocks as a result: <xblock name="math" props="{}"><math>a = b</math></xblock> and <xblock name="math" props="{}"><math>c = d</math></xblock>');
            });
        });
    });
});
