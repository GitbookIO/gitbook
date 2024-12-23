!(function () {
    'use strict';
    var e,
        t,
        a,
        n,
        r = {
            667: function (e, t) {
                (t.q = void 0), (t.q = '3.2.2');
            },
            79: function (e, t, a) {
                var n,
                    r,
                    i =
                        (this && this.__extends) ||
                        ((n = function (e, t) {
                            return (
                                (n =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (e, t) {
                                            e.__proto__ = t;
                                        }) ||
                                    function (e, t) {
                                        for (var a in t)
                                            Object.prototype.hasOwnProperty.call(t, a) &&
                                                (e[a] = t[a]);
                                    }),
                                n(e, t)
                            );
                        }),
                        function (e, t) {
                            if ('function' != typeof t && null !== t)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(t) +
                                        ' is not a constructor or null',
                                );
                            function a() {
                                this.constructor = e;
                            }
                            n(e, t),
                                (e.prototype =
                                    null === t
                                        ? Object.create(t)
                                        : ((a.prototype = t.prototype), new a()));
                        }),
                    o =
                        (this && this.__read) ||
                        function (e, t) {
                            var a = 'function' == typeof Symbol && e[Symbol.iterator];
                            if (!a) return e;
                            var n,
                                r,
                                i = a.call(e),
                                o = [];
                            try {
                                for (; (void 0 === t || t-- > 0) && !(n = i.next()).done; )
                                    o.push(n.value);
                            } catch (e) {
                                r = { error: e };
                            } finally {
                                try {
                                    n && !n.done && (a = i.return) && a.call(i);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                            return o;
                        },
                    l =
                        (this && this.__importDefault) ||
                        function (e) {
                            return e && e.__esModule ? e : { default: e };
                        };
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.EmpheqConfiguration = t.EmpheqMethods = t.EmpheqBeginItem = void 0);
                var p = a(251),
                    m = a(871),
                    h = l(a(398)),
                    s = l(a(402)),
                    u = a(935),
                    c = a(301),
                    d = (function (e) {
                        function t() {
                            return (null !== e && e.apply(this, arguments)) || this;
                        }
                        return (
                            i(t, e),
                            Object.defineProperty(t.prototype, 'kind', {
                                get: function () {
                                    return 'empheq-begin';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (t.prototype.checkItem = function (t) {
                                return (
                                    t.isKind('end') &&
                                        t.getName() === this.getName() &&
                                        this.setProperty('end', !1),
                                    e.prototype.checkItem.call(this, t)
                                );
                            }),
                            t
                        );
                    })(u.BeginItem);
                (t.EmpheqBeginItem = d),
                    (t.EmpheqMethods = {
                        Empheq: function (e, t) {
                            if (e.stack.env.closing === t.getName()) {
                                delete e.stack.env.closing,
                                    e.Push(
                                        e.itemFactory
                                            .create('end')
                                            .setProperty('name', e.stack.global.empheq),
                                    ),
                                    (e.stack.global.empheq = '');
                                var a = e.stack.Top();
                                c.EmpheqUtil.adjustTable(a, e),
                                    e.Push(
                                        e.itemFactory.create('end').setProperty('name', 'empheq'),
                                    );
                            } else {
                                h.default.checkEqnEnv(e), delete e.stack.global.eqnenv;
                                var n = e.GetBrackets('\\begin{' + t.getName() + '}') || '',
                                    r = o(
                                        (e.GetArgument('\\begin{' + t.getName() + '}') || '').split(
                                            /=/,
                                        ),
                                        2,
                                    ),
                                    i = r[0],
                                    l = r[1];
                                if (!c.EmpheqUtil.checkEnv(i))
                                    throw new s.default(
                                        'UnknownEnv',
                                        'Unknown environment "%1"',
                                        i,
                                    );
                                n &&
                                    t.setProperties(
                                        c.EmpheqUtil.splitOptions(n, { left: 1, right: 1 }),
                                    ),
                                    (e.stack.global.empheq = i),
                                    (e.string =
                                        '\\begin{' +
                                        i +
                                        '}' +
                                        (l ? '{' + l + '}' : '') +
                                        e.string.slice(e.i)),
                                    (e.i = 0),
                                    e.Push(t);
                            }
                        },
                        EmpheqMO: function (e, t, a) {
                            e.Push(e.create('token', 'mo', {}, a));
                        },
                        EmpheqDelim: function (e, t) {
                            var a = e.GetDelimiter(t);
                            e.Push(e.create('token', 'mo', { stretchy: !0, symmetric: !0 }, a));
                        },
                    }),
                    new m.EnvironmentMap(
                        'empheq-env',
                        c.EmpheqUtil.environment,
                        { empheq: ['Empheq', 'empheq'] },
                        t.EmpheqMethods,
                    ),
                    new m.CommandMap(
                        'empheq-macros',
                        {
                            empheqlbrace: ['EmpheqMO', '{'],
                            empheqrbrace: ['EmpheqMO', '}'],
                            empheqlbrack: ['EmpheqMO', '['],
                            empheqrbrack: ['EmpheqMO', ']'],
                            empheqlangle: ['EmpheqMO', '\u27e8'],
                            empheqrangle: ['EmpheqMO', '\u27e9'],
                            empheqlparen: ['EmpheqMO', '('],
                            empheqrparen: ['EmpheqMO', ')'],
                            empheqlvert: ['EmpheqMO', '|'],
                            empheqrvert: ['EmpheqMO', '|'],
                            empheqlVert: ['EmpheqMO', '\u2016'],
                            empheqrVert: ['EmpheqMO', '\u2016'],
                            empheqlfloor: ['EmpheqMO', '\u230a'],
                            empheqrfloor: ['EmpheqMO', '\u230b'],
                            empheqlceil: ['EmpheqMO', '\u2308'],
                            empheqrceil: ['EmpheqMO', '\u2309'],
                            empheqbiglbrace: ['EmpheqMO', '{'],
                            empheqbigrbrace: ['EmpheqMO', '}'],
                            empheqbiglbrack: ['EmpheqMO', '['],
                            empheqbigrbrack: ['EmpheqMO', ']'],
                            empheqbiglangle: ['EmpheqMO', '\u27e8'],
                            empheqbigrangle: ['EmpheqMO', '\u27e9'],
                            empheqbiglparen: ['EmpheqMO', '('],
                            empheqbigrparen: ['EmpheqMO', ')'],
                            empheqbiglvert: ['EmpheqMO', '|'],
                            empheqbigrvert: ['EmpheqMO', '|'],
                            empheqbiglVert: ['EmpheqMO', '\u2016'],
                            empheqbigrVert: ['EmpheqMO', '\u2016'],
                            empheqbiglfloor: ['EmpheqMO', '\u230a'],
                            empheqbigrfloor: ['EmpheqMO', '\u230b'],
                            empheqbiglceil: ['EmpheqMO', '\u2308'],
                            empheqbigrceil: ['EmpheqMO', '\u2309'],
                            empheql: 'EmpheqDelim',
                            empheqr: 'EmpheqDelim',
                            empheqbigl: 'EmpheqDelim',
                            empheqbigr: 'EmpheqDelim',
                        },
                        t.EmpheqMethods,
                    ),
                    (t.EmpheqConfiguration = p.Configuration.create('empheq', {
                        handler: { macro: ['empheq-macros'], environment: ['empheq-env'] },
                        items: ((r = {}), (r[d.prototype.kind] = d), r),
                    }));
            },
            301: function (e, t, a) {
                var n =
                        (this && this.__read) ||
                        function (e, t) {
                            var a = 'function' == typeof Symbol && e[Symbol.iterator];
                            if (!a) return e;
                            var n,
                                r,
                                i = a.call(e),
                                o = [];
                            try {
                                for (; (void 0 === t || t-- > 0) && !(n = i.next()).done; )
                                    o.push(n.value);
                            } catch (e) {
                                r = { error: e };
                            } finally {
                                try {
                                    n && !n.done && (a = i.return) && a.call(i);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                            return o;
                        },
                    r =
                        (this && this.__spreadArray) ||
                        function (e, t, a) {
                            if (a || 2 === arguments.length)
                                for (var n, r = 0, i = t.length; r < i; r++)
                                    (!n && r in t) ||
                                        (n || (n = Array.prototype.slice.call(t, 0, r)),
                                        (n[r] = t[r]));
                            return e.concat(n || Array.prototype.slice.call(t));
                        },
                    i =
                        (this && this.__values) ||
                        function (e) {
                            var t = 'function' == typeof Symbol && Symbol.iterator,
                                a = t && e[t],
                                n = 0;
                            if (a) return a.call(e);
                            if (e && 'number' == typeof e.length)
                                return {
                                    next: function () {
                                        return (
                                            e && n >= e.length && (e = void 0),
                                            { value: e && e[n++], done: !e }
                                        );
                                    },
                                };
                            throw new TypeError(
                                t ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    o =
                        (this && this.__importDefault) ||
                        function (e) {
                            return e && e.__esModule ? e : { default: e };
                        };
                Object.defineProperty(t, '__esModule', { value: !0 }), (t.EmpheqUtil = void 0);
                var l = o(a(398)),
                    p = o(a(193));
                t.EmpheqUtil = {
                    environment: function (e, t, a, i) {
                        var o = i[0],
                            l = e.itemFactory
                                .create(o + '-begin')
                                .setProperties({ name: t, end: o });
                        e.Push(a.apply(void 0, r([e, l], n(i.slice(1)), !1)));
                    },
                    splitOptions: function (e, t) {
                        return void 0 === t && (t = null), l.default.keyvalOptions(e, t, !0);
                    },
                    columnCount: function (e) {
                        var t,
                            a,
                            n = 0;
                        try {
                            for (var r = i(e.childNodes), o = r.next(); !o.done; o = r.next()) {
                                var l = o.value,
                                    p = l.childNodes.length - (l.isKind('mlabeledtr') ? 1 : 0);
                                p > n && (n = p);
                            }
                        } catch (e) {
                            t = { error: e };
                        } finally {
                            try {
                                o && !o.done && (a = r.return) && a.call(r);
                            } finally {
                                if (t) throw t.error;
                            }
                        }
                        return n;
                    },
                    cellBlock: function (e, t, a, n) {
                        var r,
                            o,
                            l = a.create('node', 'mpadded', [], {
                                height: 0,
                                depth: 0,
                                voffset: '-1height',
                            }),
                            m = new p.default(e, a.stack.env, a.configuration),
                            h = m.mml();
                        n &&
                            m.configuration.tags.label &&
                            ((m.configuration.tags.currentTag.env = n),
                            m.configuration.tags.getTag(!0));
                        try {
                            for (
                                var s = i(h.isInferred ? h.childNodes : [h]), u = s.next();
                                !u.done;
                                u = s.next()
                            ) {
                                var c = u.value;
                                l.appendChild(c);
                            }
                        } catch (e) {
                            r = { error: e };
                        } finally {
                            try {
                                u && !u.done && (o = s.return) && o.call(s);
                            } finally {
                                if (r) throw r.error;
                            }
                        }
                        return (
                            l.appendChild(
                                a.create('node', 'mphantom', [
                                    a.create('node', 'mpadded', [t], { width: 0 }),
                                ]),
                            ),
                            l
                        );
                    },
                    topRowTable: function (e, t) {
                        var a = l.default.copyNode(e, t);
                        return (
                            a.setChildren(a.childNodes.slice(0, 1)),
                            a.attributes.set('align', 'baseline 1'),
                            e.factory.create('mphantom', {}, [
                                t.create('node', 'mpadded', [a], { width: 0 }),
                            ])
                        );
                    },
                    rowspanCell: function (e, t, a, n, r) {
                        e.appendChild(
                            n.create(
                                'node',
                                'mpadded',
                                [
                                    this.cellBlock(t, l.default.copyNode(a, n), n, r),
                                    this.topRowTable(a, n),
                                ],
                                { height: 0, depth: 0, voffset: 'height' },
                            ),
                        );
                    },
                    left: function (e, t, a, n, r) {
                        var o, l, p;
                        void 0 === r && (r = ''),
                            e.attributes.set(
                                'columnalign',
                                'right ' + (e.attributes.get('columnalign') || ''),
                            ),
                            e.attributes.set(
                                'columnspacing',
                                '0em ' + (e.attributes.get('columnspacing') || ''),
                            );
                        try {
                            for (
                                var m = i(e.childNodes.slice(0).reverse()), h = m.next();
                                !h.done;
                                h = m.next()
                            ) {
                                var s = h.value;
                                (p = n.create('node', 'mtd')),
                                    s.childNodes.unshift(p),
                                    (p.parent = s),
                                    s.isKind('mlabeledtr') &&
                                        ((s.childNodes[0] = s.childNodes[1]),
                                        (s.childNodes[1] = p));
                            }
                        } catch (e) {
                            o = { error: e };
                        } finally {
                            try {
                                h && !h.done && (l = m.return) && l.call(m);
                            } finally {
                                if (o) throw o.error;
                            }
                        }
                        this.rowspanCell(p, a, t, n, r);
                    },
                    right: function (e, a, n, r, i) {
                        void 0 === i && (i = ''),
                            0 === e.childNodes.length && e.appendChild(r.create('node', 'mtr'));
                        for (
                            var o = t.EmpheqUtil.columnCount(e), l = e.childNodes[0];
                            l.childNodes.length < o;

                        )
                            l.appendChild(r.create('node', 'mtd'));
                        var p = l.appendChild(r.create('node', 'mtd'));
                        t.EmpheqUtil.rowspanCell(p, n, a, r, i),
                            e.attributes.set(
                                'columnalign',
                                (e.attributes.get('columnalign') || '')
                                    .split(/ /)
                                    .slice(0, o)
                                    .join(' ') + ' left',
                            ),
                            e.attributes.set(
                                'columnspacing',
                                (e.attributes.get('columnspacing') || '')
                                    .split(/ /)
                                    .slice(0, o - 1)
                                    .join(' ') + ' 0em',
                            );
                    },
                    adjustTable: function (e, t) {
                        var a = e.getProperty('left'),
                            n = e.getProperty('right');
                        if (a || n) {
                            var r = e.Last,
                                i = l.default.copyNode(r, t);
                            a && this.left(r, i, a, t), n && this.right(r, i, n, t);
                        }
                    },
                    allowEnv: {
                        equation: !0,
                        align: !0,
                        gather: !0,
                        flalign: !0,
                        alignat: !0,
                        multline: !0,
                    },
                    checkEnv: function (e) {
                        return this.allowEnv.hasOwnProperty(e.replace(/\*$/, '')) || !1;
                    },
                };
            },
            955: function (e, t) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (t.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            251: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.Configuration = MathJax._.input.tex.Configuration.Configuration),
                    (t.ConfigurationHandler =
                        MathJax._.input.tex.Configuration.ConfigurationHandler),
                    (t.ParserConfiguration = MathJax._.input.tex.Configuration.ParserConfiguration);
            },
            398: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.default = MathJax._.input.tex.ParseUtil.default);
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
            402: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.default = MathJax._.input.tex.TexError.default);
            },
            193: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.default = MathJax._.input.tex.TexParser.default);
            },
            935: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.StartItem = MathJax._.input.tex.base.BaseItems.StartItem),
                    (t.StopItem = MathJax._.input.tex.base.BaseItems.StopItem),
                    (t.OpenItem = MathJax._.input.tex.base.BaseItems.OpenItem),
                    (t.CloseItem = MathJax._.input.tex.base.BaseItems.CloseItem),
                    (t.PrimeItem = MathJax._.input.tex.base.BaseItems.PrimeItem),
                    (t.SubsupItem = MathJax._.input.tex.base.BaseItems.SubsupItem),
                    (t.OverItem = MathJax._.input.tex.base.BaseItems.OverItem),
                    (t.LeftItem = MathJax._.input.tex.base.BaseItems.LeftItem),
                    (t.Middle = MathJax._.input.tex.base.BaseItems.Middle),
                    (t.RightItem = MathJax._.input.tex.base.BaseItems.RightItem),
                    (t.BeginItem = MathJax._.input.tex.base.BaseItems.BeginItem),
                    (t.EndItem = MathJax._.input.tex.base.BaseItems.EndItem),
                    (t.StyleItem = MathJax._.input.tex.base.BaseItems.StyleItem),
                    (t.PositionItem = MathJax._.input.tex.base.BaseItems.PositionItem),
                    (t.CellItem = MathJax._.input.tex.base.BaseItems.CellItem),
                    (t.MmlItem = MathJax._.input.tex.base.BaseItems.MmlItem),
                    (t.FnItem = MathJax._.input.tex.base.BaseItems.FnItem),
                    (t.NotItem = MathJax._.input.tex.base.BaseItems.NotItem),
                    (t.NonscriptItem = MathJax._.input.tex.base.BaseItems.NonscriptItem),
                    (t.DotsItem = MathJax._.input.tex.base.BaseItems.DotsItem),
                    (t.ArrayItem = MathJax._.input.tex.base.BaseItems.ArrayItem),
                    (t.EqnArrayItem = MathJax._.input.tex.base.BaseItems.EqnArrayItem),
                    (t.EquationItem = MathJax._.input.tex.base.BaseItems.EquationItem);
            },
        },
        i = {};
    function o(e) {
        var t = i[e];
        if (void 0 !== t) return t.exports;
        var a = (i[e] = { exports: {} });
        return r[e].call(a.exports, a, a.exports, o), a.exports;
    }
    (e = o(955)),
        (t = o(667)),
        (a = o(79)),
        (n = o(301)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/empheq', t.q, 'tex-extension'),
        (0, e.r8)({ _: { input: { tex: { empheq: { EmpheqConfiguration: a, EmpheqUtil: n } } } } });
})();
