!(function () {
    'use strict';
    var t,
        e,
        a,
        r,
        n,
        i = {
            667: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            577: function (t, e, a) {
                var r,
                    n,
                    i =
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
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AmsConfiguration = e.AmsTags = void 0);
                var l = a(251),
                    o = a(971),
                    s = a(680),
                    u = a(16);
                a(829);
                var m = a(871),
                    d = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return i(e, t), e;
                    })(s.AbstractTags);
                e.AmsTags = d;
                e.AmsConfiguration = l.Configuration.create('ams', {
                    handler: {
                        character: ['AMSmath-operatorLetter'],
                        delimiter: ['AMSsymbols-delimiter', 'AMSmath-delimiter'],
                        macro: [
                            'AMSsymbols-mathchar0mi',
                            'AMSsymbols-mathchar0mo',
                            'AMSsymbols-delimiter',
                            'AMSsymbols-macros',
                            'AMSmath-mathchar0mo',
                            'AMSmath-macros',
                            'AMSmath-delimiter',
                        ],
                        environment: ['AMSmath-environment'],
                    },
                    items:
                        ((n = {}),
                        (n[o.MultlineItem.prototype.kind] = o.MultlineItem),
                        (n[o.FlalignItem.prototype.kind] = o.FlalignItem),
                        n),
                    tags: { ams: d },
                    init: function (t) {
                        new m.CommandMap(u.NEW_OPS, {}, {}),
                            t.append(
                                l.Configuration.local({
                                    handler: { macro: [u.NEW_OPS] },
                                    priority: -1,
                                }),
                            );
                    },
                    config: function (t, e) {
                        e.parseOptions.options.multlineWidth &&
                            (e.parseOptions.options.ams.multlineWidth =
                                e.parseOptions.options.multlineWidth),
                            delete e.parseOptions.options.multlineWidth;
                    },
                    options: {
                        multlineWidth: '',
                        ams: { multlineWidth: '100%', multlineIndent: '1em' },
                    },
                });
            },
            971: function (t, e, a) {
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
                    i =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (i =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, a = 1, r = arguments.length; a < r; a++)
                                            for (var n in (e = arguments[a]))
                                                Object.prototype.hasOwnProperty.call(e, n) &&
                                                    (t[n] = e[n]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        },
                    l =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.FlalignItem = e.MultlineItem = void 0);
                var o = a(935),
                    s = l(a(398)),
                    u = l(a(748)),
                    m = l(a(402)),
                    d = a(108),
                    c = (function (t) {
                        function e(e) {
                            for (var a = [], r = 1; r < arguments.length; r++)
                                a[r - 1] = arguments[r];
                            var n = t.call(this, e) || this;
                            return n.factory.configuration.tags.start('multline', !0, a[0]), n;
                        }
                        return (
                            n(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'multline';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.EndEntry = function () {
                                this.table.length &&
                                    s.default.fixInitialMO(this.factory.configuration, this.nodes);
                                var t = this.getProperty('shove'),
                                    e = this.create(
                                        'node',
                                        'mtd',
                                        this.nodes,
                                        t ? { columnalign: t } : {},
                                    );
                                this.setProperty('shove', null), this.row.push(e), this.Clear();
                            }),
                            (e.prototype.EndRow = function () {
                                if (1 !== this.row.length)
                                    throw new m.default(
                                        'MultlineRowsOneCol',
                                        'The rows within the %1 environment must have exactly one column',
                                        'multline',
                                    );
                                var t = this.create('node', 'mtr', this.row);
                                this.table.push(t), (this.row = []);
                            }),
                            (e.prototype.EndTable = function () {
                                if ((t.prototype.EndTable.call(this), this.table.length)) {
                                    var e = this.table.length - 1,
                                        a = -1;
                                    u.default.getAttribute(
                                        u.default.getChildren(this.table[0])[0],
                                        'columnalign',
                                    ) ||
                                        u.default.setAttribute(
                                            u.default.getChildren(this.table[0])[0],
                                            'columnalign',
                                            d.TexConstant.Align.LEFT,
                                        ),
                                        u.default.getAttribute(
                                            u.default.getChildren(this.table[e])[0],
                                            'columnalign',
                                        ) ||
                                            u.default.setAttribute(
                                                u.default.getChildren(this.table[e])[0],
                                                'columnalign',
                                                d.TexConstant.Align.RIGHT,
                                            );
                                    var r = this.factory.configuration.tags.getTag();
                                    if (r) {
                                        a =
                                            this.arraydef.side === d.TexConstant.Align.LEFT
                                                ? 0
                                                : this.table.length - 1;
                                        var n = this.table[a],
                                            i = this.create(
                                                'node',
                                                'mlabeledtr',
                                                [r].concat(u.default.getChildren(n)),
                                            );
                                        u.default.copyAttributes(n, i), (this.table[a] = i);
                                    }
                                }
                                this.factory.configuration.tags.end();
                            }),
                            e
                        );
                    })(o.ArrayItem);
                e.MultlineItem = c;
                var h = (function (t) {
                    function e(e, a, r, n, i) {
                        var l = t.call(this, e) || this;
                        return (
                            (l.name = a),
                            (l.numbered = r),
                            (l.padded = n),
                            (l.center = i),
                            l.factory.configuration.tags.start(a, r, r),
                            l
                        );
                    }
                    return (
                        n(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'flalign';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.EndEntry = function () {
                            t.prototype.EndEntry.call(this);
                            var e = this.getProperty('xalignat');
                            if (e && this.row.length > e)
                                throw new m.default(
                                    'XalignOverflow',
                                    'Extra %1 in row of %2',
                                    '&',
                                    this.name,
                                );
                        }),
                        (e.prototype.EndRow = function () {
                            for (
                                var e, a = this.row, r = this.getProperty('xalignat');
                                a.length < r;

                            )
                                a.push(this.create('node', 'mtd'));
                            for (
                                this.row = [],
                                    this.padded && this.row.push(this.create('node', 'mtd'));
                                (e = a.shift());

                            )
                                this.row.push(e),
                                    (e = a.shift()) && this.row.push(e),
                                    (a.length || this.padded) &&
                                        this.row.push(this.create('node', 'mtd'));
                            this.row.length > this.maxrow && (this.maxrow = this.row.length),
                                t.prototype.EndRow.call(this);
                            var n = this.table[this.table.length - 1];
                            if (this.getProperty('zeroWidthLabel') && n.isKind('mlabeledtr')) {
                                var l = u.default.getChildren(n)[0],
                                    o = this.factory.configuration.options.tagSide,
                                    s = i({ width: 0 }, 'right' === o ? { lspace: '-1width' } : {}),
                                    m = this.create('node', 'mpadded', u.default.getChildren(l), s);
                                l.setChildren([m]);
                            }
                        }),
                        (e.prototype.EndTable = function () {
                            (t.prototype.EndTable.call(this), this.center) &&
                                this.maxrow <= 2 &&
                                (delete this.arraydef.width, delete this.global.indentalign);
                        }),
                        e
                    );
                })(o.EqnArrayItem);
                e.FlalignItem = h;
            },
            829: function (t, e, a) {
                var r =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, a, r) {
                                  void 0 === r && (r = a);
                                  var n = Object.getOwnPropertyDescriptor(e, a);
                                  (n &&
                                      !('get' in n
                                          ? !e.__esModule
                                          : n.writable || n.configurable)) ||
                                      (n = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[a];
                                          },
                                      }),
                                      Object.defineProperty(t, r, n);
                              }
                            : function (t, e, a, r) {
                                  void 0 === r && (r = a), (t[r] = e[a]);
                              }),
                    n =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (t, e) {
                                  Object.defineProperty(t, 'default', { enumerable: !0, value: e });
                              }
                            : function (t, e) {
                                  t.default = e;
                              }),
                    i =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var a in t)
                                    'default' !== a &&
                                        Object.prototype.hasOwnProperty.call(t, a) &&
                                        r(e, t, a);
                            return n(e, t), e;
                        },
                    l =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var o = a(16),
                    s = i(a(871)),
                    u = a(108),
                    m = l(a(945)),
                    d = l(a(398)),
                    c = a(801),
                    h = a(230);
                new s.CharacterMap('AMSmath-mathchar0mo', m.default.mathchar0mo, {
                    iiiint: ['\u2a0c', { texClass: c.TEXCLASS.OP }],
                }),
                    new s.RegExpMap('AMSmath-operatorLetter', o.AmsMethods.operatorLetter, /[-*]/i),
                    new s.CommandMap(
                        'AMSmath-macros',
                        {
                            mathring: ['Accent', '02DA'],
                            nobreakspace: 'Tilde',
                            negmedspace: ['Spacer', h.MATHSPACE.negativemediummathspace],
                            negthickspace: ['Spacer', h.MATHSPACE.negativethickmathspace],
                            idotsint: ['MultiIntegral', '\\int\\cdots\\int'],
                            dddot: ['Accent', '20DB'],
                            ddddot: ['Accent', '20DC'],
                            sideset: 'SideSet',
                            boxed: ['Macro', '\\fbox{$\\displaystyle{#1}$}', 1],
                            tag: 'HandleTag',
                            notag: 'HandleNoTag',
                            eqref: ['HandleRef', !0],
                            substack: ['Macro', '\\begin{subarray}{c}#1\\end{subarray}', 1],
                            injlim: ['NamedOp', 'inj&thinsp;lim'],
                            projlim: ['NamedOp', 'proj&thinsp;lim'],
                            varliminf: ['Macro', '\\mathop{\\underline{\\mmlToken{mi}{lim}}}'],
                            varlimsup: ['Macro', '\\mathop{\\overline{\\mmlToken{mi}{lim}}}'],
                            varinjlim: [
                                'Macro',
                                '\\mathop{\\underrightarrow{\\mmlToken{mi}{lim}}}',
                            ],
                            varprojlim: [
                                'Macro',
                                '\\mathop{\\underleftarrow{\\mmlToken{mi}{lim}}}',
                            ],
                            DeclareMathOperator: 'HandleDeclareOp',
                            operatorname: 'HandleOperatorName',
                            genfrac: 'Genfrac',
                            frac: ['Genfrac', '', '', '', ''],
                            tfrac: ['Genfrac', '', '', '', '1'],
                            dfrac: ['Genfrac', '', '', '', '0'],
                            binom: ['Genfrac', '(', ')', '0', ''],
                            tbinom: ['Genfrac', '(', ')', '0', '1'],
                            dbinom: ['Genfrac', '(', ')', '0', '0'],
                            cfrac: 'CFrac',
                            shoveleft: ['HandleShove', u.TexConstant.Align.LEFT],
                            shoveright: ['HandleShove', u.TexConstant.Align.RIGHT],
                            xrightarrow: ['xArrow', 8594, 5, 10],
                            xleftarrow: ['xArrow', 8592, 10, 5],
                        },
                        o.AmsMethods,
                    ),
                    new s.EnvironmentMap(
                        'AMSmath-environment',
                        m.default.environment,
                        {
                            'equation*': ['Equation', null, !1],
                            'eqnarray*': [
                                'EqnArray',
                                null,
                                !1,
                                !0,
                                'rcl',
                                d.default.cols(0, h.MATHSPACE.thickmathspace),
                                '.5em',
                            ],
                            align: ['EqnArray', null, !0, !0, 'rl', d.default.cols(0, 2)],
                            'align*': ['EqnArray', null, !1, !0, 'rl', d.default.cols(0, 2)],
                            multline: ['Multline', null, !0],
                            'multline*': ['Multline', null, !1],
                            split: ['EqnArray', null, !1, !1, 'rl', d.default.cols(0)],
                            gather: ['EqnArray', null, !0, !0, 'c'],
                            'gather*': ['EqnArray', null, !1, !0, 'c'],
                            alignat: ['AlignAt', null, !0, !0],
                            'alignat*': ['AlignAt', null, !1, !0],
                            alignedat: ['AlignAt', null, !1, !1],
                            aligned: [
                                'AmsEqnArray',
                                null,
                                null,
                                null,
                                'rl',
                                d.default.cols(0, 2),
                                '.5em',
                                'D',
                            ],
                            gathered: ['AmsEqnArray', null, null, null, 'c', null, '.5em', 'D'],
                            xalignat: ['XalignAt', null, !0, !0],
                            'xalignat*': ['XalignAt', null, !1, !0],
                            xxalignat: ['XalignAt', null, !1, !1],
                            flalign: ['FlalignArray', null, !0, !1, !0, 'rlc', 'auto auto fit'],
                            'flalign*': ['FlalignArray', null, !1, !1, !0, 'rlc', 'auto auto fit'],
                            subarray: [
                                'Array',
                                null,
                                null,
                                null,
                                null,
                                d.default.cols(0),
                                '0.1em',
                                'S',
                                1,
                            ],
                            smallmatrix: [
                                'Array',
                                null,
                                null,
                                null,
                                'c',
                                d.default.cols(1 / 3),
                                '.2em',
                                'S',
                                1,
                            ],
                            matrix: ['Array', null, null, null, 'c'],
                            pmatrix: ['Array', null, '(', ')', 'c'],
                            bmatrix: ['Array', null, '[', ']', 'c'],
                            Bmatrix: ['Array', null, '\\{', '\\}', 'c'],
                            vmatrix: ['Array', null, '\\vert', '\\vert', 'c'],
                            Vmatrix: ['Array', null, '\\Vert', '\\Vert', 'c'],
                            cases: ['Array', null, '\\{', '.', 'll', null, '.2em', 'T'],
                        },
                        o.AmsMethods,
                    ),
                    new s.DelimiterMap('AMSmath-delimiter', m.default.delimiter, {
                        '\\lvert': ['|', { texClass: c.TEXCLASS.OPEN }],
                        '\\rvert': ['|', { texClass: c.TEXCLASS.CLOSE }],
                        '\\lVert': ['\u2016', { texClass: c.TEXCLASS.OPEN }],
                        '\\rVert': ['\u2016', { texClass: c.TEXCLASS.CLOSE }],
                    }),
                    new s.CharacterMap('AMSsymbols-mathchar0mi', m.default.mathchar0mi, {
                        digamma: '\u03dd',
                        varkappa: '\u03f0',
                        varGamma: ['\u0393', { mathvariant: u.TexConstant.Variant.ITALIC }],
                        varDelta: ['\u0394', { mathvariant: u.TexConstant.Variant.ITALIC }],
                        varTheta: ['\u0398', { mathvariant: u.TexConstant.Variant.ITALIC }],
                        varLambda: ['\u039b', { mathvariant: u.TexConstant.Variant.ITALIC }],
                        varXi: ['\u039e', { mathvariant: u.TexConstant.Variant.ITALIC }],
                        varPi: ['\u03a0', { mathvariant: u.TexConstant.Variant.ITALIC }],
                        varSigma: ['\u03a3', { mathvariant: u.TexConstant.Variant.ITALIC }],
                        varUpsilon: ['\u03a5', { mathvariant: u.TexConstant.Variant.ITALIC }],
                        varPhi: ['\u03a6', { mathvariant: u.TexConstant.Variant.ITALIC }],
                        varPsi: ['\u03a8', { mathvariant: u.TexConstant.Variant.ITALIC }],
                        varOmega: ['\u03a9', { mathvariant: u.TexConstant.Variant.ITALIC }],
                        beth: '\u2136',
                        gimel: '\u2137',
                        daleth: '\u2138',
                        backprime: ['\u2035', { variantForm: !0 }],
                        hslash: '\u210f',
                        varnothing: ['\u2205', { variantForm: !0 }],
                        blacktriangle: '\u25b4',
                        triangledown: ['\u25bd', { variantForm: !0 }],
                        blacktriangledown: '\u25be',
                        square: '\u25fb',
                        Box: '\u25fb',
                        blacksquare: '\u25fc',
                        lozenge: '\u25ca',
                        Diamond: '\u25ca',
                        blacklozenge: '\u29eb',
                        circledS: ['\u24c8', { mathvariant: u.TexConstant.Variant.NORMAL }],
                        bigstar: '\u2605',
                        sphericalangle: '\u2222',
                        measuredangle: '\u2221',
                        nexists: '\u2204',
                        complement: '\u2201',
                        mho: '\u2127',
                        eth: ['\xf0', { mathvariant: u.TexConstant.Variant.NORMAL }],
                        Finv: '\u2132',
                        diagup: '\u2571',
                        Game: '\u2141',
                        diagdown: '\u2572',
                        Bbbk: ['k', { mathvariant: u.TexConstant.Variant.DOUBLESTRUCK }],
                        yen: '\xa5',
                        circledR: '\xae',
                        checkmark: '\u2713',
                        maltese: '\u2720',
                    }),
                    new s.CharacterMap('AMSsymbols-mathchar0mo', m.default.mathchar0mo, {
                        dotplus: '\u2214',
                        ltimes: '\u22c9',
                        smallsetminus: ['\u2216', { variantForm: !0 }],
                        rtimes: '\u22ca',
                        Cap: '\u22d2',
                        doublecap: '\u22d2',
                        leftthreetimes: '\u22cb',
                        Cup: '\u22d3',
                        doublecup: '\u22d3',
                        rightthreetimes: '\u22cc',
                        barwedge: '\u22bc',
                        curlywedge: '\u22cf',
                        veebar: '\u22bb',
                        curlyvee: '\u22ce',
                        doublebarwedge: '\u2a5e',
                        boxminus: '\u229f',
                        circleddash: '\u229d',
                        boxtimes: '\u22a0',
                        circledast: '\u229b',
                        boxdot: '\u22a1',
                        circledcirc: '\u229a',
                        boxplus: '\u229e',
                        centerdot: ['\u22c5', { variantForm: !0 }],
                        divideontimes: '\u22c7',
                        intercal: '\u22ba',
                        leqq: '\u2266',
                        geqq: '\u2267',
                        leqslant: '\u2a7d',
                        geqslant: '\u2a7e',
                        eqslantless: '\u2a95',
                        eqslantgtr: '\u2a96',
                        lesssim: '\u2272',
                        gtrsim: '\u2273',
                        lessapprox: '\u2a85',
                        gtrapprox: '\u2a86',
                        approxeq: '\u224a',
                        lessdot: '\u22d6',
                        gtrdot: '\u22d7',
                        lll: '\u22d8',
                        llless: '\u22d8',
                        ggg: '\u22d9',
                        gggtr: '\u22d9',
                        lessgtr: '\u2276',
                        gtrless: '\u2277',
                        lesseqgtr: '\u22da',
                        gtreqless: '\u22db',
                        lesseqqgtr: '\u2a8b',
                        gtreqqless: '\u2a8c',
                        doteqdot: '\u2251',
                        Doteq: '\u2251',
                        eqcirc: '\u2256',
                        risingdotseq: '\u2253',
                        circeq: '\u2257',
                        fallingdotseq: '\u2252',
                        triangleq: '\u225c',
                        backsim: '\u223d',
                        thicksim: ['\u223c', { variantForm: !0 }],
                        backsimeq: '\u22cd',
                        thickapprox: ['\u2248', { variantForm: !0 }],
                        subseteqq: '\u2ac5',
                        supseteqq: '\u2ac6',
                        Subset: '\u22d0',
                        Supset: '\u22d1',
                        sqsubset: '\u228f',
                        sqsupset: '\u2290',
                        preccurlyeq: '\u227c',
                        succcurlyeq: '\u227d',
                        curlyeqprec: '\u22de',
                        curlyeqsucc: '\u22df',
                        precsim: '\u227e',
                        succsim: '\u227f',
                        precapprox: '\u2ab7',
                        succapprox: '\u2ab8',
                        vartriangleleft: '\u22b2',
                        lhd: '\u22b2',
                        vartriangleright: '\u22b3',
                        rhd: '\u22b3',
                        trianglelefteq: '\u22b4',
                        unlhd: '\u22b4',
                        trianglerighteq: '\u22b5',
                        unrhd: '\u22b5',
                        vDash: ['\u22a8', { variantForm: !0 }],
                        Vdash: '\u22a9',
                        Vvdash: '\u22aa',
                        smallsmile: ['\u2323', { variantForm: !0 }],
                        shortmid: ['\u2223', { variantForm: !0 }],
                        smallfrown: ['\u2322', { variantForm: !0 }],
                        shortparallel: ['\u2225', { variantForm: !0 }],
                        bumpeq: '\u224f',
                        between: '\u226c',
                        Bumpeq: '\u224e',
                        pitchfork: '\u22d4',
                        varpropto: ['\u221d', { variantForm: !0 }],
                        backepsilon: '\u220d',
                        blacktriangleleft: '\u25c2',
                        blacktriangleright: '\u25b8',
                        therefore: '\u2234',
                        because: '\u2235',
                        eqsim: '\u2242',
                        vartriangle: ['\u25b3', { variantForm: !0 }],
                        Join: '\u22c8',
                        nless: '\u226e',
                        ngtr: '\u226f',
                        nleq: '\u2270',
                        ngeq: '\u2271',
                        nleqslant: ['\u2a87', { variantForm: !0 }],
                        ngeqslant: ['\u2a88', { variantForm: !0 }],
                        nleqq: ['\u2270', { variantForm: !0 }],
                        ngeqq: ['\u2271', { variantForm: !0 }],
                        lneq: '\u2a87',
                        gneq: '\u2a88',
                        lneqq: '\u2268',
                        gneqq: '\u2269',
                        lvertneqq: ['\u2268', { variantForm: !0 }],
                        gvertneqq: ['\u2269', { variantForm: !0 }],
                        lnsim: '\u22e6',
                        gnsim: '\u22e7',
                        lnapprox: '\u2a89',
                        gnapprox: '\u2a8a',
                        nprec: '\u2280',
                        nsucc: '\u2281',
                        npreceq: ['\u22e0', { variantForm: !0 }],
                        nsucceq: ['\u22e1', { variantForm: !0 }],
                        precneqq: '\u2ab5',
                        succneqq: '\u2ab6',
                        precnsim: '\u22e8',
                        succnsim: '\u22e9',
                        precnapprox: '\u2ab9',
                        succnapprox: '\u2aba',
                        nsim: '\u2241',
                        ncong: '\u2247',
                        nshortmid: ['\u2224', { variantForm: !0 }],
                        nshortparallel: ['\u2226', { variantForm: !0 }],
                        nmid: '\u2224',
                        nparallel: '\u2226',
                        nvdash: '\u22ac',
                        nvDash: '\u22ad',
                        nVdash: '\u22ae',
                        nVDash: '\u22af',
                        ntriangleleft: '\u22ea',
                        ntriangleright: '\u22eb',
                        ntrianglelefteq: '\u22ec',
                        ntrianglerighteq: '\u22ed',
                        nsubseteq: '\u2288',
                        nsupseteq: '\u2289',
                        nsubseteqq: ['\u2288', { variantForm: !0 }],
                        nsupseteqq: ['\u2289', { variantForm: !0 }],
                        subsetneq: '\u228a',
                        supsetneq: '\u228b',
                        varsubsetneq: ['\u228a', { variantForm: !0 }],
                        varsupsetneq: ['\u228b', { variantForm: !0 }],
                        subsetneqq: '\u2acb',
                        supsetneqq: '\u2acc',
                        varsubsetneqq: ['\u2acb', { variantForm: !0 }],
                        varsupsetneqq: ['\u2acc', { variantForm: !0 }],
                        leftleftarrows: '\u21c7',
                        rightrightarrows: '\u21c9',
                        leftrightarrows: '\u21c6',
                        rightleftarrows: '\u21c4',
                        Lleftarrow: '\u21da',
                        Rrightarrow: '\u21db',
                        twoheadleftarrow: '\u219e',
                        twoheadrightarrow: '\u21a0',
                        leftarrowtail: '\u21a2',
                        rightarrowtail: '\u21a3',
                        looparrowleft: '\u21ab',
                        looparrowright: '\u21ac',
                        leftrightharpoons: '\u21cb',
                        rightleftharpoons: ['\u21cc', { variantForm: !0 }],
                        curvearrowleft: '\u21b6',
                        curvearrowright: '\u21b7',
                        circlearrowleft: '\u21ba',
                        circlearrowright: '\u21bb',
                        Lsh: '\u21b0',
                        Rsh: '\u21b1',
                        upuparrows: '\u21c8',
                        downdownarrows: '\u21ca',
                        upharpoonleft: '\u21bf',
                        upharpoonright: '\u21be',
                        downharpoonleft: '\u21c3',
                        restriction: '\u21be',
                        multimap: '\u22b8',
                        downharpoonright: '\u21c2',
                        leftrightsquigarrow: '\u21ad',
                        rightsquigarrow: '\u21dd',
                        leadsto: '\u21dd',
                        dashrightarrow: '\u21e2',
                        dashleftarrow: '\u21e0',
                        nleftarrow: '\u219a',
                        nrightarrow: '\u219b',
                        nLeftarrow: '\u21cd',
                        nRightarrow: '\u21cf',
                        nleftrightarrow: '\u21ae',
                        nLeftrightarrow: '\u21ce',
                    }),
                    new s.DelimiterMap('AMSsymbols-delimiter', m.default.delimiter, {
                        '\\ulcorner': '\u231c',
                        '\\urcorner': '\u231d',
                        '\\llcorner': '\u231e',
                        '\\lrcorner': '\u231f',
                    }),
                    new s.CommandMap(
                        'AMSsymbols-macros',
                        {
                            implies: ['Macro', '\\;\\Longrightarrow\\;'],
                            impliedby: ['Macro', '\\;\\Longleftarrow\\;'],
                        },
                        o.AmsMethods,
                    );
            },
            16: function (t, e, a) {
                var r =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (r =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, a = 1, r = arguments.length; a < r; a++)
                                            for (var n in (e = arguments[a]))
                                                Object.prototype.hasOwnProperty.call(e, n) &&
                                                    (t[n] = e[n]);
                                        return t;
                                    }),
                                r.apply(this, arguments)
                            );
                        },
                    n =
                        (this && this.__read) ||
                        function (t, e) {
                            var a = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!a) return t;
                            var r,
                                n,
                                i = a.call(t),
                                l = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(r = i.next()).done; )
                                    l.push(r.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    r && !r.done && (a = i.return) && a.call(i);
                                } finally {
                                    if (n) throw n.error;
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
                    (e.NEW_OPS = e.AmsMethods = void 0);
                var l = i(a(398)),
                    o = i(a(945)),
                    s = i(a(748)),
                    u = a(108),
                    m = i(a(193)),
                    d = i(a(402)),
                    c = a(924),
                    h = i(a(360)),
                    p = a(801);
                function f(t) {
                    if (!t || (t.isInferred && 0 === t.childNodes.length)) return [null, null];
                    if (t.isKind('msubsup') && g(t)) return [t, null];
                    var e = s.default.getChildAt(t, 0);
                    return t.isInferred && e && g(e)
                        ? (t.childNodes.splice(0, 1), [e, t])
                        : [null, t];
                }
                function g(t) {
                    var e = t.childNodes[0];
                    return e && e.isKind('mi') && '' === e.getText();
                }
                (e.AmsMethods = {}),
                    (e.AmsMethods.AmsEqnArray = function (t, e, a, r, n, i, o) {
                        var s = t.GetBrackets('\\begin{' + e.getName() + '}'),
                            u = h.default.EqnArray(t, e, a, r, n, i, o);
                        return l.default.setArrayAlign(u, s);
                    }),
                    (e.AmsMethods.AlignAt = function (t, a, r, n) {
                        var i,
                            o,
                            s = a.getName(),
                            u = '',
                            m = [];
                        if (
                            (n || (o = t.GetBrackets('\\begin{' + s + '}')),
                            (i = t.GetArgument('\\begin{' + s + '}')).match(/[^0-9]/))
                        )
                            throw new d.default(
                                'PositiveIntegerArg',
                                'Argument to %1 must me a positive integer',
                                '\\begin{' + s + '}',
                            );
                        for (var c = parseInt(i, 10); c > 0; ) (u += 'rl'), m.push('0em 0em'), c--;
                        var h = m.join(' ');
                        if (n) return e.AmsMethods.EqnArray(t, a, r, n, u, h);
                        var p = e.AmsMethods.EqnArray(t, a, r, n, u, h);
                        return l.default.setArrayAlign(p, o);
                    }),
                    (e.AmsMethods.Multline = function (t, e, a) {
                        t.Push(e), l.default.checkEqnEnv(t);
                        var r = t.itemFactory.create('multline', a, t.stack);
                        return (
                            (r.arraydef = {
                                displaystyle: !0,
                                rowspacing: '.5em',
                                columnspacing: '100%',
                                width: t.options.ams.multlineWidth,
                                side: t.options.tagSide,
                                minlabelspacing: t.options.tagIndent,
                                framespacing: t.options.ams.multlineIndent + ' 0',
                                frame: '',
                                'data-width-includes-label': !0,
                            }),
                            r
                        );
                    }),
                    (e.AmsMethods.XalignAt = function (t, a, r, n) {
                        var i = t.GetArgument('\\begin{' + a.getName() + '}');
                        if (i.match(/[^0-9]/))
                            throw new d.default(
                                'PositiveIntegerArg',
                                'Argument to %1 must me a positive integer',
                                '\\begin{' + a.getName() + '}',
                            );
                        var l = n ? 'crl' : 'rlc',
                            o = n ? 'fit auto auto' : 'auto auto fit',
                            s = e.AmsMethods.FlalignArray(t, a, r, n, !1, l, o, !0);
                        return s.setProperty('xalignat', 2 * parseInt(i)), s;
                    }),
                    (e.AmsMethods.FlalignArray = function (t, e, a, r, n, i, o, s) {
                        void 0 === s && (s = !1),
                            t.Push(e),
                            l.default.checkEqnEnv(t),
                            (i = i
                                .split('')
                                .join(' ')
                                .replace(/r/g, 'right')
                                .replace(/l/g, 'left')
                                .replace(/c/g, 'center'));
                        var u = t.itemFactory.create('flalign', e.getName(), a, r, n, t.stack);
                        return (
                            (u.arraydef = {
                                width: '100%',
                                displaystyle: !0,
                                columnalign: i,
                                columnspacing: '0em',
                                columnwidth: o,
                                rowspacing: '3pt',
                                side: t.options.tagSide,
                                minlabelspacing: s ? '0' : t.options.tagIndent,
                                'data-width-includes-label': !0,
                            }),
                            u.setProperty('zeroWidthLabel', s),
                            u
                        );
                    }),
                    (e.NEW_OPS = 'ams-declare-ops'),
                    (e.AmsMethods.HandleDeclareOp = function (t, a) {
                        var r = t.GetStar() ? '*' : '',
                            n = l.default.trimSpaces(t.GetArgument(a));
                        '\\' === n.charAt(0) && (n = n.substr(1));
                        var i = t.GetArgument(a);
                        t.configuration.handlers
                            .retrieve(e.NEW_OPS)
                            .add(
                                n,
                                new c.Macro(n, e.AmsMethods.Macro, [
                                    '\\operatorname'.concat(r, '{').concat(i, '}'),
                                ]),
                            );
                    }),
                    (e.AmsMethods.HandleOperatorName = function (t, e) {
                        var a = t.GetStar(),
                            n = l.default.trimSpaces(t.GetArgument(e)),
                            i = new m.default(
                                n,
                                r(r({}, t.stack.env), {
                                    font: u.TexConstant.Variant.NORMAL,
                                    multiLetterIdentifiers: /^[-*a-z]+/i,
                                    operatorLetters: !0,
                                }),
                                t.configuration,
                            ).mml();
                        if (
                            (i.isKind('mi') || (i = t.create('node', 'TeXAtom', [i])),
                            s.default.setProperties(i, {
                                movesupsub: a,
                                movablelimits: !0,
                                texClass: p.TEXCLASS.OP,
                            }),
                            !a)
                        ) {
                            var o = t.GetNext(),
                                d = t.i;
                            '\\' === o && ++t.i && 'limits' !== t.GetCS() && (t.i = d);
                        }
                        t.Push(i);
                    }),
                    (e.AmsMethods.SideSet = function (t, e) {
                        var a = n(f(t.ParseArg(e)), 2),
                            r = a[0],
                            i = a[1],
                            o = n(f(t.ParseArg(e)), 2),
                            u = o[0],
                            m = o[1],
                            d = t.ParseArg(e),
                            c = d;
                        r &&
                            (i
                                ? r.replaceChild(
                                      t.create('node', 'mphantom', [
                                          t.create('node', 'mpadded', [l.default.copyNode(d, t)], {
                                              width: 0,
                                          }),
                                      ]),
                                      s.default.getChildAt(r, 0),
                                  )
                                : ((c = t.create('node', 'mmultiscripts', [d])),
                                  u &&
                                      s.default.appendChildren(c, [
                                          s.default.getChildAt(u, 1) || t.create('node', 'none'),
                                          s.default.getChildAt(u, 2) || t.create('node', 'none'),
                                      ]),
                                  s.default.setProperty(c, 'scriptalign', 'left'),
                                  s.default.appendChildren(c, [
                                      t.create('node', 'mprescripts'),
                                      s.default.getChildAt(r, 1) || t.create('node', 'none'),
                                      s.default.getChildAt(r, 2) || t.create('node', 'none'),
                                  ]))),
                            u &&
                                c === d &&
                                (u.replaceChild(d, s.default.getChildAt(u, 0)), (c = u));
                        var h = t.create('node', 'TeXAtom', [], {
                            texClass: p.TEXCLASS.OP,
                            movesupsub: !0,
                            movablelimits: !0,
                        });
                        i && (r && h.appendChild(r), h.appendChild(i)),
                            h.appendChild(c),
                            m && h.appendChild(m),
                            t.Push(h);
                    }),
                    (e.AmsMethods.operatorLetter = function (t, e) {
                        return !!t.stack.env.operatorLetters && o.default.variable(t, e);
                    }),
                    (e.AmsMethods.MultiIntegral = function (t, e, a) {
                        var r = t.GetNext();
                        if ('\\' === r) {
                            var n = t.i;
                            (r = t.GetArgument(e)),
                                (t.i = n),
                                '\\limits' === r &&
                                    (a =
                                        '\\idotsint' === e
                                            ? '\\!\\!\\mathop{\\,\\,' + a + '}'
                                            : '\\!\\!\\!\\mathop{\\,\\,\\,' + a + '}');
                        }
                        (t.string = a + ' ' + t.string.slice(t.i)), (t.i = 0);
                    }),
                    (e.AmsMethods.xArrow = function (t, e, a, r, n) {
                        var i = {
                                width: '+' + l.default.Em((r + n) / 18),
                                lspace: l.default.Em(r / 18),
                            },
                            o = t.GetBrackets(e),
                            u = t.ParseArg(e),
                            d = t.create('node', 'mspace', [], { depth: '.25em' }),
                            c = t.create(
                                'token',
                                'mo',
                                { stretchy: !0, texClass: p.TEXCLASS.REL },
                                String.fromCodePoint(a),
                            );
                        c = t.create('node', 'mstyle', [c], { scriptlevel: 0 });
                        var h = t.create('node', 'munderover', [c]),
                            f = t.create('node', 'mpadded', [u, d], i);
                        if (
                            (s.default.setAttribute(f, 'voffset', '-.2em'),
                            s.default.setAttribute(f, 'height', '-.2em'),
                            s.default.setChild(h, h.over, f),
                            o)
                        ) {
                            var g = new m.default(o, t.stack.env, t.configuration).mml(),
                                M = t.create('node', 'mspace', [], { height: '.75em' });
                            (f = t.create('node', 'mpadded', [g, M], i)),
                                s.default.setAttribute(f, 'voffset', '.15em'),
                                s.default.setAttribute(f, 'depth', '-.15em'),
                                s.default.setChild(h, h.under, f);
                        }
                        s.default.setProperty(h, 'subsupOK', !0), t.Push(h);
                    }),
                    (e.AmsMethods.HandleShove = function (t, e, a) {
                        var r = t.stack.Top();
                        if ('multline' !== r.kind)
                            throw new d.default(
                                'CommandOnlyAllowedInEnv',
                                '%1 only allowed in %2 environment',
                                t.currentCS,
                                'multline',
                            );
                        if (r.Size())
                            throw new d.default(
                                'CommandAtTheBeginingOfLine',
                                '%1 must come at the beginning of the line',
                                t.currentCS,
                            );
                        r.setProperty('shove', a);
                    }),
                    (e.AmsMethods.CFrac = function (t, e) {
                        var a = l.default.trimSpaces(t.GetBrackets(e, '')),
                            r = t.GetArgument(e),
                            n = t.GetArgument(e),
                            i = {
                                l: u.TexConstant.Align.LEFT,
                                r: u.TexConstant.Align.RIGHT,
                                '': '',
                            },
                            o = new m.default(
                                '\\strut\\textstyle{' + r + '}',
                                t.stack.env,
                                t.configuration,
                            ).mml(),
                            c = new m.default(
                                '\\strut\\textstyle{' + n + '}',
                                t.stack.env,
                                t.configuration,
                            ).mml(),
                            h = t.create('node', 'mfrac', [o, c]);
                        if (null == (a = i[a]))
                            throw new d.default(
                                'IllegalAlign',
                                'Illegal alignment specified in %1',
                                t.currentCS,
                            );
                        a && s.default.setProperties(h, { numalign: a, denomalign: a }), t.Push(h);
                    }),
                    (e.AmsMethods.Genfrac = function (t, e, a, r, n, i) {
                        null == a && (a = t.GetDelimiterArg(e)),
                            null == r && (r = t.GetDelimiterArg(e)),
                            null == n && (n = t.GetArgument(e)),
                            null == i && (i = l.default.trimSpaces(t.GetArgument(e)));
                        var o = t.ParseArg(e),
                            u = t.ParseArg(e),
                            m = t.create('node', 'mfrac', [o, u]);
                        if (
                            ('' !== n && s.default.setAttribute(m, 'linethickness', n),
                            (a || r) &&
                                (s.default.setProperty(m, 'withDelims', !0),
                                (m = l.default.fixedFence(t.configuration, a, m, r))),
                            '' !== i)
                        ) {
                            var c = parseInt(i, 10),
                                h = ['D', 'T', 'S', 'SS'][c];
                            if (null == h)
                                throw new d.default(
                                    'BadMathStyleFor',
                                    'Bad math style for %1',
                                    t.currentCS,
                                );
                            (m = t.create('node', 'mstyle', [m])),
                                'D' === h
                                    ? s.default.setProperties(m, {
                                          displaystyle: !0,
                                          scriptlevel: 0,
                                      })
                                    : s.default.setProperties(m, {
                                          displaystyle: !1,
                                          scriptlevel: c - 1,
                                      });
                        }
                        t.Push(m);
                    }),
                    (e.AmsMethods.HandleTag = function (t, e) {
                        if (!t.tags.currentTag.taggable && t.tags.env)
                            throw new d.default(
                                'CommandNotAllowedInEnv',
                                '%1 not allowed in %2 environment',
                                t.currentCS,
                                t.tags.env,
                            );
                        if (t.tags.currentTag.tag)
                            throw new d.default('MultipleCommand', 'Multiple %1', t.currentCS);
                        var a = t.GetStar(),
                            r = l.default.trimSpaces(t.GetArgument(e));
                        t.tags.tag(r, a);
                    }),
                    (e.AmsMethods.HandleNoTag = h.default.HandleNoTag),
                    (e.AmsMethods.HandleRef = h.default.HandleRef),
                    (e.AmsMethods.Macro = h.default.Macro),
                    (e.AmsMethods.Accent = h.default.Accent),
                    (e.AmsMethods.Tilde = h.default.Tilde),
                    (e.AmsMethods.Array = h.default.Array),
                    (e.AmsMethods.Spacer = h.default.Spacer),
                    (e.AmsMethods.NamedOp = h.default.NamedOp),
                    (e.AmsMethods.EqnArray = h.default.EqnArray),
                    (e.AmsMethods.Equation = h.default.Equation);
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
        },
        l = {};
    function o(t) {
        var e = l[t];
        if (void 0 !== e) return e.exports;
        var a = (l[t] = { exports: {} });
        return i[t].call(a.exports, a, a.exports, o), a.exports;
    }
    (t = o(955)),
        (e = o(667)),
        (a = o(577)),
        (r = o(971)),
        (n = o(16)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/ams', e.q, 'tex-extension'),
        (0, t.r8)({
            _: { input: { tex: { ams: { AmsConfiguration: a, AmsItems: r, AmsMethods: n } } } },
        });
})();
