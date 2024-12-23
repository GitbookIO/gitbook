!(function () {
    'use strict';
    var t,
        e,
        a,
        r,
        n,
        o = {
            667: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            996: function (t, e, a) {
                var r;
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.PhysicsConfiguration = void 0);
                var n = a(251),
                    o = a(855);
                a(842),
                    (e.PhysicsConfiguration = n.Configuration.create('physics', {
                        handler: {
                            macro: [
                                'Physics-automatic-bracing-macros',
                                'Physics-vector-macros',
                                'Physics-vector-mo',
                                'Physics-vector-mi',
                                'Physics-derivative-macros',
                                'Physics-expressions-macros',
                                'Physics-quick-quad-macros',
                                'Physics-bra-ket-macros',
                                'Physics-matrix-macros',
                            ],
                            character: ['Physics-characters'],
                            environment: ['Physics-aux-envs'],
                        },
                        items: ((r = {}), (r[o.AutoOpen.prototype.kind] = o.AutoOpen), r),
                        options: { physics: { italicdiff: !1, arrowdel: !1 } },
                    }));
            },
            855: function (t, e, a) {
                var r,
                    n =
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
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.AutoOpen = void 0);
                var i = a(76),
                    c = o(a(398)),
                    s = o(a(748)),
                    l = o(a(193)),
                    u = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.openCount = 0), e;
                        }
                        return (
                            n(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'auto open';
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
                            (e.prototype.toMml = function () {
                                var e = this.factory.configuration.parser,
                                    a = this.getProperty('right');
                                if (this.getProperty('smash')) {
                                    var r = t.prototype.toMml.call(this),
                                        n = e.create('node', 'mpadded', [r], {
                                            height: 0,
                                            depth: 0,
                                        });
                                    this.Clear(), this.Push(e.create('node', 'TeXAtom', [n]));
                                }
                                a &&
                                    this.Push(new l.default(a, e.stack.env, e.configuration).mml());
                                var o = c.default.fenced(
                                    this.factory.configuration,
                                    this.getProperty('open'),
                                    t.prototype.toMml.call(this),
                                    this.getProperty('close'),
                                    this.getProperty('big'),
                                );
                                return (
                                    s.default.removeProperties(o, 'open', 'close', 'texClass'), o
                                );
                            }),
                            (e.prototype.checkItem = function (e) {
                                if (e.isKind('mml') && 1 === e.Size()) {
                                    var a = e.toMml();
                                    a.isKind('mo') &&
                                        a.getText() === this.getProperty('open') &&
                                        this.openCount++;
                                }
                                var r = e.getProperty('autoclose');
                                return r && r === this.getProperty('close') && !this.openCount--
                                    ? this.getProperty('ignore')
                                        ? (this.Clear(), [[], !0])
                                        : [[this.toMml()], !0]
                                    : t.prototype.checkItem.call(this, e);
                            }),
                            (e.errors = Object.assign(Object.create(i.BaseItem.errors), {
                                stop: [
                                    'ExtraOrMissingDelims',
                                    'Extra open or missing close delimiter',
                                ],
                            })),
                            e
                        );
                    })(i.BaseItem);
                e.AutoOpen = u;
            },
            842: function (t, e, a) {
                var r =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var n = a(871),
                    o = r(a(458)),
                    i = a(108),
                    c = r(a(945)),
                    s = a(801);
                new n.CommandMap(
                    'Physics-automatic-bracing-macros',
                    {
                        quantity: 'Quantity',
                        qty: 'Quantity',
                        pqty: ['Quantity', '(', ')', !0],
                        bqty: ['Quantity', '[', ']', !0],
                        vqty: ['Quantity', '|', '|', !0],
                        Bqty: ['Quantity', '\\{', '\\}', !0],
                        absolutevalue: ['Quantity', '|', '|', !0],
                        abs: ['Quantity', '|', '|', !0],
                        norm: ['Quantity', '\\|', '\\|', !0],
                        evaluated: 'Eval',
                        eval: 'Eval',
                        order: ['Quantity', '(', ')', !0, 'O', i.TexConstant.Variant.CALLIGRAPHIC],
                        commutator: 'Commutator',
                        comm: 'Commutator',
                        anticommutator: ['Commutator', '\\{', '\\}'],
                        acomm: ['Commutator', '\\{', '\\}'],
                        poissonbracket: ['Commutator', '\\{', '\\}'],
                        pb: ['Commutator', '\\{', '\\}'],
                    },
                    o.default,
                ),
                    new n.CharacterMap('Physics-vector-mo', c.default.mathchar0mo, {
                        dotproduct: ['\u22c5', { mathvariant: i.TexConstant.Variant.BOLD }],
                        vdot: ['\u22c5', { mathvariant: i.TexConstant.Variant.BOLD }],
                        crossproduct: '\xd7',
                        cross: '\xd7',
                        cp: '\xd7',
                        gradientnabla: ['\u2207', { mathvariant: i.TexConstant.Variant.BOLD }],
                    }),
                    new n.CharacterMap('Physics-vector-mi', c.default.mathchar0mi, {
                        real: ['\u211c', { mathvariant: i.TexConstant.Variant.NORMAL }],
                        imaginary: ['\u2111', { mathvariant: i.TexConstant.Variant.NORMAL }],
                    }),
                    new n.CommandMap(
                        'Physics-vector-macros',
                        {
                            vnabla: 'Vnabla',
                            vectorbold: 'VectorBold',
                            vb: 'VectorBold',
                            vectorarrow: ['StarMacro', 1, '\\vec{\\vb', '{#1}}'],
                            va: ['StarMacro', 1, '\\vec{\\vb', '{#1}}'],
                            vectorunit: ['StarMacro', 1, '\\hat{\\vb', '{#1}}'],
                            vu: ['StarMacro', 1, '\\hat{\\vb', '{#1}}'],
                            gradient: ['OperatorApplication', '\\vnabla', '(', '['],
                            grad: ['OperatorApplication', '\\vnabla', '(', '['],
                            divergence: ['VectorOperator', '\\vnabla\\vdot', '(', '['],
                            div: ['VectorOperator', '\\vnabla\\vdot', '(', '['],
                            curl: ['VectorOperator', '\\vnabla\\crossproduct', '(', '['],
                            laplacian: ['OperatorApplication', '\\nabla^2', '(', '['],
                        },
                        o.default,
                    ),
                    new n.CommandMap(
                        'Physics-expressions-macros',
                        {
                            sin: 'Expression',
                            sinh: 'Expression',
                            arcsin: 'Expression',
                            asin: 'Expression',
                            cos: 'Expression',
                            cosh: 'Expression',
                            arccos: 'Expression',
                            acos: 'Expression',
                            tan: 'Expression',
                            tanh: 'Expression',
                            arctan: 'Expression',
                            atan: 'Expression',
                            csc: 'Expression',
                            csch: 'Expression',
                            arccsc: 'Expression',
                            acsc: 'Expression',
                            sec: 'Expression',
                            sech: 'Expression',
                            arcsec: 'Expression',
                            asec: 'Expression',
                            cot: 'Expression',
                            coth: 'Expression',
                            arccot: 'Expression',
                            acot: 'Expression',
                            exp: ['Expression', !1],
                            log: 'Expression',
                            ln: 'Expression',
                            det: ['Expression', !1],
                            Pr: ['Expression', !1],
                            tr: ['Expression', !1],
                            trace: ['Expression', !1, 'tr'],
                            Tr: ['Expression', !1],
                            Trace: ['Expression', !1, 'Tr'],
                            rank: 'NamedFn',
                            erf: ['Expression', !1],
                            Residue: ['Macro', '\\mathrm{Res}'],
                            Res: ['OperatorApplication', '\\Residue', '(', '[', '{'],
                            principalvalue: ['OperatorApplication', '{\\cal P}'],
                            pv: ['OperatorApplication', '{\\cal P}'],
                            PV: ['OperatorApplication', '{\\rm P.V.}'],
                            Re: ['OperatorApplication', '\\mathrm{Re}', '{'],
                            Im: ['OperatorApplication', '\\mathrm{Im}', '{'],
                            sine: ['NamedFn', 'sin'],
                            hypsine: ['NamedFn', 'sinh'],
                            arcsine: ['NamedFn', 'arcsin'],
                            asine: ['NamedFn', 'asin'],
                            cosine: ['NamedFn', 'cos'],
                            hypcosine: ['NamedFn', 'cosh'],
                            arccosine: ['NamedFn', 'arccos'],
                            acosine: ['NamedFn', 'acos'],
                            tangent: ['NamedFn', 'tan'],
                            hyptangent: ['NamedFn', 'tanh'],
                            arctangent: ['NamedFn', 'arctan'],
                            atangent: ['NamedFn', 'atan'],
                            cosecant: ['NamedFn', 'csc'],
                            hypcosecant: ['NamedFn', 'csch'],
                            arccosecant: ['NamedFn', 'arccsc'],
                            acosecant: ['NamedFn', 'acsc'],
                            secant: ['NamedFn', 'sec'],
                            hypsecant: ['NamedFn', 'sech'],
                            arcsecant: ['NamedFn', 'arcsec'],
                            asecant: ['NamedFn', 'asec'],
                            cotangent: ['NamedFn', 'cot'],
                            hypcotangent: ['NamedFn', 'coth'],
                            arccotangent: ['NamedFn', 'arccot'],
                            acotangent: ['NamedFn', 'acot'],
                            exponential: ['NamedFn', 'exp'],
                            logarithm: ['NamedFn', 'log'],
                            naturallogarithm: ['NamedFn', 'ln'],
                            determinant: ['NamedFn', 'det'],
                            Probability: ['NamedFn', 'Pr'],
                        },
                        o.default,
                    ),
                    new n.CommandMap(
                        'Physics-quick-quad-macros',
                        {
                            qqtext: 'Qqtext',
                            qq: 'Qqtext',
                            qcomma: ['Macro', '\\qqtext*{,}'],
                            qc: ['Macro', '\\qqtext*{,}'],
                            qcc: ['Qqtext', 'c.c.'],
                            qif: ['Qqtext', 'if'],
                            qthen: ['Qqtext', 'then'],
                            qelse: ['Qqtext', 'else'],
                            qotherwise: ['Qqtext', 'otherwise'],
                            qunless: ['Qqtext', 'unless'],
                            qgiven: ['Qqtext', 'given'],
                            qusing: ['Qqtext', 'using'],
                            qassume: ['Qqtext', 'assume'],
                            qsince: ['Qqtext', 'since'],
                            qlet: ['Qqtext', 'let'],
                            qfor: ['Qqtext', 'for'],
                            qall: ['Qqtext', 'all'],
                            qeven: ['Qqtext', 'even'],
                            qodd: ['Qqtext', 'odd'],
                            qinteger: ['Qqtext', 'integer'],
                            qand: ['Qqtext', 'and'],
                            qor: ['Qqtext', 'or'],
                            qas: ['Qqtext', 'as'],
                            qin: ['Qqtext', 'in'],
                        },
                        o.default,
                    ),
                    new n.CommandMap(
                        'Physics-derivative-macros',
                        {
                            diffd: 'DiffD',
                            flatfrac: ['Macro', '\\left.#1\\middle/#2\\right.', 2],
                            differential: ['Differential', '\\diffd'],
                            dd: ['Differential', '\\diffd'],
                            variation: ['Differential', '\\delta'],
                            var: ['Differential', '\\delta'],
                            derivative: ['Derivative', 2, '\\diffd'],
                            dv: ['Derivative', 2, '\\diffd'],
                            partialderivative: ['Derivative', 3, '\\partial'],
                            pderivative: ['Derivative', 3, '\\partial'],
                            pdv: ['Derivative', 3, '\\partial'],
                            functionalderivative: ['Derivative', 2, '\\delta'],
                            fderivative: ['Derivative', 2, '\\delta'],
                            fdv: ['Derivative', 2, '\\delta'],
                        },
                        o.default,
                    ),
                    new n.CommandMap(
                        'Physics-bra-ket-macros',
                        {
                            bra: 'Bra',
                            ket: 'Ket',
                            innerproduct: 'BraKet',
                            ip: 'BraKet',
                            braket: 'BraKet',
                            outerproduct: 'KetBra',
                            dyad: 'KetBra',
                            ketbra: 'KetBra',
                            op: 'KetBra',
                            expectationvalue: 'Expectation',
                            expval: 'Expectation',
                            ev: 'Expectation',
                            matrixelement: 'MatrixElement',
                            matrixel: 'MatrixElement',
                            mel: 'MatrixElement',
                        },
                        o.default,
                    ),
                    new n.CommandMap(
                        'Physics-matrix-macros',
                        {
                            matrixquantity: 'MatrixQuantity',
                            mqty: 'MatrixQuantity',
                            pmqty: ['Macro', '\\mqty(#1)', 1],
                            Pmqty: ['Macro', '\\mqty*(#1)', 1],
                            bmqty: ['Macro', '\\mqty[#1]', 1],
                            vmqty: ['Macro', '\\mqty|#1|', 1],
                            smallmatrixquantity: ['MatrixQuantity', !0],
                            smqty: ['MatrixQuantity', !0],
                            spmqty: ['Macro', '\\smqty(#1)', 1],
                            sPmqty: ['Macro', '\\smqty*(#1)', 1],
                            sbmqty: ['Macro', '\\smqty[#1]', 1],
                            svmqty: ['Macro', '\\smqty|#1|', 1],
                            matrixdeterminant: ['Macro', '\\vmqty{#1}', 1],
                            mdet: ['Macro', '\\vmqty{#1}', 1],
                            smdet: ['Macro', '\\svmqty{#1}', 1],
                            identitymatrix: 'IdentityMatrix',
                            imat: 'IdentityMatrix',
                            xmatrix: 'XMatrix',
                            xmat: 'XMatrix',
                            zeromatrix: ['Macro', '\\xmat{0}{#1}{#2}', 2],
                            zmat: ['Macro', '\\xmat{0}{#1}{#2}', 2],
                            paulimatrix: 'PauliMatrix',
                            pmat: 'PauliMatrix',
                            diagonalmatrix: 'DiagonalMatrix',
                            dmat: 'DiagonalMatrix',
                            antidiagonalmatrix: ['DiagonalMatrix', !0],
                            admat: ['DiagonalMatrix', !0],
                        },
                        o.default,
                    ),
                    new n.EnvironmentMap(
                        'Physics-aux-envs',
                        c.default.environment,
                        {
                            smallmatrix: [
                                'Array',
                                null,
                                null,
                                null,
                                'c',
                                '0.333em',
                                '.2em',
                                'S',
                                1,
                            ],
                        },
                        o.default,
                    ),
                    new n.MacroMap(
                        'Physics-characters',
                        { '|': ['AutoClose', s.TEXCLASS.ORD], ')': 'AutoClose', ']': 'AutoClose' },
                        o.default,
                    );
            },
            458: function (t, e, a) {
                var r =
                        (this && this.__read) ||
                        function (t, e) {
                            var a = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!a) return t;
                            var r,
                                n,
                                o = a.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(r = o.next()).done; )
                                    i.push(r.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    r && !r.done && (a = o.return) && a.call(o);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return i;
                        },
                    n =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var o = n(a(360)),
                    i = n(a(193)),
                    c = n(a(402)),
                    s = a(801),
                    l = n(a(398)),
                    u = n(a(748)),
                    m = a(348),
                    d = {},
                    f = { '(': ')', '[': ']', '{': '}', '|': '|' },
                    p = /^(b|B)i(g{1,2})$/;
                (d.Quantity = function (t, e, a, r, n, o, m) {
                    void 0 === a && (a = '('),
                        void 0 === r && (r = ')'),
                        void 0 === n && (n = !1),
                        void 0 === o && (o = ''),
                        void 0 === m && (m = '');
                    var d = !!n && t.GetStar(),
                        v = t.GetNext(),
                        h = t.i,
                        g = null;
                    if ('\\' === v) {
                        if ((t.i++, !(g = t.GetCS()).match(p))) {
                            var x = t.create('node', 'mrow');
                            return (
                                t.Push(l.default.fenced(t.configuration, a, x, r)), void (t.i = h)
                            );
                        }
                        v = t.GetNext();
                    }
                    var M = f[v];
                    if (n && '{' !== v)
                        throw new c.default(
                            'MissingArgFor',
                            'Missing argument for %1',
                            t.currentCS,
                        );
                    if (!M) {
                        x = t.create('node', 'mrow');
                        return t.Push(l.default.fenced(t.configuration, a, x, r)), void (t.i = h);
                    }
                    if (o) {
                        var y = t.create('token', 'mi', { texClass: s.TEXCLASS.OP }, o);
                        m && u.default.setAttribute(y, 'mathvariant', m),
                            t.Push(t.itemFactory.create('fn', y));
                    }
                    if ('{' === v) {
                        var b = t.GetArgument(e);
                        return (
                            (v = n ? a : '\\{'),
                            (M = n ? r : '\\}'),
                            (b = d
                                ? v + ' ' + b + ' ' + M
                                : g
                                  ? '\\' + g + 'l' + v + ' ' + b + ' \\' + g + 'r' + M
                                  : '\\left' + v + ' ' + b + ' \\right' + M),
                            void t.Push(new i.default(b, t.stack.env, t.configuration).mml())
                        );
                    }
                    n && ((v = a), (M = r)),
                        t.i++,
                        t.Push(
                            t.itemFactory
                                .create('auto open')
                                .setProperties({ open: v, close: M, big: g }),
                        );
                }),
                    (d.Eval = function (t, e) {
                        var a = t.GetStar(),
                            r = t.GetNext();
                        if ('{' !== r) {
                            if ('(' === r || '[' === r)
                                return (
                                    t.i++,
                                    void t.Push(
                                        t.itemFactory.create('auto open').setProperties({
                                            open: r,
                                            close: '|',
                                            smash: a,
                                            right: '\\vphantom{\\int}',
                                        }),
                                    )
                                );
                            throw new c.default(
                                'MissingArgFor',
                                'Missing argument for %1',
                                t.currentCS,
                            );
                        }
                        var n = t.GetArgument(e),
                            o =
                                '\\left. ' +
                                (a ? '\\smash{' + n + '}' : n) +
                                ' \\vphantom{\\int}\\right|';
                        t.string = t.string.slice(0, t.i) + o + t.string.slice(t.i);
                    }),
                    (d.Commutator = function (t, e, a, r) {
                        void 0 === a && (a = '['), void 0 === r && (r = ']');
                        var n = t.GetStar(),
                            o = t.GetNext(),
                            s = null;
                        if ('\\' === o) {
                            if ((t.i++, !(s = t.GetCS()).match(p)))
                                throw new c.default(
                                    'MissingArgFor',
                                    'Missing argument for %1',
                                    t.currentCS,
                                );
                            o = t.GetNext();
                        }
                        if ('{' !== o)
                            throw new c.default(
                                'MissingArgFor',
                                'Missing argument for %1',
                                t.currentCS,
                            );
                        var l = t.GetArgument(e) + ',' + t.GetArgument(e);
                        (l = n
                            ? a + ' ' + l + ' ' + r
                            : s
                              ? '\\' + s + 'l' + a + ' ' + l + ' \\' + s + 'r' + r
                              : '\\left' + a + ' ' + l + ' \\right' + r),
                            t.Push(new i.default(l, t.stack.env, t.configuration).mml());
                    });
                var v = [65, 90],
                    h = [97, 122],
                    g = [913, 937],
                    x = [945, 969],
                    M = [48, 57];
                function y(t, e) {
                    return t >= e[0] && t <= e[1];
                }
                function b(t, e, a, r) {
                    var n = t.configuration.parser,
                        o = m.NodeFactory.createToken(t, e, a, r),
                        i = r.codePointAt(0);
                    return (
                        1 === r.length &&
                            !n.stack.env.font &&
                            n.stack.env.vectorFont &&
                            (y(i, v) ||
                                y(i, h) ||
                                y(i, g) ||
                                y(i, M) ||
                                (y(i, x) && n.stack.env.vectorStar) ||
                                u.default.getAttribute(o, 'accent')) &&
                            u.default.setAttribute(o, 'mathvariant', n.stack.env.vectorFont),
                        o
                    );
                }
                (d.VectorBold = function (t, e) {
                    var a = t.GetStar(),
                        r = t.GetArgument(e),
                        n = t.configuration.nodeFactory.get('token'),
                        o = t.stack.env.font;
                    delete t.stack.env.font,
                        t.configuration.nodeFactory.set('token', b),
                        (t.stack.env.vectorFont = a ? 'bold-italic' : 'bold'),
                        (t.stack.env.vectorStar = a);
                    var c = new i.default(r, t.stack.env, t.configuration).mml();
                    o && (t.stack.env.font = o),
                        delete t.stack.env.vectorFont,
                        delete t.stack.env.vectorStar,
                        t.configuration.nodeFactory.set('token', n),
                        t.Push(c);
                }),
                    (d.StarMacro = function (t, e, a) {
                        for (var r = [], n = 3; n < arguments.length; n++) r[n - 3] = arguments[n];
                        var o = t.GetStar(),
                            i = [];
                        if (a) for (var c = i.length; c < a; c++) i.push(t.GetArgument(e));
                        var s = r.join(o ? '*' : '');
                        (s = l.default.substituteArgs(t, i, s)),
                            (t.string = l.default.addArgs(t, s, t.string.slice(t.i))),
                            (t.i = 0),
                            l.default.checkMaxMacros(t);
                    });
                var P = function (t, e, a, r, n) {
                    var o = new i.default(r, t.stack.env, t.configuration).mml();
                    t.Push(t.itemFactory.create(e, o));
                    var c = t.GetNext(),
                        s = f[c];
                    if (s) {
                        var l = -1 !== n.indexOf(c);
                        if ('{' === c) {
                            var u =
                                (l ? '\\left\\{' : '') +
                                ' ' +
                                t.GetArgument(a) +
                                ' ' +
                                (l ? '\\right\\}' : '');
                            return (t.string = u + t.string.slice(t.i)), void (t.i = 0);
                        }
                        l &&
                            (t.i++,
                            t.Push(
                                t.itemFactory
                                    .create('auto open')
                                    .setProperties({ open: c, close: s }),
                            ));
                    }
                };
                function A(t, e, a) {
                    var n = r(t, 3),
                        o = n[0],
                        i = n[1],
                        c = n[2];
                    return e && a
                        ? '\\left\\langle{'
                              .concat(o, '}\\middle\\vert{')
                              .concat(i, '}\\middle\\vert{')
                              .concat(c, '}\\right\\rangle')
                        : e
                          ? '\\langle{'
                                .concat(o, '}\\vert{')
                                .concat(i, '}\\vert{')
                                .concat(c, '}\\rangle')
                          : '\\left\\langle{'
                                .concat(o, '}\\right\\vert{')
                                .concat(i, '}\\left\\vert{')
                                .concat(c, '}\\right\\rangle');
                }
                (d.OperatorApplication = function (t, e, a) {
                    for (var r = [], n = 3; n < arguments.length; n++) r[n - 3] = arguments[n];
                    P(t, 'fn', e, a, r);
                }),
                    (d.VectorOperator = function (t, e, a) {
                        for (var r = [], n = 3; n < arguments.length; n++) r[n - 3] = arguments[n];
                        P(t, 'mml', e, a, r);
                    }),
                    (d.Expression = function (t, e, a, r) {
                        void 0 === a && (a = !0), void 0 === r && (r = ''), (r = r || e.slice(1));
                        var n = a ? t.GetBrackets(e) : null,
                            o = t.create('token', 'mi', { texClass: s.TEXCLASS.OP }, r);
                        if (n) {
                            var c = new i.default(n, t.stack.env, t.configuration).mml();
                            o = t.create('node', 'msup', [o, c]);
                        }
                        t.Push(t.itemFactory.create('fn', o)),
                            '(' === t.GetNext() &&
                                (t.i++,
                                t.Push(
                                    t.itemFactory
                                        .create('auto open')
                                        .setProperties({ open: '(', close: ')' }),
                                ));
                    }),
                    (d.Qqtext = function (t, e, a) {
                        var r =
                            (t.GetStar() ? '' : '\\quad') +
                            '\\text{' +
                            (a || t.GetArgument(e)) +
                            '}\\quad ';
                        t.string = t.string.slice(0, t.i) + r + t.string.slice(t.i);
                    }),
                    (d.Differential = function (t, e, a) {
                        var r = t.GetBrackets(e),
                            n = null != r ? '^{' + r + '}' : ' ',
                            o = '(' === t.GetNext(),
                            c = '{' === t.GetNext(),
                            l = a + n;
                        if (o || c)
                            if (c) {
                                l += t.GetArgument(e);
                                u = new i.default(l, t.stack.env, t.configuration).mml();
                                t.Push(
                                    t.create('node', 'TeXAtom', [u], { texClass: s.TEXCLASS.OP }),
                                );
                            } else
                                t.Push(new i.default(l, t.stack.env, t.configuration).mml()),
                                    t.i++,
                                    t.Push(
                                        t.itemFactory
                                            .create('auto open')
                                            .setProperties({ open: '(', close: ')' }),
                                    );
                        else {
                            l += t.GetArgument(e, !0) || '';
                            var u = new i.default(l, t.stack.env, t.configuration).mml();
                            t.Push(u);
                        }
                    }),
                    (d.Derivative = function (t, e, a, r) {
                        var n = t.GetStar(),
                            o = t.GetBrackets(e),
                            c = 1,
                            s = [];
                        for (s.push(t.GetArgument(e)); '{' === t.GetNext() && c < a; )
                            s.push(t.GetArgument(e)), c++;
                        var l = !1,
                            u = ' ',
                            m = ' ';
                        a > 2 && s.length > 2
                            ? ((u = '^{' + (s.length - 1) + '}'), (l = !0))
                            : null != o &&
                              (a > 2 && s.length > 1 && (l = !0), (m = u = '^{' + o + '}'));
                        for (
                            var d = n ? '\\flatfrac' : '\\frac',
                                f = s.length > 1 ? s[0] : '',
                                p = s.length > 1 ? s[1] : s[0],
                                v = '',
                                h = 2,
                                g = void 0;
                            (g = s[h]);
                            h++
                        )
                            v += r + ' ' + g;
                        var x = d + '{' + r + u + f + '}{' + r + ' ' + p + m + ' ' + v + '}';
                        t.Push(new i.default(x, t.stack.env, t.configuration).mml()),
                            '(' === t.GetNext() &&
                                (t.i++,
                                t.Push(
                                    t.itemFactory
                                        .create('auto open')
                                        .setProperties({ open: '(', close: ')', ignore: l }),
                                ));
                    }),
                    (d.Bra = function (t, e) {
                        var a = t.GetStar(),
                            r = t.GetArgument(e),
                            n = '',
                            o = !1,
                            c = !1;
                        if ('\\' === t.GetNext()) {
                            var s = t.i;
                            t.i++;
                            var l = t.GetCS(),
                                u = t.lookup('macro', l);
                            u && 'ket' === u.symbol
                                ? ((o = !0),
                                  (s = t.i),
                                  (c = t.GetStar()),
                                  '{' === t.GetNext()
                                      ? (n = t.GetArgument(l, !0))
                                      : ((t.i = s), (c = !1)))
                                : (t.i = s);
                        }
                        var m = '';
                        (m = o
                            ? a || c
                                ? '\\langle{'.concat(r, '}\\vert{').concat(n, '}\\rangle')
                                : '\\left\\langle{'
                                      .concat(r, '}\\middle\\vert{')
                                      .concat(n, '}\\right\\rangle')
                            : a || c
                              ? '\\langle{'.concat(r, '}\\vert')
                              : '\\left\\langle{'.concat(r, '}\\right\\vert{').concat(n, '}')),
                            t.Push(new i.default(m, t.stack.env, t.configuration).mml());
                    }),
                    (d.Ket = function (t, e) {
                        var a = t.GetStar(),
                            r = t.GetArgument(e),
                            n = a
                                ? '\\vert{'.concat(r, '}\\rangle')
                                : '\\left\\vert{'.concat(r, '}\\right\\rangle');
                        t.Push(new i.default(n, t.stack.env, t.configuration).mml());
                    }),
                    (d.BraKet = function (t, e) {
                        var a = t.GetStar(),
                            r = t.GetArgument(e),
                            n = null;
                        '{' === t.GetNext() && (n = t.GetArgument(e, !0));
                        var o = '';
                        (o =
                            null == n
                                ? a
                                    ? '\\langle{'.concat(r, '}\\vert{').concat(r, '}\\rangle')
                                    : '\\left\\langle{'
                                          .concat(r, '}\\middle\\vert{')
                                          .concat(r, '}\\right\\rangle')
                                : a
                                  ? '\\langle{'.concat(r, '}\\vert{').concat(n, '}\\rangle')
                                  : '\\left\\langle{'
                                        .concat(r, '}\\middle\\vert{')
                                        .concat(n, '}\\right\\rangle')),
                            t.Push(new i.default(o, t.stack.env, t.configuration).mml());
                    }),
                    (d.KetBra = function (t, e) {
                        var a = t.GetStar(),
                            r = t.GetArgument(e),
                            n = null;
                        '{' === t.GetNext() && (n = t.GetArgument(e, !0));
                        var o = '';
                        (o =
                            null == n
                                ? a
                                    ? '\\vert{'
                                          .concat(r, '}\\rangle\\!\\langle{')
                                          .concat(r, '}\\vert')
                                    : '\\left\\vert{'
                                          .concat(r, '}\\middle\\rangle\\!\\middle\\langle{')
                                          .concat(r, '}\\right\\vert')
                                : a
                                  ? '\\vert{'
                                        .concat(r, '}\\rangle\\!\\langle{')
                                        .concat(n, '}\\vert')
                                  : '\\left\\vert{'
                                        .concat(r, '}\\middle\\rangle\\!\\middle\\langle{')
                                        .concat(n, '}\\right\\vert')),
                            t.Push(new i.default(o, t.stack.env, t.configuration).mml());
                    }),
                    (d.Expectation = function (t, e) {
                        var a = t.GetStar(),
                            r = a && t.GetStar(),
                            n = t.GetArgument(e),
                            o = null;
                        '{' === t.GetNext() && (o = t.GetArgument(e, !0));
                        var c =
                            n && o
                                ? A([o, n, o], a, r)
                                : a
                                  ? '\\langle {'.concat(n, '} \\rangle')
                                  : '\\left\\langle {'.concat(n, '} \\right\\rangle');
                        t.Push(new i.default(c, t.stack.env, t.configuration).mml());
                    }),
                    (d.MatrixElement = function (t, e) {
                        var a = t.GetStar(),
                            r = a && t.GetStar(),
                            n = A([t.GetArgument(e), t.GetArgument(e), t.GetArgument(e)], a, r);
                        t.Push(new i.default(n, t.stack.env, t.configuration).mml());
                    }),
                    (d.MatrixQuantity = function (t, e, a) {
                        var r = t.GetStar(),
                            n = a ? 'smallmatrix' : 'array',
                            o = '',
                            c = '',
                            s = '';
                        switch (t.GetNext()) {
                            case '{':
                                o = t.GetArgument(e);
                                break;
                            case '(':
                                t.i++,
                                    (c = r ? '\\lgroup' : '('),
                                    (s = r ? '\\rgroup' : ')'),
                                    (o = t.GetUpTo(e, ')'));
                                break;
                            case '[':
                                t.i++, (c = '['), (s = ']'), (o = t.GetUpTo(e, ']'));
                                break;
                            case '|':
                                t.i++, (c = '|'), (s = '|'), (o = t.GetUpTo(e, '|'));
                                break;
                            default:
                                (c = '('), (s = ')');
                        }
                        var l =
                            (c ? '\\left' : '') +
                            c +
                            '\\begin{' +
                            n +
                            '}{} ' +
                            o +
                            '\\end{' +
                            n +
                            '}' +
                            (c ? '\\right' : '') +
                            s;
                        t.Push(new i.default(l, t.stack.env, t.configuration).mml());
                    }),
                    (d.IdentityMatrix = function (t, e) {
                        var a = t.GetArgument(e),
                            r = parseInt(a, 10);
                        if (isNaN(r)) throw new c.default('InvalidNumber', 'Invalid number');
                        if (r <= 1) return (t.string = '1' + t.string.slice(t.i)), void (t.i = 0);
                        for (var n = Array(r).fill('0'), o = [], i = 0; i < r; i++) {
                            var s = n.slice();
                            (s[i] = '1'), o.push(s.join(' & '));
                        }
                        (t.string = o.join('\\\\ ') + t.string.slice(t.i)), (t.i = 0);
                    }),
                    (d.XMatrix = function (t, e) {
                        var a = t.GetStar(),
                            r = t.GetArgument(e),
                            n = t.GetArgument(e),
                            o = t.GetArgument(e),
                            i = parseInt(n, 10),
                            s = parseInt(o, 10);
                        if (isNaN(i) || isNaN(s) || s.toString() !== o || i.toString() !== n)
                            throw new c.default('InvalidNumber', 'Invalid number');
                        if (((i = i < 1 ? 1 : i), (s = s < 1 ? 1 : s), !a)) {
                            var l = Array(s).fill(r).join(' & '),
                                u = Array(i).fill(l).join('\\\\ ');
                            return (t.string = u + t.string.slice(t.i)), void (t.i = 0);
                        }
                        var m = '';
                        if (1 === i && 1 === s) m = r;
                        else if (1 === i) {
                            l = [];
                            for (var d = 1; d <= s; d++) l.push(''.concat(r, '_{').concat(d, '}'));
                            m = l.join(' & ');
                        } else if (1 === s) {
                            for (l = [], d = 1; d <= i; d++)
                                l.push(''.concat(r, '_{').concat(d, '}'));
                            m = l.join('\\\\ ');
                        } else {
                            var f = [];
                            for (d = 1; d <= i; d++) {
                                l = [];
                                for (var p = 1; p <= s; p++)
                                    l.push(''.concat(r, '_{{').concat(d, '}{').concat(p, '}}'));
                                f.push(l.join(' & '));
                            }
                            m = f.join('\\\\ ');
                        }
                        (t.string = m + t.string.slice(t.i)), (t.i = 0);
                    }),
                    (d.PauliMatrix = function (t, e) {
                        var a = t.GetArgument(e),
                            r = a.slice(1);
                        switch (a[0]) {
                            case '0':
                                r += ' 1 & 0\\\\ 0 & 1';
                                break;
                            case '1':
                            case 'x':
                                r += ' 0 & 1\\\\ 1 & 0';
                                break;
                            case '2':
                            case 'y':
                                r += ' 0 & -i\\\\ i & 0';
                                break;
                            case '3':
                            case 'z':
                                r += ' 1 & 0\\\\ 0 & -1';
                        }
                        (t.string = r + t.string.slice(t.i)), (t.i = 0);
                    }),
                    (d.DiagonalMatrix = function (t, e, a) {
                        if ('{' === t.GetNext()) {
                            var r = t.i;
                            t.GetArgument(e);
                            var n = t.i;
                            t.i = r + 1;
                            for (var o = [], i = '', c = t.i; c < n; ) {
                                try {
                                    i = t.GetUpTo(e, ',');
                                } catch (e) {
                                    (t.i = n), o.push(t.string.slice(c, n - 1));
                                    break;
                                }
                                if (t.i >= n) {
                                    o.push(t.string.slice(c, n));
                                    break;
                                }
                                (c = t.i), o.push(i);
                            }
                            (t.string =
                                (function (t, e) {
                                    for (var a = t.length, r = [], n = 0; n < a; n++)
                                        r.push(
                                            Array(e ? a - n : n + 1).join('&') +
                                                '\\mqty{' +
                                                t[n] +
                                                '}',
                                        );
                                    return r.join('\\\\ ');
                                })(o, a) + t.string.slice(n)),
                                (t.i = 0);
                        }
                    }),
                    (d.AutoClose = function (t, e, a) {
                        var r = t.create('token', 'mo', { stretchy: !1 }, e),
                            n = t.itemFactory.create('mml', r).setProperties({ autoclose: e });
                        t.Push(n);
                    }),
                    (d.Vnabla = function (t, e) {
                        var a = t.options.physics.arrowdel
                            ? '\\vec{\\gradientnabla}'
                            : '{\\gradientnabla}';
                        return t.Push(new i.default(a, t.stack.env, t.configuration).mml());
                    }),
                    (d.DiffD = function (t, e) {
                        var a = t.options.physics.italicdiff ? 'd' : '{\\rm d}';
                        return t.Push(new i.default(a, t.stack.env, t.configuration).mml());
                    }),
                    (d.Macro = o.default.Macro),
                    (d.NamedFn = o.default.NamedFn),
                    (d.Array = o.default.Array),
                    (e.default = d);
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
            348: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.NodeFactory = MathJax._.input.tex.NodeFactory.NodeFactory);
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
            360: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.base.BaseMethods.default);
            },
        },
        i = {};
    function c(t) {
        var e = i[t];
        if (void 0 !== e) return e.exports;
        var a = (i[t] = { exports: {} });
        return o[t].call(a.exports, a, a.exports, c), a.exports;
    }
    (t = c(955)),
        (e = c(667)),
        (a = c(996)),
        (r = c(855)),
        (n = c(458)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/physics', e.q, 'tex-extension'),
        (0, t.r8)({
            _: {
                input: {
                    tex: {
                        physics: { PhysicsConfiguration: a, PhysicsItems: r, PhysicsMethods: n },
                    },
                },
            },
        });
})();
