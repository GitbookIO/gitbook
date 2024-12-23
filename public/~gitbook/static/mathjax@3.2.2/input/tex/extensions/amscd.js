!(function () {
    'use strict';
    var e,
        t,
        a,
        r,
        o = {
            667: function (e, t) {
                (t.q = void 0), (t.q = '3.2.2');
            },
            769: function (e, t, a) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.AmsCdConfiguration = void 0);
                var r = a(251);
                a(704),
                    (t.AmsCdConfiguration = r.Configuration.create('amscd', {
                        handler: {
                            character: ['amscd_special'],
                            macro: ['amscd_macros'],
                            environment: ['amscd_environment'],
                        },
                        options: {
                            amscd: {
                                colspace: '5pt',
                                rowspace: '5pt',
                                harrowsize: '2.75em',
                                varrowsize: '1.75em',
                                hideHorizontalLabels: !1,
                            },
                        },
                    }));
            },
            704: function (e, t, a) {
                var r =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (e, t, a, r) {
                                  void 0 === r && (r = a);
                                  var o = Object.getOwnPropertyDescriptor(t, a);
                                  (o &&
                                      !('get' in o
                                          ? !t.__esModule
                                          : o.writable || o.configurable)) ||
                                      (o = {
                                          enumerable: !0,
                                          get: function () {
                                              return t[a];
                                          },
                                      }),
                                      Object.defineProperty(e, r, o);
                              }
                            : function (e, t, a, r) {
                                  void 0 === r && (r = a), (e[r] = t[a]);
                              }),
                    o =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (e, t) {
                                  Object.defineProperty(e, 'default', { enumerable: !0, value: t });
                              }
                            : function (e, t) {
                                  e.default = t;
                              }),
                    n =
                        (this && this.__importStar) ||
                        function (e) {
                            if (e && e.__esModule) return e;
                            var t = {};
                            if (null != e)
                                for (var a in e)
                                    'default' !== a &&
                                        Object.prototype.hasOwnProperty.call(e, a) &&
                                        r(t, e, a);
                            return o(t, e), t;
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (e) {
                            return e && e.__esModule ? e : { default: e };
                        };
                Object.defineProperty(t, '__esModule', { value: !0 });
                var l = n(a(871)),
                    c = i(a(945)),
                    s = i(a(834));
                new l.EnvironmentMap(
                    'amscd_environment',
                    c.default.environment,
                    { CD: 'CD' },
                    s.default,
                ),
                    new l.CommandMap(
                        'amscd_macros',
                        {
                            minCDarrowwidth: 'minCDarrowwidth',
                            minCDarrowheight: 'minCDarrowheight',
                        },
                        s.default,
                    ),
                    new l.MacroMap('amscd_special', { '@': 'arrow' }, s.default);
            },
            834: function (e, t, a) {
                var r =
                    (this && this.__importDefault) ||
                    function (e) {
                        return e && e.__esModule ? e : { default: e };
                    };
                Object.defineProperty(t, '__esModule', { value: !0 });
                var o = r(a(193)),
                    n = a(379),
                    i = a(801),
                    l = r(a(748)),
                    c = {
                        CD: function (e, t) {
                            e.Push(t);
                            var a = e.itemFactory.create('array'),
                                r = e.configuration.options.amscd;
                            return (
                                a.setProperties({
                                    minw: e.stack.env.CD_minw || r.harrowsize,
                                    minh: e.stack.env.CD_minh || r.varrowsize,
                                }),
                                (a.arraydef = {
                                    columnalign: 'center',
                                    columnspacing: r.colspace,
                                    rowspacing: r.rowspace,
                                    displaystyle: !0,
                                }),
                                a
                            );
                        },
                        arrow: function (e, t) {
                            var a = e.string.charAt(e.i);
                            if (!a.match(/[><VA.|=]/)) return (0, n.Other)(e, t);
                            e.i++;
                            var r = e.stack.Top();
                            (r.isKind('array') && !r.Size()) || (c.cell(e, t), (r = e.stack.Top()));
                            for (
                                var s,
                                    u = r,
                                    d = u.table.length % 2 == 1,
                                    m = (u.row.length + (d ? 0 : 1)) % 2;
                                m;

                            )
                                c.cell(e, t), m--;
                            var p = { minsize: u.getProperty('minw'), stretchy: !0 },
                                M = {
                                    minsize: u.getProperty('minh'),
                                    stretchy: !0,
                                    symmetric: !0,
                                    lspace: 0,
                                    rspace: 0,
                                };
                            if ('.' === a);
                            else if ('|' === a) s = e.create('token', 'mo', M, '\u2225');
                            else if ('=' === a) s = e.create('token', 'mo', p, '=');
                            else {
                                var f = { '>': '\u2192', '<': '\u2190', V: '\u2193', A: '\u2191' }[
                                        a
                                    ],
                                    h = e.GetUpTo(t + a, a),
                                    _ = e.GetUpTo(t + a, a);
                                if ('>' === a || '<' === a) {
                                    if (
                                        ((s = e.create('token', 'mo', p, f)),
                                        h || (h = '\\kern ' + u.getProperty('minw')),
                                        h || _)
                                    ) {
                                        var x = { width: '+.67em', lspace: '.33em' };
                                        if (((s = e.create('node', 'munderover', [s])), h)) {
                                            var b = new o.default(
                                                    h,
                                                    e.stack.env,
                                                    e.configuration,
                                                ).mml(),
                                                v = e.create('node', 'mpadded', [b], x);
                                            l.default.setAttribute(v, 'voffset', '.1em'),
                                                l.default.setChild(s, s.over, v);
                                        }
                                        if (_) {
                                            var g = new o.default(
                                                _,
                                                e.stack.env,
                                                e.configuration,
                                            ).mml();
                                            l.default.setChild(
                                                s,
                                                s.under,
                                                e.create('node', 'mpadded', [g], x),
                                            );
                                        }
                                        e.configuration.options.amscd.hideHorizontalLabels &&
                                            (s = e.create('node', 'mpadded', s, {
                                                depth: 0,
                                                height: '.67em',
                                            }));
                                    }
                                } else {
                                    var C = e.create('token', 'mo', M, f);
                                    (s = C),
                                        (h || _) &&
                                            ((s = e.create('node', 'mrow')),
                                            h &&
                                                l.default.appendChildren(s, [
                                                    new o.default(
                                                        '\\scriptstyle\\llap{' + h + '}',
                                                        e.stack.env,
                                                        e.configuration,
                                                    ).mml(),
                                                ]),
                                            (C.texClass = i.TEXCLASS.ORD),
                                            l.default.appendChildren(s, [C]),
                                            _ &&
                                                l.default.appendChildren(s, [
                                                    new o.default(
                                                        '\\scriptstyle\\rlap{' + _ + '}',
                                                        e.stack.env,
                                                        e.configuration,
                                                    ).mml(),
                                                ]));
                                }
                            }
                            s && e.Push(s), c.cell(e, t);
                        },
                        cell: function (e, t) {
                            var a = e.stack.Top();
                            (a.table || []).length % 2 == 0 &&
                                0 === (a.row || []).length &&
                                e.Push(
                                    e.create('node', 'mpadded', [], {
                                        height: '8.5pt',
                                        depth: '2pt',
                                    }),
                                ),
                                e.Push(
                                    e.itemFactory
                                        .create('cell')
                                        .setProperties({ isEntry: !0, name: t }),
                                );
                        },
                        minCDarrowwidth: function (e, t) {
                            e.stack.env.CD_minw = e.GetDimen(t);
                        },
                        minCDarrowheight: function (e, t) {
                            e.stack.env.CD_minh = e.GetDimen(t);
                        },
                    };
                t.default = c;
            },
            955: function (e, t) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (t.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            801: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.TEXCLASS = MathJax._.core.MmlTree.MmlNode.TEXCLASS),
                    (t.TEXCLASSNAMES = MathJax._.core.MmlTree.MmlNode.TEXCLASSNAMES),
                    (t.indentAttributes = MathJax._.core.MmlTree.MmlNode.indentAttributes),
                    (t.AbstractMmlNode = MathJax._.core.MmlTree.MmlNode.AbstractMmlNode),
                    (t.AbstractMmlTokenNode = MathJax._.core.MmlTree.MmlNode.AbstractMmlTokenNode),
                    (t.AbstractMmlLayoutNode =
                        MathJax._.core.MmlTree.MmlNode.AbstractMmlLayoutNode),
                    (t.AbstractMmlBaseNode = MathJax._.core.MmlTree.MmlNode.AbstractMmlBaseNode),
                    (t.AbstractMmlEmptyNode = MathJax._.core.MmlTree.MmlNode.AbstractMmlEmptyNode),
                    (t.TextNode = MathJax._.core.MmlTree.MmlNode.TextNode),
                    (t.XMLNode = MathJax._.core.MmlTree.MmlNode.XMLNode);
            },
            251: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.Configuration = MathJax._.input.tex.Configuration.Configuration),
                    (t.ConfigurationHandler =
                        MathJax._.input.tex.Configuration.ConfigurationHandler),
                    (t.ParserConfiguration = MathJax._.input.tex.Configuration.ParserConfiguration);
            },
            748: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.default = MathJax._.input.tex.NodeUtil.default);
            },
            945: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.default = MathJax._.input.tex.ParseMethods.default);
            },
            871: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.parseResult = MathJax._.input.tex.SymbolMap.parseResult),
                    (t.AbstractSymbolMap = MathJax._.input.tex.SymbolMap.AbstractSymbolMap),
                    (t.RegExpMap = MathJax._.input.tex.SymbolMap.RegExpMap),
                    (t.AbstractParseMap = MathJax._.input.tex.SymbolMap.AbstractParseMap),
                    (t.CharacterMap = MathJax._.input.tex.SymbolMap.CharacterMap),
                    (t.DelimiterMap = MathJax._.input.tex.SymbolMap.DelimiterMap),
                    (t.MacroMap = MathJax._.input.tex.SymbolMap.MacroMap),
                    (t.CommandMap = MathJax._.input.tex.SymbolMap.CommandMap),
                    (t.EnvironmentMap = MathJax._.input.tex.SymbolMap.EnvironmentMap);
            },
            193: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.default = MathJax._.input.tex.TexParser.default);
            },
            379: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.Other = MathJax._.input.tex.base.BaseConfiguration.Other),
                    (t.BaseTags = MathJax._.input.tex.base.BaseConfiguration.BaseTags),
                    (t.BaseConfiguration =
                        MathJax._.input.tex.base.BaseConfiguration.BaseConfiguration);
            },
        },
        n = {};
    function i(e) {
        var t = n[e];
        if (void 0 !== t) return t.exports;
        var a = (n[e] = { exports: {} });
        return o[e].call(a.exports, a, a.exports, i), a.exports;
    }
    (e = i(955)),
        (t = i(667)),
        (a = i(769)),
        (r = i(834)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/amscd', t.q, 'tex-extension'),
        (0, e.r8)({ _: { input: { tex: { amscd: { AmsCdConfiguration: a, AmsCdMethods: r } } } } });
})();
