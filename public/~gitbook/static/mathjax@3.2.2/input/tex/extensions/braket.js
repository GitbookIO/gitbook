!(function () {
    'use strict';
    var t,
        e,
        a,
        r,
        o,
        n = {
            667: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            243: function (t, e, a) {
                var r;
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.BraketConfiguration = void 0);
                var o = a(251),
                    n = a(519);
                a(299),
                    (e.BraketConfiguration = o.Configuration.create('braket', {
                        handler: { character: ['Braket-characters'], macro: ['Braket-macros'] },
                        items: ((r = {}), (r[n.BraketItem.prototype.kind] = n.BraketItem), r),
                    }));
            },
            519: function (t, e, a) {
                var r,
                    o =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var a in e)
                                            Object.prototype.hasOwnProperty.call(e, a) &&
                                                (t[a] = e[a]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function a() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((a.prototype = e.prototype), new a()));
                        }),
                    n =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.BraketItem = void 0);
                var i = a(76),
                    l = a(801),
                    c = n(a(398)),
                    s = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'braket';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'isOpen', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.checkItem = function (e) {
                                return e.isKind('close')
                                    ? [[this.factory.create('mml', this.toMml())], !0]
                                    : e.isKind('mml')
                                      ? (this.Push(e.toMml()),
                                        this.getProperty('single')
                                            ? [[this.toMml()], !0]
                                            : i.BaseItem.fail)
                                      : t.prototype.checkItem.call(this, e);
                            }),
                            (e.prototype.toMml = function () {
                                var e = t.prototype.toMml.call(this),
                                    a = this.getProperty('open'),
                                    r = this.getProperty('close');
                                if (this.getProperty('stretchy'))
                                    return c.default.fenced(this.factory.configuration, a, e, r);
                                var o = {
                                        fence: !0,
                                        stretchy: !1,
                                        symmetric: !0,
                                        texClass: l.TEXCLASS.OPEN,
                                    },
                                    n = this.create('token', 'mo', o, a);
                                o.texClass = l.TEXCLASS.CLOSE;
                                var i = this.create('token', 'mo', o, r);
                                return this.create('node', 'mrow', [n, e, i], {
                                    open: a,
                                    close: r,
                                    texClass: l.TEXCLASS.INNER,
                                });
                            }),
                            e
                        );
                    })(i.BaseItem);
                e.BraketItem = s;
            },
            299: function (t, e, a) {
                var r =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var o = a(871),
                    n = r(a(277));
                new o.CommandMap(
                    'Braket-macros',
                    {
                        bra: ['Macro', '{\\langle {#1} \\vert}', 1],
                        ket: ['Macro', '{\\vert {#1} \\rangle}', 1],
                        braket: ['Braket', '\u27e8', '\u27e9', !1, 1 / 0],
                        set: ['Braket', '{', '}', !1, 1],
                        Bra: ['Macro', '{\\left\\langle {#1} \\right\\vert}', 1],
                        Ket: ['Macro', '{\\left\\vert {#1} \\right\\rangle}', 1],
                        Braket: ['Braket', '\u27e8', '\u27e9', !0, 1 / 0],
                        Set: ['Braket', '{', '}', !0, 1],
                        ketbra: ['Macro', '{\\vert {#1} \\rangle\\langle {#2} \\vert}', 2],
                        Ketbra: [
                            'Macro',
                            '{\\left\\vert {#1} \\right\\rangle\\left\\langle {#2} \\right\\vert}',
                            2,
                        ],
                        '|': 'Bar',
                    },
                    n.default,
                ),
                    new o.MacroMap('Braket-characters', { '|': 'Bar' }, n.default);
            },
            277: function (t, e, a) {
                var r =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var o = r(a(360)),
                    n = a(801),
                    i = r(a(402)),
                    l = {};
                (l.Macro = o.default.Macro),
                    (l.Braket = function (t, e, a, r, o, n) {
                        var l = t.GetNext();
                        if ('' === l)
                            throw new i.default(
                                'MissingArgFor',
                                'Missing argument for %1',
                                t.currentCS,
                            );
                        var c = !0;
                        '{' === l && (t.i++, (c = !1)),
                            t.Push(
                                t.itemFactory.create('braket').setProperties({
                                    barmax: n,
                                    barcount: 0,
                                    open: a,
                                    close: r,
                                    stretchy: o,
                                    single: c,
                                }),
                            );
                    }),
                    (l.Bar = function (t, e) {
                        var a = '|' === e ? '|' : '\u2225',
                            r = t.stack.Top();
                        if (
                            'braket' !== r.kind ||
                            r.getProperty('barcount') >= r.getProperty('barmax')
                        ) {
                            var o = t.create(
                                'token',
                                'mo',
                                { texClass: n.TEXCLASS.ORD, stretchy: !1 },
                                a,
                            );
                            t.Push(o);
                        } else {
                            if (
                                ('|' === a && '|' === t.GetNext() && (t.i++, (a = '\u2225')),
                                r.getProperty('stretchy'))
                            ) {
                                var i = t.create('node', 'TeXAtom', [], {
                                    texClass: n.TEXCLASS.CLOSE,
                                });
                                t.Push(i),
                                    r.setProperty('barcount', r.getProperty('barcount') + 1),
                                    (i = t.create(
                                        'token',
                                        'mo',
                                        { stretchy: !0, braketbar: !0 },
                                        a,
                                    )),
                                    t.Push(i),
                                    (i = t.create('node', 'TeXAtom', [], {
                                        texClass: n.TEXCLASS.OPEN,
                                    })),
                                    t.Push(i);
                            } else {
                                var l = t.create('token', 'mo', { stretchy: !1, braketbar: !0 }, a);
                                t.Push(l);
                            }
                        }
                    }),
                    (e.default = l);
            },
            955: function (t, e) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (e.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            801: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TEXCLASS = MathJax._.core.MmlTree.MmlNode.TEXCLASS),
                    (e.TEXCLASSNAMES = MathJax._.core.MmlTree.MmlNode.TEXCLASSNAMES),
                    (e.indentAttributes = MathJax._.core.MmlTree.MmlNode.indentAttributes),
                    (e.AbstractMmlNode = MathJax._.core.MmlTree.MmlNode.AbstractMmlNode),
                    (e.AbstractMmlTokenNode = MathJax._.core.MmlTree.MmlNode.AbstractMmlTokenNode),
                    (e.AbstractMmlLayoutNode =
                        MathJax._.core.MmlTree.MmlNode.AbstractMmlLayoutNode),
                    (e.AbstractMmlBaseNode = MathJax._.core.MmlTree.MmlNode.AbstractMmlBaseNode),
                    (e.AbstractMmlEmptyNode = MathJax._.core.MmlTree.MmlNode.AbstractMmlEmptyNode),
                    (e.TextNode = MathJax._.core.MmlTree.MmlNode.TextNode),
                    (e.XMLNode = MathJax._.core.MmlTree.MmlNode.XMLNode);
            },
            251: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Configuration = MathJax._.input.tex.Configuration.Configuration),
                    (e.ConfigurationHandler =
                        MathJax._.input.tex.Configuration.ConfigurationHandler),
                    (e.ParserConfiguration = MathJax._.input.tex.Configuration.ParserConfiguration);
            },
            398: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.ParseUtil.default);
            },
            76: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlStack = MathJax._.input.tex.StackItem.MmlStack),
                    (e.BaseItem = MathJax._.input.tex.StackItem.BaseItem);
            },
            871: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.parseResult = MathJax._.input.tex.SymbolMap.parseResult),
                    (e.AbstractSymbolMap = MathJax._.input.tex.SymbolMap.AbstractSymbolMap),
                    (e.RegExpMap = MathJax._.input.tex.SymbolMap.RegExpMap),
                    (e.AbstractParseMap = MathJax._.input.tex.SymbolMap.AbstractParseMap),
                    (e.CharacterMap = MathJax._.input.tex.SymbolMap.CharacterMap),
                    (e.DelimiterMap = MathJax._.input.tex.SymbolMap.DelimiterMap),
                    (e.MacroMap = MathJax._.input.tex.SymbolMap.MacroMap),
                    (e.CommandMap = MathJax._.input.tex.SymbolMap.CommandMap),
                    (e.EnvironmentMap = MathJax._.input.tex.SymbolMap.EnvironmentMap);
            },
            402: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.TexError.default);
            },
            360: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.base.BaseMethods.default);
            },
        },
        i = {};
    function l(t) {
        var e = i[t];
        if (void 0 !== e) return e.exports;
        var a = (i[t] = { exports: {} });
        return n[t].call(a.exports, a, a.exports, l), a.exports;
    }
    (t = l(955)),
        (e = l(667)),
        (a = l(243)),
        (r = l(519)),
        (o = l(277)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/braket', e.q, 'tex-extension'),
        (0, t.r8)({
            _: {
                input: {
                    tex: { braket: { BraketConfiguration: a, BraketItems: r, BraketMethods: o } },
                },
            },
        });
})();
