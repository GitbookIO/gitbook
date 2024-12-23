!(function () {
    'use strict';
    var t,
        e,
        a,
        r,
        o,
        n,
        l,
        i = {
            667: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            205: function (t, e, a) {
                var r,
                    o =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                a = e && t[e],
                                r = 0;
                            if (a) return a.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && r >= t.length && (t = void 0),
                                            { value: t && t[r++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    n =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MathtoolsConfiguration = e.fixPrescripts = e.PAIREDDELIMS = void 0);
                var l = a(251),
                    i = a(871),
                    s = n(a(748)),
                    u = a(74);
                a(926);
                var c = a(262),
                    d = a(298),
                    m = a(144);
                function h(t) {
                    var e,
                        a,
                        r,
                        n,
                        l,
                        i,
                        u = t.data;
                    try {
                        for (
                            var c = o(u.getList('mmultiscripts')), d = c.next();
                            !d.done;
                            d = c.next()
                        ) {
                            var m = d.value;
                            if (m.getProperty('fixPrescript')) {
                                var h = s.default.getChildren(m),
                                    p = 0;
                                try {
                                    for (
                                        var f = ((r = void 0), o([1, 2])), M = f.next();
                                        !M.done;
                                        M = f.next()
                                    ) {
                                        h[(v = M.value)] ||
                                            (s.default.setChild(
                                                m,
                                                v,
                                                u.nodeFactory.create('node', 'none'),
                                            ),
                                            p++);
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        M && !M.done && (n = f.return) && n.call(f);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                                try {
                                    for (
                                        var x = ((l = void 0), o([4, 5])), g = x.next();
                                        !g.done;
                                        g = x.next()
                                    ) {
                                        var v = g.value;
                                        s.default.isType(h[v], 'mrow') &&
                                            0 === s.default.getChildren(h[v]).length &&
                                            s.default.setChild(
                                                m,
                                                v,
                                                u.nodeFactory.create('node', 'none'),
                                            );
                                    }
                                } catch (t) {
                                    l = { error: t };
                                } finally {
                                    try {
                                        g && !g.done && (i = x.return) && i.call(x);
                                    } finally {
                                        if (l) throw l.error;
                                    }
                                }
                                2 === p && h.splice(1, 2);
                            }
                        }
                    } catch (t) {
                        e = { error: t };
                    } finally {
                        try {
                            d && !d.done && (a = c.return) && a.call(c);
                        } finally {
                            if (e) throw e.error;
                        }
                    }
                }
                (e.PAIREDDELIMS = 'mathtools-paired-delims'),
                    (e.fixPrescripts = h),
                    (e.MathtoolsConfiguration = l.Configuration.create('mathtools', {
                        handler: {
                            macro: ['mathtools-macros', 'mathtools-delimiters'],
                            environment: ['mathtools-environments'],
                            delimiter: ['mathtools-delimiters'],
                            character: ['mathtools-characters'],
                        },
                        items: ((r = {}), (r[m.MultlinedItem.prototype.kind] = m.MultlinedItem), r),
                        init: function (t) {
                            new i.CommandMap(e.PAIREDDELIMS, {}, {}),
                                t.append(
                                    l.Configuration.local({
                                        handler: { macro: [e.PAIREDDELIMS] },
                                        priority: -5,
                                    }),
                                );
                        },
                        config: function (t, e) {
                            var a,
                                r,
                                n = e.parseOptions,
                                l = n.options.mathtools.pairedDelimiters;
                            try {
                                for (
                                    var i = o(Object.keys(l)), s = i.next();
                                    !s.done;
                                    s = i.next()
                                ) {
                                    var u = s.value;
                                    c.MathtoolsUtil.addPairedDelims(n, u, l[u]);
                                }
                            } catch (t) {
                                a = { error: t };
                            } finally {
                                try {
                                    s && !s.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (a) throw a.error;
                                }
                            }
                            (0, d.MathtoolsTagFormat)(t, e);
                        },
                        postprocessors: [[h, -6]],
                        options: {
                            mathtools: {
                                multlinegap: '1em',
                                'multlined-pos': 'c',
                                'firstline-afterskip': '',
                                'lastline-preskip': '',
                                'smallmatrix-align': 'c',
                                shortvdotsadjustabove: '.2em',
                                shortvdotsadjustbelow: '.2em',
                                centercolon: !1,
                                'centercolon-offset': '.04em',
                                'thincolon-dx': '-.04em',
                                'thincolon-dw': '-.08em',
                                'use-unicode': !1,
                                'prescript-sub-format': '',
                                'prescript-sup-format': '',
                                'prescript-arg-format': '',
                                'allow-mathtoolsset': !0,
                                pairedDelimiters: (0, u.expandable)({}),
                                tagforms: (0, u.expandable)({}),
                            },
                        },
                    }));
            },
            144: function (t, e, a) {
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
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MultlinedItem = void 0);
                var l = a(927),
                    i = n(a(748)),
                    s = a(108),
                    u = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'multlined';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.EndTable = function () {
                                if (
                                    ((this.Size() || this.row.length) &&
                                        (this.EndEntry(), this.EndRow()),
                                    this.table.length > 1)
                                ) {
                                    var e = this.factory.configuration.options.mathtools,
                                        a = e.multlinegap,
                                        r = e['firstline-afterskip'] || a,
                                        o = e['lastline-preskip'] || a,
                                        n = i.default.getChildren(this.table[0])[0];
                                    i.default.getAttribute(n, 'columnalign') !==
                                        s.TexConstant.Align.RIGHT &&
                                        n.appendChild(
                                            this.create('node', 'mspace', [], { width: r }),
                                        );
                                    var l = i.default.getChildren(
                                        this.table[this.table.length - 1],
                                    )[0];
                                    if (
                                        i.default.getAttribute(l, 'columnalign') !==
                                        s.TexConstant.Align.LEFT
                                    ) {
                                        var u = i.default.getChildren(l)[0];
                                        u.childNodes.unshift(null);
                                        var c = this.create('node', 'mspace', [], { width: o });
                                        i.default.setChild(u, 0, c);
                                    }
                                }
                                t.prototype.EndTable.call(this);
                            }),
                            e
                        );
                    })(l.MultlineItem);
                e.MultlinedItem = u;
            },
            926: function (t, e, a) {
                var r =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var o = r(a(945)),
                    n = a(871),
                    l = a(108),
                    i = a(178);
                new n.CommandMap(
                    'mathtools-macros',
                    {
                        shoveleft: ['HandleShove', l.TexConstant.Align.LEFT],
                        shoveright: ['HandleShove', l.TexConstant.Align.RIGHT],
                        xleftrightarrow: ['xArrow', 8596, 10, 10],
                        xLeftarrow: ['xArrow', 8656, 12, 7],
                        xRightarrow: ['xArrow', 8658, 7, 12],
                        xLeftrightarrow: ['xArrow', 8660, 12, 12],
                        xhookleftarrow: ['xArrow', 8617, 10, 5],
                        xhookrightarrow: ['xArrow', 8618, 5, 10],
                        xmapsto: ['xArrow', 8614, 10, 10],
                        xrightharpoondown: ['xArrow', 8641, 5, 10],
                        xleftharpoondown: ['xArrow', 8637, 10, 5],
                        xrightleftharpoons: ['xArrow', 8652, 10, 10],
                        xrightharpoonup: ['xArrow', 8640, 5, 10],
                        xleftharpoonup: ['xArrow', 8636, 10, 5],
                        xleftrightharpoons: ['xArrow', 8651, 10, 10],
                        mathllap: ['MathLap', 'l', !1],
                        mathrlap: ['MathLap', 'r', !1],
                        mathclap: ['MathLap', 'c', !1],
                        clap: ['MtLap', 'c'],
                        textllap: ['MtLap', 'l'],
                        textrlap: ['MtLap', 'r'],
                        textclap: ['MtLap', 'c'],
                        cramped: 'Cramped',
                        crampedllap: ['MathLap', 'l', !0],
                        crampedrlap: ['MathLap', 'r', !0],
                        crampedclap: ['MathLap', 'c', !0],
                        crampedsubstack: [
                            'Macro',
                            '\\begin{crampedsubarray}{c}#1\\end{crampedsubarray}',
                            1,
                        ],
                        mathmbox: 'MathMBox',
                        mathmakebox: 'MathMakeBox',
                        overbracket: 'UnderOverBracket',
                        underbracket: 'UnderOverBracket',
                        refeq: 'HandleRef',
                        MoveEqLeft: ['Macro', '\\hspace{#1em}&\\hspace{-#1em}', 1, '2'],
                        Aboxed: 'Aboxed',
                        ArrowBetweenLines: 'ArrowBetweenLines',
                        vdotswithin: 'VDotsWithin',
                        shortvdotswithin: 'ShortVDotsWithin',
                        MTFlushSpaceAbove: 'FlushSpaceAbove',
                        MTFlushSpaceBelow: 'FlushSpaceBelow',
                        DeclarePairedDelimiter: 'DeclarePairedDelimiter',
                        DeclarePairedDelimiterX: 'DeclarePairedDelimiterX',
                        DeclarePairedDelimiterXPP: 'DeclarePairedDelimiterXPP',
                        DeclarePairedDelimiters: 'DeclarePairedDelimiter',
                        DeclarePairedDelimitersX: 'DeclarePairedDelimiterX',
                        DeclarePairedDelimitersXPP: 'DeclarePairedDelimiterXPP',
                        centercolon: ['CenterColon', !0, !0],
                        ordinarycolon: ['CenterColon', !1],
                        MTThinColon: ['CenterColon', !0, !0, !0],
                        coloneqq: ['Relation', ':=', '\u2254'],
                        Coloneqq: ['Relation', '::=', '\u2a74'],
                        coloneq: ['Relation', ':-'],
                        Coloneq: ['Relation', '::-'],
                        eqqcolon: ['Relation', '=:', '\u2255'],
                        Eqqcolon: ['Relation', '=::'],
                        eqcolon: ['Relation', '-:', '\u2239'],
                        Eqcolon: ['Relation', '-::'],
                        colonapprox: ['Relation', ':\\approx'],
                        Colonapprox: ['Relation', '::\\approx'],
                        colonsim: ['Relation', ':\\sim'],
                        Colonsim: ['Relation', '::\\sim'],
                        dblcolon: ['Relation', '::', '\u2237'],
                        nuparrow: ['NArrow', '\u2191', '.06em'],
                        ndownarrow: ['NArrow', '\u2193', '.25em'],
                        bigtimes: [
                            'Macro',
                            '\\mathop{\\Large\\kern-.1em\\boldsymbol{\\times}\\kern-.1em}',
                        ],
                        splitfrac: ['SplitFrac', !1],
                        splitdfrac: ['SplitFrac', !0],
                        xmathstrut: 'XMathStrut',
                        prescript: 'Prescript',
                        newtagform: ['NewTagForm', !1],
                        renewtagform: ['NewTagForm', !0],
                        usetagform: 'UseTagForm',
                        adjustlimits: [
                            'MacroWithTemplate',
                            '\\mathop{{#1}\\vphantom{{#3}}}_{{#2}\\vphantom{{#4}}}\\mathop{{#3}\\vphantom{{#1}}}_{{#4}\\vphantom{{#2}}}',
                            4,
                            ,
                            '_',
                            ,
                            '_',
                        ],
                        mathtoolsset: 'SetOptions',
                    },
                    i.MathtoolsMethods,
                ),
                    new n.EnvironmentMap(
                        'mathtools-environments',
                        o.default.environment,
                        {
                            dcases: ['Array', null, '\\{', '', 'll', null, '.2em', 'D'],
                            rcases: ['Array', null, '', '\\}', 'll', null, '.2em'],
                            drcases: ['Array', null, '', '\\}', 'll', null, '.2em', 'D'],
                            'dcases*': ['Cases', null, '{', '', 'D'],
                            'rcases*': ['Cases', null, '', '}'],
                            'drcases*': ['Cases', null, '', '}', 'D'],
                            'cases*': ['Cases', null, '{', ''],
                            'matrix*': ['MtMatrix', null, null, null],
                            'pmatrix*': ['MtMatrix', null, '(', ')'],
                            'bmatrix*': ['MtMatrix', null, '[', ']'],
                            'Bmatrix*': ['MtMatrix', null, '\\{', '\\}'],
                            'vmatrix*': ['MtMatrix', null, '\\vert', '\\vert'],
                            'Vmatrix*': ['MtMatrix', null, '\\Vert', '\\Vert'],
                            'smallmatrix*': ['MtSmallMatrix', null, null, null],
                            psmallmatrix: ['MtSmallMatrix', null, '(', ')', 'c'],
                            'psmallmatrix*': ['MtSmallMatrix', null, '(', ')'],
                            bsmallmatrix: ['MtSmallMatrix', null, '[', ']', 'c'],
                            'bsmallmatrix*': ['MtSmallMatrix', null, '[', ']'],
                            Bsmallmatrix: ['MtSmallMatrix', null, '\\{', '\\}', 'c'],
                            'Bsmallmatrix*': ['MtSmallMatrix', null, '\\{', '\\}'],
                            vsmallmatrix: ['MtSmallMatrix', null, '\\vert', '\\vert', 'c'],
                            'vsmallmatrix*': ['MtSmallMatrix', null, '\\vert', '\\vert'],
                            Vsmallmatrix: ['MtSmallMatrix', null, '\\Vert', '\\Vert', 'c'],
                            'Vsmallmatrix*': ['MtSmallMatrix', null, '\\Vert', '\\Vert'],
                            crampedsubarray: [
                                'Array',
                                null,
                                null,
                                null,
                                null,
                                '0em',
                                '0.1em',
                                "S'",
                                1,
                            ],
                            multlined: 'MtMultlined',
                            spreadlines: ['SpreadLines', !0],
                            lgathered: ['AmsEqnArray', null, null, null, 'l', null, '.5em', 'D'],
                            rgathered: ['AmsEqnArray', null, null, null, 'r', null, '.5em', 'D'],
                        },
                        i.MathtoolsMethods,
                    ),
                    new n.DelimiterMap('mathtools-delimiters', o.default.delimiter, {
                        '\\lparen': '(',
                        '\\rparen': ')',
                    }),
                    new n.CommandMap(
                        'mathtools-characters',
                        { ':': ['CenterColon', !0] },
                        i.MathtoolsMethods,
                    );
            },
            178: function (t, e, a) {
                var r =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (r =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, a = 1, r = arguments.length; a < r; a++)
                                            for (var o in (e = arguments[a]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                r.apply(this, arguments)
                            );
                        },
                    o =
                        (this && this.__read) ||
                        function (t, e) {
                            var a = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!a) return t;
                            var r,
                                o,
                                n = a.call(t),
                                l = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(r = n.next()).done; )
                                    l.push(r.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    r && !r.done && (a = n.return) && a.call(n);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return l;
                        },
                    n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                a = e && t[e],
                                r = 0;
                            if (a) return a.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && r >= t.length && (t = void 0),
                                            { value: t && t[r++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    l =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MathtoolsMethods = void 0);
                var i = l(a(398)),
                    s = a(939),
                    u = l(a(360)),
                    c = l(a(193)),
                    d = l(a(402)),
                    m = l(a(748)),
                    h = a(801),
                    p = a(230),
                    f = a(74),
                    M = l(a(892)),
                    x = l(a(432)),
                    g = a(262);
                e.MathtoolsMethods = {
                    MtMatrix: function (t, a, r, o) {
                        var n = t.GetBrackets('\\begin{'.concat(a.getName(), '}'), 'c');
                        return e.MathtoolsMethods.Array(t, a, r, o, n);
                    },
                    MtSmallMatrix: function (t, a, r, o, n) {
                        return (
                            n ||
                                (n = t.GetBrackets(
                                    '\\begin{'.concat(a.getName(), '}'),
                                    t.options.mathtools['smallmatrix-align'],
                                )),
                            e.MathtoolsMethods.Array(
                                t,
                                a,
                                r,
                                o,
                                n,
                                i.default.Em(1 / 3),
                                '.2em',
                                'S',
                                1,
                            )
                        );
                    },
                    MtMultlined: function (t, e) {
                        var a,
                            r = '\\begin{'.concat(e.getName(), '}'),
                            n = t.GetBrackets(r, t.options.mathtools['multlined-pos'] || 'c'),
                            l = n ? t.GetBrackets(r, '') : '';
                        n && !n.match(/^[cbt]$/) && ((l = (a = o([n, l], 2))[0]), (n = a[1])),
                            t.Push(e);
                        var s = t.itemFactory.create('multlined', t, e);
                        return (
                            (s.arraydef = {
                                displaystyle: !0,
                                rowspacing: '.5em',
                                width: l || 'auto',
                                columnwidth: '100%',
                            }),
                            i.default.setArrayAlign(s, n || 'c')
                        );
                    },
                    HandleShove: function (t, e, a) {
                        var r = t.stack.Top();
                        if ('multline' !== r.kind && 'multlined' !== r.kind)
                            throw new d.default(
                                'CommandInMultlined',
                                '%1 can only appear within the multline or multlined environments',
                                e,
                            );
                        if (r.Size())
                            throw new d.default(
                                'CommandAtTheBeginingOfLine',
                                '%1 must come at the beginning of the line',
                                e,
                            );
                        r.setProperty('shove', a);
                        var o = t.GetBrackets(e),
                            n = t.ParseArg(e);
                        if (o) {
                            var l = t.create('node', 'mrow', []),
                                i = t.create('node', 'mspace', [], { width: o });
                            'left' === a
                                ? (l.appendChild(i), l.appendChild(n))
                                : (l.appendChild(n), l.appendChild(i)),
                                (n = l);
                        }
                        t.Push(n);
                    },
                    SpreadLines: function (t, e) {
                        var a, r;
                        if (t.stack.env.closing === e.getName()) {
                            delete t.stack.env.closing;
                            var o = t.stack.Pop(),
                                l = o.toMml(),
                                i = o.getProperty('spread');
                            if (l.isInferred)
                                try {
                                    for (
                                        var s = n(m.default.getChildren(l)), u = s.next();
                                        !u.done;
                                        u = s.next()
                                    ) {
                                        var c = u.value;
                                        g.MathtoolsUtil.spreadLines(c, i);
                                    }
                                } catch (t) {
                                    a = { error: t };
                                } finally {
                                    try {
                                        u && !u.done && (r = s.return) && r.call(s);
                                    } finally {
                                        if (a) throw a.error;
                                    }
                                }
                            else g.MathtoolsUtil.spreadLines(l, i);
                            t.Push(l);
                        } else {
                            i = t.GetDimen('\\begin{'.concat(e.getName(), '}'));
                            e.setProperty('spread', i), t.Push(e);
                        }
                    },
                    Cases: function (t, e, a, r, o) {
                        var n = t.itemFactory.create('array').setProperty('casesEnv', e.getName());
                        return (
                            (n.arraydef = {
                                rowspacing: '.2em',
                                columnspacing: '1em',
                                columnalign: 'left',
                            }),
                            'D' === o && (n.arraydef.displaystyle = !0),
                            n.setProperties({ open: a, close: r }),
                            t.Push(e),
                            n
                        );
                    },
                    MathLap: function (t, e, a, o) {
                        var n = t.GetBrackets(e, '').trim(),
                            l = t.create(
                                'node',
                                'mstyle',
                                [
                                    t.create(
                                        'node',
                                        'mpadded',
                                        [t.ParseArg(e)],
                                        r(
                                            { width: 0 },
                                            'r' === a
                                                ? {}
                                                : { lspace: 'l' === a ? '-1width' : '-.5width' },
                                        ),
                                    ),
                                ],
                                { 'data-cramped': o },
                            );
                        g.MathtoolsUtil.setDisplayLevel(l, n),
                            t.Push(t.create('node', 'TeXAtom', [l]));
                    },
                    Cramped: function (t, e) {
                        var a = t.GetBrackets(e, '').trim(),
                            r = t.ParseArg(e),
                            o = t.create('node', 'mstyle', [r], { 'data-cramped': !0 });
                        g.MathtoolsUtil.setDisplayLevel(o, a), t.Push(o);
                    },
                    MtLap: function (t, e, a) {
                        var r = i.default.internalMath(t, t.GetArgument(e), 0),
                            o = t.create('node', 'mpadded', r, { width: 0 });
                        'r' !== a &&
                            m.default.setAttribute(o, 'lspace', 'l' === a ? '-1width' : '-.5width'),
                            t.Push(o);
                    },
                    MathMakeBox: function (t, e) {
                        var a = t.GetBrackets(e),
                            r = t.GetBrackets(e, 'c'),
                            o = t.create('node', 'mpadded', [t.ParseArg(e)]);
                        a && m.default.setAttribute(o, 'width', a);
                        var n = (0, f.lookup)(r, { c: 'center', r: 'right' }, '');
                        n && m.default.setAttribute(o, 'data-align', n), t.Push(o);
                    },
                    MathMBox: function (t, e) {
                        t.Push(t.create('node', 'mrow', [t.ParseArg(e)]));
                    },
                    UnderOverBracket: function (t, e) {
                        var a = (0, p.length2em)(t.GetBrackets(e, '.1em'), 0.1),
                            r = t.GetBrackets(e, '.2em'),
                            n = t.GetArgument(e),
                            l = o(
                                'o' === e.charAt(1)
                                    ? ['over', 'accent', 'bottom']
                                    : ['under', 'accentunder', 'top'],
                                3,
                            ),
                            s = l[0],
                            u = l[1],
                            d = l[2],
                            h = (0, p.em)(a),
                            f = new c.default(n, t.stack.env, t.configuration).mml(),
                            M = new c.default(n, t.stack.env, t.configuration).mml(),
                            x = t.create('node', 'mpadded', [t.create('node', 'mphantom', [M])], {
                                style: 'border: '.concat(h, ' solid; border-').concat(d, ': none'),
                                height: r,
                                depth: 0,
                            }),
                            g = i.default.underOver(t, f, x, s, !0),
                            v = m.default.getChildAt(m.default.getChildAt(g, 0), 0);
                        m.default.setAttribute(v, u, !0), t.Push(g);
                    },
                    Aboxed: function (t, e) {
                        var a = g.MathtoolsUtil.checkAlignment(t, e);
                        a.row.length % 2 == 1 && a.row.push(t.create('node', 'mtd', []));
                        var r = t.GetArgument(e),
                            o = t.string.substr(t.i);
                        (t.string = r + '&&\\endAboxed'), (t.i = 0);
                        var n = t.GetUpTo(e, '&'),
                            l = t.GetUpTo(e, '&');
                        t.GetUpTo(e, '\\endAboxed');
                        var s = i.default.substituteArgs(
                            t,
                            [n, l],
                            '\\rlap{\\boxed{#1{}#2}}\\kern.267em\\phantom{#1}&\\phantom{{}#2}\\kern.267em',
                        );
                        (t.string = s + o), (t.i = 0);
                    },
                    ArrowBetweenLines: function (t, e) {
                        var a = g.MathtoolsUtil.checkAlignment(t, e);
                        if (a.Size() || a.row.length)
                            throw new d.default('BetweenLines', '%1 must be on a row by itself', e);
                        var r = t.GetStar(),
                            o = t.GetBrackets(e, '\\Updownarrow');
                        r && (a.EndEntry(), a.EndEntry());
                        var n = r ? '\\quad' + o : o + '\\quad',
                            l = new c.default(n, t.stack.env, t.configuration).mml();
                        t.Push(l), a.EndEntry(), a.EndRow();
                    },
                    VDotsWithin: function (t, e) {
                        var a = t.stack.Top(),
                            o = a.getProperty('flushspaceabove') === a.table.length,
                            n = '\\mmlToken{mi}{}' + t.GetArgument(e) + '\\mmlToken{mi}{}',
                            l = new c.default(n, t.stack.env, t.configuration).mml(),
                            i = t.create(
                                'node',
                                'mpadded',
                                [
                                    t.create(
                                        'node',
                                        'mpadded',
                                        [t.create('node', 'mo', [t.create('text', '\u22ee')])],
                                        r(
                                            { width: 0, lspace: '-.5width' },
                                            o ? { height: '-.6em', voffset: '-.18em' } : {},
                                        ),
                                    ),
                                    t.create('node', 'mphantom', [l]),
                                ],
                                { lspace: '.5width' },
                            );
                        t.Push(i);
                    },
                    ShortVDotsWithin: function (t, a) {
                        var r = t.stack.Top(),
                            o = t.GetStar();
                        e.MathtoolsMethods.FlushSpaceAbove(t, '\\MTFlushSpaceAbove'),
                            !o && r.EndEntry(),
                            e.MathtoolsMethods.VDotsWithin(t, '\\vdotswithin'),
                            o && r.EndEntry(),
                            e.MathtoolsMethods.FlushSpaceBelow(t, '\\MTFlushSpaceBelow');
                    },
                    FlushSpaceAbove: function (t, e) {
                        var a = g.MathtoolsUtil.checkAlignment(t, e);
                        a.setProperty('flushspaceabove', a.table.length),
                            a.addRowSpacing('-' + t.options.mathtools.shortvdotsadjustabove);
                    },
                    FlushSpaceBelow: function (t, e) {
                        var a = g.MathtoolsUtil.checkAlignment(t, e);
                        a.Size() && a.EndEntry(),
                            a.EndRow(),
                            a.addRowSpacing('-' + t.options.mathtools.shortvdotsadjustbelow);
                    },
                    PairedDelimiters: function (t, e, a, r, n, l, s, u) {
                        void 0 === n && (n = '#1'),
                            void 0 === l && (l = 1),
                            void 0 === s && (s = ''),
                            void 0 === u && (u = '');
                        var c = t.GetStar(),
                            d = c ? '' : t.GetBrackets(e),
                            m = o(c ? ['\\left', '\\right'] : d ? [d + 'l', d + 'r'] : ['', ''], 2),
                            h = m[0],
                            p = m[1],
                            f = c ? '\\middle' : d || '';
                        if (l) {
                            for (var M = [], x = M.length; x < l; x++) M.push(t.GetArgument(e));
                            (s = i.default.substituteArgs(t, M, s)),
                                (n = i.default.substituteArgs(t, M, n)),
                                (u = i.default.substituteArgs(t, M, u));
                        }
                        (n = n.replace(/\\delimsize/g, f)),
                            (t.string = [s, h, a, n, p, r, u, t.string.substr(t.i)].reduce(
                                function (e, a) {
                                    return i.default.addArgs(t, e, a);
                                },
                                '',
                            )),
                            (t.i = 0),
                            i.default.checkMaxMacros(t);
                    },
                    DeclarePairedDelimiter: function (t, e) {
                        var a = M.default.GetCsNameArgument(t, e),
                            r = t.GetArgument(e),
                            o = t.GetArgument(e);
                        g.MathtoolsUtil.addPairedDelims(t.configuration, a, [r, o]);
                    },
                    DeclarePairedDelimiterX: function (t, e) {
                        var a = M.default.GetCsNameArgument(t, e),
                            r = M.default.GetArgCount(t, e),
                            o = t.GetArgument(e),
                            n = t.GetArgument(e),
                            l = t.GetArgument(e);
                        g.MathtoolsUtil.addPairedDelims(t.configuration, a, [o, n, l, r]);
                    },
                    DeclarePairedDelimiterXPP: function (t, e) {
                        var a = M.default.GetCsNameArgument(t, e),
                            r = M.default.GetArgCount(t, e),
                            o = t.GetArgument(e),
                            n = t.GetArgument(e),
                            l = t.GetArgument(e),
                            i = t.GetArgument(e),
                            s = t.GetArgument(e);
                        g.MathtoolsUtil.addPairedDelims(t.configuration, a, [n, l, s, r, o, i]);
                    },
                    CenterColon: function (t, e, a, o, n) {
                        void 0 === o && (o = !1), void 0 === n && (n = !1);
                        var l = t.options.mathtools,
                            i = t.create('token', 'mo', {}, ':');
                        if (a && (l.centercolon || o)) {
                            var s = l['centercolon-offset'];
                            i = t.create(
                                'node',
                                'mpadded',
                                [i],
                                r(
                                    { voffset: s, height: '+'.concat(s), depth: '-'.concat(s) },
                                    n
                                        ? { width: l['thincolon-dw'], lspace: l['thincolon-dx'] }
                                        : {},
                                ),
                            );
                        }
                        t.Push(i);
                    },
                    Relation: function (t, e, a, r) {
                        t.options.mathtools['use-unicode'] && r
                            ? t.Push(t.create('token', 'mo', { texClass: h.TEXCLASS.REL }, r))
                            : ((a =
                                  '\\mathrel{' +
                                  a.replace(/:/g, '\\MTThinColon').replace(/-/g, '\\mathrel{-}') +
                                  '}'),
                              (t.string = i.default.addArgs(t, a, t.string.substr(t.i))),
                              (t.i = 0));
                    },
                    NArrow: function (t, e, a, r) {
                        t.Push(
                            t.create(
                                'node',
                                'TeXAtom',
                                [
                                    t.create('token', 'mtext', {}, a),
                                    t.create(
                                        'node',
                                        'mpadded',
                                        [
                                            t.create(
                                                'node',
                                                'mpadded',
                                                [
                                                    t.create(
                                                        'node',
                                                        'menclose',
                                                        [
                                                            t.create('node', 'mspace', [], {
                                                                height: '.2em',
                                                                depth: 0,
                                                                width: '.4em',
                                                            }),
                                                        ],
                                                        {
                                                            notation: 'updiagonalstrike',
                                                            'data-thickness': '.05em',
                                                            'data-padding': 0,
                                                        },
                                                    ),
                                                ],
                                                { width: 0, lspace: '-.5width', voffset: r },
                                            ),
                                            t.create('node', 'mphantom', [
                                                t.create('token', 'mtext', {}, a),
                                            ]),
                                        ],
                                        { width: 0, lspace: '-.5width' },
                                    ),
                                ],
                                { texClass: h.TEXCLASS.REL },
                            ),
                        );
                    },
                    SplitFrac: function (t, e, a) {
                        var r = t.ParseArg(e),
                            o = t.ParseArg(e);
                        t.Push(
                            t.create(
                                'node',
                                'mstyle',
                                [
                                    t.create(
                                        'node',
                                        'mfrac',
                                        [
                                            t.create(
                                                'node',
                                                'mstyle',
                                                [
                                                    r,
                                                    t.create('token', 'mi'),
                                                    t.create('token', 'mspace', { width: '1em' }),
                                                ],
                                                { scriptlevel: 0 },
                                            ),
                                            t.create(
                                                'node',
                                                'mstyle',
                                                [
                                                    t.create('token', 'mspace', { width: '1em' }),
                                                    t.create('token', 'mi'),
                                                    o,
                                                ],
                                                { scriptlevel: 0 },
                                            ),
                                        ],
                                        { linethickness: 0, numalign: 'left', denomalign: 'right' },
                                    ),
                                ],
                                { displaystyle: a, scriptlevel: 0 },
                            ),
                        );
                    },
                    XMathStrut: function (t, e) {
                        var a = t.GetBrackets(e),
                            r = t.GetArgument(e);
                        (r = g.MathtoolsUtil.plusOrMinus(e, r)),
                            (a = g.MathtoolsUtil.plusOrMinus(e, a || r)),
                            t.Push(
                                t.create(
                                    'node',
                                    'TeXAtom',
                                    [
                                        t.create(
                                            'node',
                                            'mpadded',
                                            [
                                                t.create('node', 'mphantom', [
                                                    t.create('token', 'mo', { stretchy: !1 }, '('),
                                                ]),
                                            ],
                                            { width: 0, height: r + 'height', depth: a + 'depth' },
                                        ),
                                    ],
                                    { texClass: h.TEXCLASS.ORD },
                                ),
                            );
                    },
                    Prescript: function (t, e) {
                        var a = g.MathtoolsUtil.getScript(t, e, 'sup'),
                            r = g.MathtoolsUtil.getScript(t, e, 'sub'),
                            o = g.MathtoolsUtil.getScript(t, e, 'arg');
                        if (m.default.isType(a, 'none') && m.default.isType(r, 'none')) t.Push(o);
                        else {
                            var n = t.create('node', 'mmultiscripts', [o]);
                            m.default.getChildren(n).push(null, null),
                                m.default.appendChildren(n, [
                                    t.create('node', 'mprescripts'),
                                    r,
                                    a,
                                ]),
                                n.setProperty('fixPrescript', !0),
                                t.Push(n);
                        }
                    },
                    NewTagForm: function (t, e, a) {
                        void 0 === a && (a = !1);
                        var r = t.tags;
                        if (!('mtFormats' in r))
                            throw new d.default(
                                'TagsNotMT',
                                '%1 can only be used with ams or mathtools tags',
                                e,
                            );
                        var o = t.GetArgument(e).trim();
                        if (!o)
                            throw new d.default('InvalidTagFormID', "Tag form name can't be empty");
                        var n = t.GetBrackets(e, ''),
                            l = t.GetArgument(e),
                            i = t.GetArgument(e);
                        if (!a && r.mtFormats.has(o))
                            throw new d.default('DuplicateTagForm', 'Duplicate tag form: %1', o);
                        r.mtFormats.set(o, [l, i, n]);
                    },
                    UseTagForm: function (t, e) {
                        var a = t.tags;
                        if (!('mtFormats' in a))
                            throw new d.default(
                                'TagsNotMT',
                                '%1 can only be used with ams or mathtools tags',
                                e,
                            );
                        var r = t.GetArgument(e).trim();
                        if (r) {
                            if (!a.mtFormats.has(r))
                                throw new d.default(
                                    'UndefinedTagForm',
                                    'Undefined tag form: %1',
                                    r,
                                );
                            a.mtCurrent = a.mtFormats.get(r);
                        } else a.mtCurrent = null;
                    },
                    SetOptions: function (t, e) {
                        var a,
                            r,
                            o = t.options.mathtools;
                        if (!o['allow-mathtoolsset'])
                            throw new d.default('ForbiddenMathtoolsSet', '%1 is disabled', e);
                        var l = {};
                        Object.keys(o).forEach(function (t) {
                            'pariedDelimiters' !== t &&
                                'tagforms' !== t &&
                                'allow-mathtoolsset' !== t &&
                                (l[t] = 1);
                        });
                        var s = t.GetArgument(e),
                            u = i.default.keyvalOptions(s, l, !0);
                        try {
                            for (var c = n(Object.keys(u)), m = c.next(); !m.done; m = c.next()) {
                                var h = m.value;
                                o[h] = u[h];
                            }
                        } catch (t) {
                            a = { error: t };
                        } finally {
                            try {
                                m && !m.done && (r = c.return) && r.call(c);
                            } finally {
                                if (a) throw a.error;
                            }
                        }
                    },
                    Array: u.default.Array,
                    Macro: u.default.Macro,
                    xArrow: s.AmsMethods.xArrow,
                    HandleRef: s.AmsMethods.HandleRef,
                    AmsEqnArray: s.AmsMethods.AmsEqnArray,
                    MacroWithTemplate: x.default.MacroWithTemplate,
                };
            },
            298: function (t, e, a) {
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
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                a = e && t[e],
                                r = 0;
                            if (a) return a.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && r >= t.length && (t = void 0),
                                            { value: t && t[r++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    l =
                        (this && this.__read) ||
                        function (t, e) {
                            var a = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!a) return t;
                            var r,
                                o,
                                n = a.call(t),
                                l = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(r = n.next()).done; )
                                    l.push(r.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    r && !r.done && (a = n.return) && a.call(n);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return l;
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MathtoolsTagFormat = void 0);
                var s = i(a(402)),
                    u = a(680),
                    c = 0;
                e.MathtoolsTagFormat = function (t, e) {
                    var a = e.parseOptions.options.tags;
                    'base' !== a && t.tags.hasOwnProperty(a) && u.TagsFactory.add(a, t.tags[a]);
                    var r = (function (t) {
                            function a() {
                                var a,
                                    r,
                                    o = t.call(this) || this;
                                (o.mtFormats = new Map()), (o.mtCurrent = null);
                                var l = e.parseOptions.options.mathtools.tagforms;
                                try {
                                    for (
                                        var i = n(Object.keys(l)), u = i.next();
                                        !u.done;
                                        u = i.next()
                                    ) {
                                        var c = u.value;
                                        if (!Array.isArray(l[c]) || 3 !== l[c].length)
                                            throw new s.default(
                                                'InvalidTagFormDef',
                                                'The tag form definition for "%1" should be an array fo three strings',
                                                c,
                                            );
                                        o.mtFormats.set(c, l[c]);
                                    }
                                } catch (t) {
                                    a = { error: t };
                                } finally {
                                    try {
                                        u && !u.done && (r = i.return) && r.call(i);
                                    } finally {
                                        if (a) throw a.error;
                                    }
                                }
                                return o;
                            }
                            return (
                                o(a, t),
                                (a.prototype.formatTag = function (e) {
                                    if (this.mtCurrent) {
                                        var a = l(this.mtCurrent, 3),
                                            r = a[0],
                                            o = a[1],
                                            n = a[2];
                                        return n
                                            ? ''.concat(r).concat(n, '{').concat(e, '}').concat(o)
                                            : ''.concat(r).concat(e).concat(o);
                                    }
                                    return t.prototype.formatTag.call(this, e);
                                }),
                                a
                            );
                        })(u.TagsFactory.create(e.parseOptions.options.tags).constructor),
                        i = 'MathtoolsTags-' + ++c;
                    u.TagsFactory.add(i, r), (e.parseOptions.options.tags = i);
                };
            },
            262: function (t, e, a) {
                var r =
                        (this && this.__read) ||
                        function (t, e) {
                            var a = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!a) return t;
                            var r,
                                o,
                                n = a.call(t),
                                l = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(r = n.next()).done; )
                                    l.push(r.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    r && !r.done && (a = n.return) && a.call(n);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return l;
                        },
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MathtoolsUtil = void 0);
                var n = a(935),
                    l = o(a(398)),
                    i = o(a(193)),
                    s = o(a(402)),
                    u = a(924),
                    c = a(74),
                    d = a(178),
                    m = a(205);
                e.MathtoolsUtil = {
                    setDisplayLevel: function (t, e) {
                        if (e) {
                            var a = r(
                                    (0, c.lookup)(
                                        e,
                                        {
                                            '\\displaystyle': [!0, 0],
                                            '\\textstyle': [!1, 0],
                                            '\\scriptstyle': [!1, 1],
                                            '\\scriptscriptstyle': [!1, 2],
                                        },
                                        [null, null],
                                    ),
                                    2,
                                ),
                                o = a[0],
                                n = a[1];
                            null !== o &&
                                (t.attributes.set('displaystyle', o),
                                t.attributes.set('scriptlevel', n));
                        }
                    },
                    checkAlignment: function (t, e) {
                        var a = t.stack.Top();
                        if (a.kind !== n.EqnArrayItem.prototype.kind)
                            throw new s.default(
                                'NotInAlignment',
                                '%1 can only be used in aligment environments',
                                e,
                            );
                        return a;
                    },
                    addPairedDelims: function (t, e, a) {
                        t.handlers
                            .retrieve(m.PAIREDDELIMS)
                            .add(e, new u.Macro(e, d.MathtoolsMethods.PairedDelimiters, a));
                    },
                    spreadLines: function (t, e) {
                        if (t.isKind('mtable')) {
                            var a = t.attributes.get('rowspacing');
                            if (a) {
                                var r = l.default.dimen2em(e);
                                a = a
                                    .split(/ /)
                                    .map(function (t) {
                                        return l.default.Em(Math.max(0, l.default.dimen2em(t) + r));
                                    })
                                    .join(' ');
                            } else a = e;
                            t.attributes.set('rowspacing', a);
                        }
                    },
                    plusOrMinus: function (t, e) {
                        if (!(e = e.trim()).match(/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/))
                            throw new s.default('NotANumber', 'Argument to %1 is not a number', t);
                        return e.match(/^[-+]/) ? e : '+' + e;
                    },
                    getScript: function (t, e, a) {
                        var r = l.default.trimSpaces(t.GetArgument(e));
                        if ('' === r) return t.create('node', 'none');
                        var o = t.options.mathtools['prescript-'.concat(a, '-format')];
                        return (
                            o && (r = ''.concat(o, '{').concat(r, '}')),
                            new i.default(r, t.stack.env, t.configuration).mml()
                        );
                    },
                };
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
            74: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.isObject = MathJax._.util.Options.isObject),
                    (e.APPEND = MathJax._.util.Options.APPEND),
                    (e.REMOVE = MathJax._.util.Options.REMOVE),
                    (e.OPTIONS = MathJax._.util.Options.OPTIONS),
                    (e.Expandable = MathJax._.util.Options.Expandable),
                    (e.expandable = MathJax._.util.Options.expandable),
                    (e.makeArray = MathJax._.util.Options.makeArray),
                    (e.keys = MathJax._.util.Options.keys),
                    (e.copy = MathJax._.util.Options.copy),
                    (e.insert = MathJax._.util.Options.insert),
                    (e.defaultOptions = MathJax._.util.Options.defaultOptions),
                    (e.userOptions = MathJax._.util.Options.userOptions),
                    (e.selectOptions = MathJax._.util.Options.selectOptions),
                    (e.selectOptionsFromKeys = MathJax._.util.Options.selectOptionsFromKeys),
                    (e.separateOptions = MathJax._.util.Options.separateOptions),
                    (e.lookup = MathJax._.util.Options.lookup);
            },
            230: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.BIGDIMEN = MathJax._.util.lengths.BIGDIMEN),
                    (e.UNITS = MathJax._.util.lengths.UNITS),
                    (e.RELUNITS = MathJax._.util.lengths.RELUNITS),
                    (e.MATHSPACE = MathJax._.util.lengths.MATHSPACE),
                    (e.length2em = MathJax._.util.lengths.length2em),
                    (e.percent = MathJax._.util.lengths.percent),
                    (e.em = MathJax._.util.lengths.em),
                    (e.emRounded = MathJax._.util.lengths.emRounded),
                    (e.px = MathJax._.util.lengths.px);
            },
            251: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Configuration = MathJax._.input.tex.Configuration.Configuration),
                    (e.ConfigurationHandler =
                        MathJax._.input.tex.Configuration.ConfigurationHandler),
                    (e.ParserConfiguration = MathJax._.input.tex.Configuration.ParserConfiguration);
            },
            748: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.NodeUtil.default);
            },
            945: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.ParseMethods.default);
            },
            398: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.ParseUtil.default);
            },
            924: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Symbol = MathJax._.input.tex.Symbol.Symbol),
                    (e.Macro = MathJax._.input.tex.Symbol.Macro);
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
            680: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Label = MathJax._.input.tex.Tags.Label),
                    (e.TagInfo = MathJax._.input.tex.Tags.TagInfo),
                    (e.AbstractTags = MathJax._.input.tex.Tags.AbstractTags),
                    (e.NoTags = MathJax._.input.tex.Tags.NoTags),
                    (e.AllTags = MathJax._.input.tex.Tags.AllTags),
                    (e.TagsFactory = MathJax._.input.tex.Tags.TagsFactory);
            },
            108: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TexConstant = MathJax._.input.tex.TexConstants.TexConstant);
            },
            402: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.TexError.default);
            },
            193: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.TexParser.default);
            },
            935: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.StartItem = MathJax._.input.tex.base.BaseItems.StartItem),
                    (e.StopItem = MathJax._.input.tex.base.BaseItems.StopItem),
                    (e.OpenItem = MathJax._.input.tex.base.BaseItems.OpenItem),
                    (e.CloseItem = MathJax._.input.tex.base.BaseItems.CloseItem),
                    (e.PrimeItem = MathJax._.input.tex.base.BaseItems.PrimeItem),
                    (e.SubsupItem = MathJax._.input.tex.base.BaseItems.SubsupItem),
                    (e.OverItem = MathJax._.input.tex.base.BaseItems.OverItem),
                    (e.LeftItem = MathJax._.input.tex.base.BaseItems.LeftItem),
                    (e.Middle = MathJax._.input.tex.base.BaseItems.Middle),
                    (e.RightItem = MathJax._.input.tex.base.BaseItems.RightItem),
                    (e.BeginItem = MathJax._.input.tex.base.BaseItems.BeginItem),
                    (e.EndItem = MathJax._.input.tex.base.BaseItems.EndItem),
                    (e.StyleItem = MathJax._.input.tex.base.BaseItems.StyleItem),
                    (e.PositionItem = MathJax._.input.tex.base.BaseItems.PositionItem),
                    (e.CellItem = MathJax._.input.tex.base.BaseItems.CellItem),
                    (e.MmlItem = MathJax._.input.tex.base.BaseItems.MmlItem),
                    (e.FnItem = MathJax._.input.tex.base.BaseItems.FnItem),
                    (e.NotItem = MathJax._.input.tex.base.BaseItems.NotItem),
                    (e.NonscriptItem = MathJax._.input.tex.base.BaseItems.NonscriptItem),
                    (e.DotsItem = MathJax._.input.tex.base.BaseItems.DotsItem),
                    (e.ArrayItem = MathJax._.input.tex.base.BaseItems.ArrayItem),
                    (e.EqnArrayItem = MathJax._.input.tex.base.BaseItems.EqnArrayItem),
                    (e.EquationItem = MathJax._.input.tex.base.BaseItems.EquationItem);
            },
            360: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.base.BaseMethods.default);
            },
            927: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MultlineItem = MathJax._.input.tex.ams.AmsItems.MultlineItem),
                    (e.FlalignItem = MathJax._.input.tex.ams.AmsItems.FlalignItem);
            },
            939: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AmsMethods = MathJax._.input.tex.ams.AmsMethods.AmsMethods),
                    (e.NEW_OPS = MathJax._.input.tex.ams.AmsMethods.NEW_OPS);
            },
            432: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.newcommand.NewcommandMethods.default);
            },
            892: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.newcommand.NewcommandUtil.default);
            },
        },
        s = {};
    function u(t) {
        var e = s[t];
        if (void 0 !== e) return e.exports;
        var a = (s[t] = { exports: {} });
        return i[t].call(a.exports, a, a.exports, u), a.exports;
    }
    (t = u(955)),
        (e = u(667)),
        (a = u(205)),
        (r = u(144)),
        (o = u(178)),
        (n = u(298)),
        (l = u(262)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/mathtools', e.q, 'tex-extension'),
        (0, t.r8)({
            _: {
                input: {
                    tex: {
                        mathtools: {
                            MathtoolsConfiguration: a,
                            MathtoolsItems: r,
                            MathtoolsMethods: o,
                            MathtoolsTags: n,
                            MathtoolsUtil: l,
                        },
                    },
                },
            },
        });
})();
