!(function () {
    'use strict';
    var t = {
            8667: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            7375: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AllPackages = void 0),
                    r(2379),
                    r(669),
                    r(2577),
                    r(6769),
                    r(2133),
                    r(2986),
                    r(8243),
                    r(6333),
                    r(5774),
                    r(7530),
                    r(2286),
                    r(2224),
                    r(7888),
                    r(4558),
                    r(6359),
                    r(2079),
                    r(4272),
                    r(3646),
                    r(2082),
                    r(1738),
                    r(205),
                    r(7078),
                    r(2048),
                    r(5634),
                    r(1999),
                    r(2996),
                    r(1596),
                    r(5941),
                    r(1845),
                    r(3762),
                    r(7927),
                    r(5376),
                    r(8768),
                    'undefined' != typeof MathJax &&
                        MathJax.loader &&
                        MathJax.loader.preLoad(
                            '[tex]/action',
                            '[tex]/ams',
                            '[tex]/amscd',
                            '[tex]/bbox',
                            '[tex]/boldsymbol',
                            '[tex]/braket',
                            '[tex]/bussproofs',
                            '[tex]/cancel',
                            '[tex]/cases',
                            '[tex]/centernot',
                            '[tex]/color',
                            '[tex]/colorv2',
                            '[tex]/colortbl',
                            '[tex]/empheq',
                            '[tex]/enclose',
                            '[tex]/extpfeil',
                            '[tex]/gensymb',
                            '[tex]/html',
                            '[tex]/mathtools',
                            '[tex]/mhchem',
                            '[tex]/newcommand',
                            '[tex]/noerrors',
                            '[tex]/noundefined',
                            '[tex]/physics',
                            '[tex]/upgreek',
                            '[tex]/unicode',
                            '[tex]/verb',
                            '[tex]/configmacros',
                            '[tex]/tagformat',
                            '[tex]/textcomp',
                            '[tex]/textmacros',
                            '[tex]/setoptions',
                        ),
                    (e.AllPackages = [
                        'base',
                        'action',
                        'ams',
                        'amscd',
                        'bbox',
                        'boldsymbol',
                        'braket',
                        'bussproofs',
                        'cancel',
                        'cases',
                        'centernot',
                        'color',
                        'colortbl',
                        'empheq',
                        'enclose',
                        'extpfeil',
                        'gensymb',
                        'html',
                        'mathtools',
                        'mhchem',
                        'newcommand',
                        'noerrors',
                        'noundefined',
                        'upgreek',
                        'unicode',
                        'verb',
                        'configmacros',
                        'tagformat',
                        'textcomp',
                        'textmacros',
                    ]);
            },
            669: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.ActionConfiguration = e.ActionMethods = void 0);
                var a = r(251),
                    o = n(r(2193)),
                    i = r(5871),
                    s = n(r(7360));
                (e.ActionMethods = {}),
                    (e.ActionMethods.Macro = s.default.Macro),
                    (e.ActionMethods.Toggle = function (t, e) {
                        for (var r, n = []; '\\endtoggle' !== (r = t.GetArgument(e)); )
                            n.push(new o.default(r, t.stack.env, t.configuration).mml());
                        t.Push(t.create('node', 'maction', n, { actiontype: 'toggle' }));
                    }),
                    (e.ActionMethods.Mathtip = function (t, e) {
                        var r = t.ParseArg(e),
                            n = t.ParseArg(e);
                        t.Push(t.create('node', 'maction', [r, n], { actiontype: 'tooltip' }));
                    }),
                    new i.CommandMap(
                        'action-macros',
                        {
                            toggle: 'Toggle',
                            mathtip: 'Mathtip',
                            texttip: ['Macro', '\\mathtip{#1}{\\text{#2}}', 2],
                        },
                        e.ActionMethods,
                    ),
                    (e.ActionConfiguration = a.Configuration.create('action', {
                        handler: { macro: ['action-macros'] },
                    }));
            },
            2577: function (t, e, r) {
                var n,
                    a,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                n(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AmsConfiguration = e.AmsTags = void 0);
                var i = r(251),
                    s = r(7971),
                    l = r(4680),
                    c = r(8016);
                r(829);
                var u = r(5871),
                    d = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return o(e, t), e;
                    })(l.AbstractTags);
                e.AmsTags = d;
                e.AmsConfiguration = i.Configuration.create('ams', {
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
                        ((a = {}),
                        (a[s.MultlineItem.prototype.kind] = s.MultlineItem),
                        (a[s.FlalignItem.prototype.kind] = s.FlalignItem),
                        a),
                    tags: { ams: d },
                    init: function (t) {
                        new u.CommandMap(c.NEW_OPS, {}, {}),
                            t.append(
                                i.Configuration.local({
                                    handler: { macro: [c.NEW_OPS] },
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
            7971: function (t, e, r) {
                var n,
                    a =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                n(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    o =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (o =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, r = 1, n = arguments.length; r < n; r++)
                                            for (var a in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, a) &&
                                                    (t[a] = e[a]);
                                        return t;
                                    }),
                                o.apply(this, arguments)
                            );
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.FlalignItem = e.MultlineItem = void 0);
                var s = r(2935),
                    l = i(r(7398)),
                    c = i(r(4748)),
                    u = i(r(3402)),
                    d = r(6108),
                    p = (function (t) {
                        function e(e) {
                            for (var r = [], n = 1; n < arguments.length; n++)
                                r[n - 1] = arguments[n];
                            var a = t.call(this, e) || this;
                            return a.factory.configuration.tags.start('multline', !0, r[0]), a;
                        }
                        return (
                            a(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'multline';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.EndEntry = function () {
                                this.table.length &&
                                    l.default.fixInitialMO(this.factory.configuration, this.nodes);
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
                                    throw new u.default(
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
                                        r = -1;
                                    c.default.getAttribute(
                                        c.default.getChildren(this.table[0])[0],
                                        'columnalign',
                                    ) ||
                                        c.default.setAttribute(
                                            c.default.getChildren(this.table[0])[0],
                                            'columnalign',
                                            d.TexConstant.Align.LEFT,
                                        ),
                                        c.default.getAttribute(
                                            c.default.getChildren(this.table[e])[0],
                                            'columnalign',
                                        ) ||
                                            c.default.setAttribute(
                                                c.default.getChildren(this.table[e])[0],
                                                'columnalign',
                                                d.TexConstant.Align.RIGHT,
                                            );
                                    var n = this.factory.configuration.tags.getTag();
                                    if (n) {
                                        r =
                                            this.arraydef.side === d.TexConstant.Align.LEFT
                                                ? 0
                                                : this.table.length - 1;
                                        var a = this.table[r],
                                            o = this.create(
                                                'node',
                                                'mlabeledtr',
                                                [n].concat(c.default.getChildren(a)),
                                            );
                                        c.default.copyAttributes(a, o), (this.table[r] = o);
                                    }
                                }
                                this.factory.configuration.tags.end();
                            }),
                            e
                        );
                    })(s.ArrayItem);
                e.MultlineItem = p;
                var f = (function (t) {
                    function e(e, r, n, a, o) {
                        var i = t.call(this, e) || this;
                        return (
                            (i.name = r),
                            (i.numbered = n),
                            (i.padded = a),
                            (i.center = o),
                            i.factory.configuration.tags.start(r, n, n),
                            i
                        );
                    }
                    return (
                        a(e, t),
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
                                throw new u.default(
                                    'XalignOverflow',
                                    'Extra %1 in row of %2',
                                    '&',
                                    this.name,
                                );
                        }),
                        (e.prototype.EndRow = function () {
                            for (
                                var e, r = this.row, n = this.getProperty('xalignat');
                                r.length < n;

                            )
                                r.push(this.create('node', 'mtd'));
                            for (
                                this.row = [],
                                    this.padded && this.row.push(this.create('node', 'mtd'));
                                (e = r.shift());

                            )
                                this.row.push(e),
                                    (e = r.shift()) && this.row.push(e),
                                    (r.length || this.padded) &&
                                        this.row.push(this.create('node', 'mtd'));
                            this.row.length > this.maxrow && (this.maxrow = this.row.length),
                                t.prototype.EndRow.call(this);
                            var a = this.table[this.table.length - 1];
                            if (this.getProperty('zeroWidthLabel') && a.isKind('mlabeledtr')) {
                                var i = c.default.getChildren(a)[0],
                                    s = this.factory.configuration.options.tagSide,
                                    l = o({ width: 0 }, 'right' === s ? { lspace: '-1width' } : {}),
                                    u = this.create('node', 'mpadded', c.default.getChildren(i), l);
                                i.setChildren([u]);
                            }
                        }),
                        (e.prototype.EndTable = function () {
                            (t.prototype.EndTable.call(this), this.center) &&
                                this.maxrow <= 2 &&
                                (delete this.arraydef.width, delete this.global.indentalign);
                        }),
                        e
                    );
                })(s.EqnArrayItem);
                e.FlalignItem = f;
            },
            829: function (t, e, r) {
                var n =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, n) {
                                  void 0 === n && (n = r);
                                  var a = Object.getOwnPropertyDescriptor(e, r);
                                  (a &&
                                      !('get' in a
                                          ? !e.__esModule
                                          : a.writable || a.configurable)) ||
                                      (a = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, n, a);
                              }
                            : function (t, e, r, n) {
                                  void 0 === n && (n = r), (t[n] = e[r]);
                              }),
                    a =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (t, e) {
                                  Object.defineProperty(t, 'default', { enumerable: !0, value: e });
                              }
                            : function (t, e) {
                                  t.default = e;
                              }),
                    o =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var r in t)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(t, r) &&
                                        n(e, t, r);
                            return a(e, t), e;
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var s = r(8016),
                    l = o(r(5871)),
                    c = r(6108),
                    u = i(r(4945)),
                    d = i(r(7398)),
                    p = r(2955),
                    f = r(1230);
                new l.CharacterMap('AMSmath-mathchar0mo', u.default.mathchar0mo, {
                    iiiint: ['\u2a0c', { texClass: p.TEXCLASS.OP }],
                }),
                    new l.RegExpMap('AMSmath-operatorLetter', s.AmsMethods.operatorLetter, /[-*]/i),
                    new l.CommandMap(
                        'AMSmath-macros',
                        {
                            mathring: ['Accent', '02DA'],
                            nobreakspace: 'Tilde',
                            negmedspace: ['Spacer', f.MATHSPACE.negativemediummathspace],
                            negthickspace: ['Spacer', f.MATHSPACE.negativethickmathspace],
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
                            shoveleft: ['HandleShove', c.TexConstant.Align.LEFT],
                            shoveright: ['HandleShove', c.TexConstant.Align.RIGHT],
                            xrightarrow: ['xArrow', 8594, 5, 10],
                            xleftarrow: ['xArrow', 8592, 10, 5],
                        },
                        s.AmsMethods,
                    ),
                    new l.EnvironmentMap(
                        'AMSmath-environment',
                        u.default.environment,
                        {
                            'equation*': ['Equation', null, !1],
                            'eqnarray*': [
                                'EqnArray',
                                null,
                                !1,
                                !0,
                                'rcl',
                                d.default.cols(0, f.MATHSPACE.thickmathspace),
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
                        s.AmsMethods,
                    ),
                    new l.DelimiterMap('AMSmath-delimiter', u.default.delimiter, {
                        '\\lvert': ['|', { texClass: p.TEXCLASS.OPEN }],
                        '\\rvert': ['|', { texClass: p.TEXCLASS.CLOSE }],
                        '\\lVert': ['\u2016', { texClass: p.TEXCLASS.OPEN }],
                        '\\rVert': ['\u2016', { texClass: p.TEXCLASS.CLOSE }],
                    }),
                    new l.CharacterMap('AMSsymbols-mathchar0mi', u.default.mathchar0mi, {
                        digamma: '\u03dd',
                        varkappa: '\u03f0',
                        varGamma: ['\u0393', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varDelta: ['\u0394', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varTheta: ['\u0398', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varLambda: ['\u039b', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varXi: ['\u039e', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varPi: ['\u03a0', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varSigma: ['\u03a3', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varUpsilon: ['\u03a5', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varPhi: ['\u03a6', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varPsi: ['\u03a8', { mathvariant: c.TexConstant.Variant.ITALIC }],
                        varOmega: ['\u03a9', { mathvariant: c.TexConstant.Variant.ITALIC }],
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
                        circledS: ['\u24c8', { mathvariant: c.TexConstant.Variant.NORMAL }],
                        bigstar: '\u2605',
                        sphericalangle: '\u2222',
                        measuredangle: '\u2221',
                        nexists: '\u2204',
                        complement: '\u2201',
                        mho: '\u2127',
                        eth: ['\xf0', { mathvariant: c.TexConstant.Variant.NORMAL }],
                        Finv: '\u2132',
                        diagup: '\u2571',
                        Game: '\u2141',
                        diagdown: '\u2572',
                        Bbbk: ['k', { mathvariant: c.TexConstant.Variant.DOUBLESTRUCK }],
                        yen: '\xa5',
                        circledR: '\xae',
                        checkmark: '\u2713',
                        maltese: '\u2720',
                    }),
                    new l.CharacterMap('AMSsymbols-mathchar0mo', u.default.mathchar0mo, {
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
                    new l.DelimiterMap('AMSsymbols-delimiter', u.default.delimiter, {
                        '\\ulcorner': '\u231c',
                        '\\urcorner': '\u231d',
                        '\\llcorner': '\u231e',
                        '\\lrcorner': '\u231f',
                    }),
                    new l.CommandMap(
                        'AMSsymbols-macros',
                        {
                            implies: ['Macro', '\\;\\Longrightarrow\\;'],
                            impliedby: ['Macro', '\\;\\Longleftarrow\\;'],
                        },
                        s.AmsMethods,
                    );
            },
            8016: function (t, e, r) {
                var n =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (n =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, r = 1, n = arguments.length; r < n; r++)
                                            for (var a in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, a) &&
                                                    (t[a] = e[a]);
                                        return t;
                                    }),
                                n.apply(this, arguments)
                            );
                        },
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                a,
                                o = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                a = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (a) throw a.error;
                                }
                            }
                            return i;
                        },
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.NEW_OPS = e.AmsMethods = void 0);
                var i = o(r(7398)),
                    s = o(r(4945)),
                    l = o(r(4748)),
                    c = r(6108),
                    u = o(r(2193)),
                    d = o(r(3402)),
                    p = r(4924),
                    f = o(r(7360)),
                    m = r(2955);
                function h(t) {
                    if (!t || (t.isInferred && 0 === t.childNodes.length)) return [null, null];
                    if (t.isKind('msubsup') && g(t)) return [t, null];
                    var e = l.default.getChildAt(t, 0);
                    return t.isInferred && e && g(e)
                        ? (t.childNodes.splice(0, 1), [e, t])
                        : [null, t];
                }
                function g(t) {
                    var e = t.childNodes[0];
                    return e && e.isKind('mi') && '' === e.getText();
                }
                (e.AmsMethods = {}),
                    (e.AmsMethods.AmsEqnArray = function (t, e, r, n, a, o, s) {
                        var l = t.GetBrackets('\\begin{' + e.getName() + '}'),
                            c = f.default.EqnArray(t, e, r, n, a, o, s);
                        return i.default.setArrayAlign(c, l);
                    }),
                    (e.AmsMethods.AlignAt = function (t, r, n, a) {
                        var o,
                            s,
                            l = r.getName(),
                            c = '',
                            u = [];
                        if (
                            (a || (s = t.GetBrackets('\\begin{' + l + '}')),
                            (o = t.GetArgument('\\begin{' + l + '}')).match(/[^0-9]/))
                        )
                            throw new d.default(
                                'PositiveIntegerArg',
                                'Argument to %1 must me a positive integer',
                                '\\begin{' + l + '}',
                            );
                        for (var p = parseInt(o, 10); p > 0; ) (c += 'rl'), u.push('0em 0em'), p--;
                        var f = u.join(' ');
                        if (a) return e.AmsMethods.EqnArray(t, r, n, a, c, f);
                        var m = e.AmsMethods.EqnArray(t, r, n, a, c, f);
                        return i.default.setArrayAlign(m, s);
                    }),
                    (e.AmsMethods.Multline = function (t, e, r) {
                        t.Push(e), i.default.checkEqnEnv(t);
                        var n = t.itemFactory.create('multline', r, t.stack);
                        return (
                            (n.arraydef = {
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
                            n
                        );
                    }),
                    (e.AmsMethods.XalignAt = function (t, r, n, a) {
                        var o = t.GetArgument('\\begin{' + r.getName() + '}');
                        if (o.match(/[^0-9]/))
                            throw new d.default(
                                'PositiveIntegerArg',
                                'Argument to %1 must me a positive integer',
                                '\\begin{' + r.getName() + '}',
                            );
                        var i = a ? 'crl' : 'rlc',
                            s = a ? 'fit auto auto' : 'auto auto fit',
                            l = e.AmsMethods.FlalignArray(t, r, n, a, !1, i, s, !0);
                        return l.setProperty('xalignat', 2 * parseInt(o)), l;
                    }),
                    (e.AmsMethods.FlalignArray = function (t, e, r, n, a, o, s, l) {
                        void 0 === l && (l = !1),
                            t.Push(e),
                            i.default.checkEqnEnv(t),
                            (o = o
                                .split('')
                                .join(' ')
                                .replace(/r/g, 'right')
                                .replace(/l/g, 'left')
                                .replace(/c/g, 'center'));
                        var c = t.itemFactory.create('flalign', e.getName(), r, n, a, t.stack);
                        return (
                            (c.arraydef = {
                                width: '100%',
                                displaystyle: !0,
                                columnalign: o,
                                columnspacing: '0em',
                                columnwidth: s,
                                rowspacing: '3pt',
                                side: t.options.tagSide,
                                minlabelspacing: l ? '0' : t.options.tagIndent,
                                'data-width-includes-label': !0,
                            }),
                            c.setProperty('zeroWidthLabel', l),
                            c
                        );
                    }),
                    (e.NEW_OPS = 'ams-declare-ops'),
                    (e.AmsMethods.HandleDeclareOp = function (t, r) {
                        var n = t.GetStar() ? '*' : '',
                            a = i.default.trimSpaces(t.GetArgument(r));
                        '\\' === a.charAt(0) && (a = a.substr(1));
                        var o = t.GetArgument(r);
                        t.configuration.handlers
                            .retrieve(e.NEW_OPS)
                            .add(
                                a,
                                new p.Macro(a, e.AmsMethods.Macro, [
                                    '\\operatorname'.concat(n, '{').concat(o, '}'),
                                ]),
                            );
                    }),
                    (e.AmsMethods.HandleOperatorName = function (t, e) {
                        var r = t.GetStar(),
                            a = i.default.trimSpaces(t.GetArgument(e)),
                            o = new u.default(
                                a,
                                n(n({}, t.stack.env), {
                                    font: c.TexConstant.Variant.NORMAL,
                                    multiLetterIdentifiers: /^[-*a-z]+/i,
                                    operatorLetters: !0,
                                }),
                                t.configuration,
                            ).mml();
                        if (
                            (o.isKind('mi') || (o = t.create('node', 'TeXAtom', [o])),
                            l.default.setProperties(o, {
                                movesupsub: r,
                                movablelimits: !0,
                                texClass: m.TEXCLASS.OP,
                            }),
                            !r)
                        ) {
                            var s = t.GetNext(),
                                d = t.i;
                            '\\' === s && ++t.i && 'limits' !== t.GetCS() && (t.i = d);
                        }
                        t.Push(o);
                    }),
                    (e.AmsMethods.SideSet = function (t, e) {
                        var r = a(h(t.ParseArg(e)), 2),
                            n = r[0],
                            o = r[1],
                            s = a(h(t.ParseArg(e)), 2),
                            c = s[0],
                            u = s[1],
                            d = t.ParseArg(e),
                            p = d;
                        n &&
                            (o
                                ? n.replaceChild(
                                      t.create('node', 'mphantom', [
                                          t.create('node', 'mpadded', [i.default.copyNode(d, t)], {
                                              width: 0,
                                          }),
                                      ]),
                                      l.default.getChildAt(n, 0),
                                  )
                                : ((p = t.create('node', 'mmultiscripts', [d])),
                                  c &&
                                      l.default.appendChildren(p, [
                                          l.default.getChildAt(c, 1) || t.create('node', 'none'),
                                          l.default.getChildAt(c, 2) || t.create('node', 'none'),
                                      ]),
                                  l.default.setProperty(p, 'scriptalign', 'left'),
                                  l.default.appendChildren(p, [
                                      t.create('node', 'mprescripts'),
                                      l.default.getChildAt(n, 1) || t.create('node', 'none'),
                                      l.default.getChildAt(n, 2) || t.create('node', 'none'),
                                  ]))),
                            c &&
                                p === d &&
                                (c.replaceChild(d, l.default.getChildAt(c, 0)), (p = c));
                        var f = t.create('node', 'TeXAtom', [], {
                            texClass: m.TEXCLASS.OP,
                            movesupsub: !0,
                            movablelimits: !0,
                        });
                        o && (n && f.appendChild(n), f.appendChild(o)),
                            f.appendChild(p),
                            u && f.appendChild(u),
                            t.Push(f);
                    }),
                    (e.AmsMethods.operatorLetter = function (t, e) {
                        return !!t.stack.env.operatorLetters && s.default.variable(t, e);
                    }),
                    (e.AmsMethods.MultiIntegral = function (t, e, r) {
                        var n = t.GetNext();
                        if ('\\' === n) {
                            var a = t.i;
                            (n = t.GetArgument(e)),
                                (t.i = a),
                                '\\limits' === n &&
                                    (r =
                                        '\\idotsint' === e
                                            ? '\\!\\!\\mathop{\\,\\,' + r + '}'
                                            : '\\!\\!\\!\\mathop{\\,\\,\\,' + r + '}');
                        }
                        (t.string = r + ' ' + t.string.slice(t.i)), (t.i = 0);
                    }),
                    (e.AmsMethods.xArrow = function (t, e, r, n, a) {
                        var o = {
                                width: '+' + i.default.Em((n + a) / 18),
                                lspace: i.default.Em(n / 18),
                            },
                            s = t.GetBrackets(e),
                            c = t.ParseArg(e),
                            d = t.create('node', 'mspace', [], { depth: '.25em' }),
                            p = t.create(
                                'token',
                                'mo',
                                { stretchy: !0, texClass: m.TEXCLASS.REL },
                                String.fromCodePoint(r),
                            );
                        p = t.create('node', 'mstyle', [p], { scriptlevel: 0 });
                        var f = t.create('node', 'munderover', [p]),
                            h = t.create('node', 'mpadded', [c, d], o);
                        if (
                            (l.default.setAttribute(h, 'voffset', '-.2em'),
                            l.default.setAttribute(h, 'height', '-.2em'),
                            l.default.setChild(f, f.over, h),
                            s)
                        ) {
                            var g = new u.default(s, t.stack.env, t.configuration).mml(),
                                v = t.create('node', 'mspace', [], { height: '.75em' });
                            (h = t.create('node', 'mpadded', [g, v], o)),
                                l.default.setAttribute(h, 'voffset', '.15em'),
                                l.default.setAttribute(h, 'depth', '-.15em'),
                                l.default.setChild(f, f.under, h);
                        }
                        l.default.setProperty(f, 'subsupOK', !0), t.Push(f);
                    }),
                    (e.AmsMethods.HandleShove = function (t, e, r) {
                        var n = t.stack.Top();
                        if ('multline' !== n.kind)
                            throw new d.default(
                                'CommandOnlyAllowedInEnv',
                                '%1 only allowed in %2 environment',
                                t.currentCS,
                                'multline',
                            );
                        if (n.Size())
                            throw new d.default(
                                'CommandAtTheBeginingOfLine',
                                '%1 must come at the beginning of the line',
                                t.currentCS,
                            );
                        n.setProperty('shove', r);
                    }),
                    (e.AmsMethods.CFrac = function (t, e) {
                        var r = i.default.trimSpaces(t.GetBrackets(e, '')),
                            n = t.GetArgument(e),
                            a = t.GetArgument(e),
                            o = {
                                l: c.TexConstant.Align.LEFT,
                                r: c.TexConstant.Align.RIGHT,
                                '': '',
                            },
                            s = new u.default(
                                '\\strut\\textstyle{' + n + '}',
                                t.stack.env,
                                t.configuration,
                            ).mml(),
                            p = new u.default(
                                '\\strut\\textstyle{' + a + '}',
                                t.stack.env,
                                t.configuration,
                            ).mml(),
                            f = t.create('node', 'mfrac', [s, p]);
                        if (null == (r = o[r]))
                            throw new d.default(
                                'IllegalAlign',
                                'Illegal alignment specified in %1',
                                t.currentCS,
                            );
                        r && l.default.setProperties(f, { numalign: r, denomalign: r }), t.Push(f);
                    }),
                    (e.AmsMethods.Genfrac = function (t, e, r, n, a, o) {
                        null == r && (r = t.GetDelimiterArg(e)),
                            null == n && (n = t.GetDelimiterArg(e)),
                            null == a && (a = t.GetArgument(e)),
                            null == o && (o = i.default.trimSpaces(t.GetArgument(e)));
                        var s = t.ParseArg(e),
                            c = t.ParseArg(e),
                            u = t.create('node', 'mfrac', [s, c]);
                        if (
                            ('' !== a && l.default.setAttribute(u, 'linethickness', a),
                            (r || n) &&
                                (l.default.setProperty(u, 'withDelims', !0),
                                (u = i.default.fixedFence(t.configuration, r, u, n))),
                            '' !== o)
                        ) {
                            var p = parseInt(o, 10),
                                f = ['D', 'T', 'S', 'SS'][p];
                            if (null == f)
                                throw new d.default(
                                    'BadMathStyleFor',
                                    'Bad math style for %1',
                                    t.currentCS,
                                );
                            (u = t.create('node', 'mstyle', [u])),
                                'D' === f
                                    ? l.default.setProperties(u, {
                                          displaystyle: !0,
                                          scriptlevel: 0,
                                      })
                                    : l.default.setProperties(u, {
                                          displaystyle: !1,
                                          scriptlevel: p - 1,
                                      });
                        }
                        t.Push(u);
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
                        var r = t.GetStar(),
                            n = i.default.trimSpaces(t.GetArgument(e));
                        t.tags.tag(n, r);
                    }),
                    (e.AmsMethods.HandleNoTag = f.default.HandleNoTag),
                    (e.AmsMethods.HandleRef = f.default.HandleRef),
                    (e.AmsMethods.Macro = f.default.Macro),
                    (e.AmsMethods.Accent = f.default.Accent),
                    (e.AmsMethods.Tilde = f.default.Tilde),
                    (e.AmsMethods.Array = f.default.Array),
                    (e.AmsMethods.Spacer = f.default.Spacer),
                    (e.AmsMethods.NamedOp = f.default.NamedOp),
                    (e.AmsMethods.EqnArray = f.default.EqnArray),
                    (e.AmsMethods.Equation = f.default.Equation);
            },
            6769: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AmsCdConfiguration = void 0);
                var n = r(251);
                r(8704),
                    (e.AmsCdConfiguration = n.Configuration.create('amscd', {
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
            8704: function (t, e, r) {
                var n =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, n) {
                                  void 0 === n && (n = r);
                                  var a = Object.getOwnPropertyDescriptor(e, r);
                                  (a &&
                                      !('get' in a
                                          ? !e.__esModule
                                          : a.writable || a.configurable)) ||
                                      (a = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, n, a);
                              }
                            : function (t, e, r, n) {
                                  void 0 === n && (n = r), (t[n] = e[r]);
                              }),
                    a =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (t, e) {
                                  Object.defineProperty(t, 'default', { enumerable: !0, value: e });
                              }
                            : function (t, e) {
                                  t.default = e;
                              }),
                    o =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var r in t)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(t, r) &&
                                        n(e, t, r);
                            return a(e, t), e;
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var s = o(r(5871)),
                    l = i(r(4945)),
                    c = i(r(8834));
                new s.EnvironmentMap(
                    'amscd_environment',
                    l.default.environment,
                    { CD: 'CD' },
                    c.default,
                ),
                    new s.CommandMap(
                        'amscd_macros',
                        {
                            minCDarrowwidth: 'minCDarrowwidth',
                            minCDarrowheight: 'minCDarrowheight',
                        },
                        c.default,
                    ),
                    new s.MacroMap('amscd_special', { '@': 'arrow' }, c.default);
            },
            8834: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var a = n(r(2193)),
                    o = r(2379),
                    i = r(2955),
                    s = n(r(4748)),
                    l = {
                        CD: function (t, e) {
                            t.Push(e);
                            var r = t.itemFactory.create('array'),
                                n = t.configuration.options.amscd;
                            return (
                                r.setProperties({
                                    minw: t.stack.env.CD_minw || n.harrowsize,
                                    minh: t.stack.env.CD_minh || n.varrowsize,
                                }),
                                (r.arraydef = {
                                    columnalign: 'center',
                                    columnspacing: n.colspace,
                                    rowspacing: n.rowspace,
                                    displaystyle: !0,
                                }),
                                r
                            );
                        },
                        arrow: function (t, e) {
                            var r = t.string.charAt(t.i);
                            if (!r.match(/[><VA.|=]/)) return (0, o.Other)(t, e);
                            t.i++;
                            var n = t.stack.Top();
                            (n.isKind('array') && !n.Size()) || (l.cell(t, e), (n = t.stack.Top()));
                            for (
                                var c,
                                    u = n,
                                    d = u.table.length % 2 == 1,
                                    p = (u.row.length + (d ? 0 : 1)) % 2;
                                p;

                            )
                                l.cell(t, e), p--;
                            var f = { minsize: u.getProperty('minw'), stretchy: !0 },
                                m = {
                                    minsize: u.getProperty('minh'),
                                    stretchy: !0,
                                    symmetric: !0,
                                    lspace: 0,
                                    rspace: 0,
                                };
                            if ('.' === r);
                            else if ('|' === r) c = t.create('token', 'mo', m, '\u2225');
                            else if ('=' === r) c = t.create('token', 'mo', f, '=');
                            else {
                                var h = { '>': '\u2192', '<': '\u2190', V: '\u2193', A: '\u2191' }[
                                        r
                                    ],
                                    g = t.GetUpTo(e + r, r),
                                    v = t.GetUpTo(e + r, r);
                                if ('>' === r || '<' === r) {
                                    if (
                                        ((c = t.create('token', 'mo', f, h)),
                                        g || (g = '\\kern ' + u.getProperty('minw')),
                                        g || v)
                                    ) {
                                        var y = { width: '+.67em', lspace: '.33em' };
                                        if (((c = t.create('node', 'munderover', [c])), g)) {
                                            var x = new a.default(
                                                    g,
                                                    t.stack.env,
                                                    t.configuration,
                                                ).mml(),
                                                b = t.create('node', 'mpadded', [x], y);
                                            s.default.setAttribute(b, 'voffset', '.1em'),
                                                s.default.setChild(c, c.over, b);
                                        }
                                        if (v) {
                                            var _ = new a.default(
                                                v,
                                                t.stack.env,
                                                t.configuration,
                                            ).mml();
                                            s.default.setChild(
                                                c,
                                                c.under,
                                                t.create('node', 'mpadded', [_], y),
                                            );
                                        }
                                        t.configuration.options.amscd.hideHorizontalLabels &&
                                            (c = t.create('node', 'mpadded', c, {
                                                depth: 0,
                                                height: '.67em',
                                            }));
                                    }
                                } else {
                                    var M = t.create('token', 'mo', m, h);
                                    (c = M),
                                        (g || v) &&
                                            ((c = t.create('node', 'mrow')),
                                            g &&
                                                s.default.appendChildren(c, [
                                                    new a.default(
                                                        '\\scriptstyle\\llap{' + g + '}',
                                                        t.stack.env,
                                                        t.configuration,
                                                    ).mml(),
                                                ]),
                                            (M.texClass = i.TEXCLASS.ORD),
                                            s.default.appendChildren(c, [M]),
                                            v &&
                                                s.default.appendChildren(c, [
                                                    new a.default(
                                                        '\\scriptstyle\\rlap{' + v + '}',
                                                        t.stack.env,
                                                        t.configuration,
                                                    ).mml(),
                                                ]));
                                }
                            }
                            c && t.Push(c), l.cell(t, e);
                        },
                        cell: function (t, e) {
                            var r = t.stack.Top();
                            (r.table || []).length % 2 == 0 &&
                                0 === (r.row || []).length &&
                                t.Push(
                                    t.create('node', 'mpadded', [], {
                                        height: '8.5pt',
                                        depth: '2pt',
                                    }),
                                ),
                                t.Push(
                                    t.itemFactory
                                        .create('cell')
                                        .setProperties({ isEntry: !0, name: e }),
                                );
                        },
                        minCDarrowwidth: function (t, e) {
                            t.stack.env.CD_minw = t.GetDimen(e);
                        },
                        minCDarrowheight: function (t, e) {
                            t.stack.env.CD_minh = t.GetDimen(e);
                        },
                    };
                e.default = l;
            },
            5275: function (t, e, r) {
                var n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                a,
                                o = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                a = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (a) throw a.error;
                                }
                            }
                            return i;
                        },
                    a =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AutoloadConfiguration = void 0);
                var o = r(251),
                    i = r(5871),
                    s = r(4924),
                    l = r(2778),
                    c = r(4629),
                    u = r(5074);
                function d(t, e, r, o) {
                    var i, s, u, d;
                    if (c.Package.packages.has(t.options.require.prefix + r)) {
                        var m = t.options.autoload[r],
                            h = n(2 === m.length && Array.isArray(m[0]) ? m : [m, []], 2),
                            g = h[0],
                            v = h[1];
                        try {
                            for (var y = a(g), x = y.next(); !x.done; x = y.next()) {
                                var b = x.value;
                                p.remove(b);
                            }
                        } catch (t) {
                            i = { error: t };
                        } finally {
                            try {
                                x && !x.done && (s = y.return) && s.call(y);
                            } finally {
                                if (i) throw i.error;
                            }
                        }
                        try {
                            for (var _ = a(v), M = _.next(); !M.done; M = _.next()) {
                                var w = M.value;
                                f.remove(w);
                            }
                        } catch (t) {
                            u = { error: t };
                        } finally {
                            try {
                                M && !M.done && (d = _.return) && d.call(_);
                            } finally {
                                if (u) throw u.error;
                            }
                        }
                        (t.string =
                            (o ? e + ' ' : '\\begin{' + e.slice(1) + '}') + t.string.slice(t.i)),
                            (t.i = 0);
                    }
                    (0, l.RequireLoad)(t, r);
                }
                var p = new i.CommandMap('autoload-macros', {}, {}),
                    f = new i.CommandMap('autoload-environments', {}, {});
                e.AutoloadConfiguration = o.Configuration.create('autoload', {
                    handler: { macro: ['autoload-macros'], environment: ['autoload-environments'] },
                    options: {
                        autoload: (0, u.expandable)({
                            action: ['toggle', 'mathtip', 'texttip'],
                            amscd: [[], ['CD']],
                            bbox: ['bbox'],
                            boldsymbol: ['boldsymbol'],
                            braket: [
                                'bra',
                                'ket',
                                'braket',
                                'set',
                                'Bra',
                                'Ket',
                                'Braket',
                                'Set',
                                'ketbra',
                                'Ketbra',
                            ],
                            bussproofs: [[], ['prooftree']],
                            cancel: ['cancel', 'bcancel', 'xcancel', 'cancelto'],
                            color: ['color', 'definecolor', 'textcolor', 'colorbox', 'fcolorbox'],
                            enclose: ['enclose'],
                            extpfeil: [
                                'xtwoheadrightarrow',
                                'xtwoheadleftarrow',
                                'xmapsto',
                                'xlongequal',
                                'xtofrom',
                                'Newextarrow',
                            ],
                            html: ['href', 'class', 'style', 'cssId'],
                            mhchem: ['ce', 'pu'],
                            newcommand: [
                                'newcommand',
                                'renewcommand',
                                'newenvironment',
                                'renewenvironment',
                                'def',
                                'let',
                            ],
                            unicode: ['unicode'],
                            verb: ['verb'],
                        }),
                    },
                    config: function (t, e) {
                        var r,
                            o,
                            i,
                            c,
                            u,
                            m,
                            h = e.parseOptions,
                            g = h.handlers.get('macro'),
                            v = h.handlers.get('environment'),
                            y = h.options.autoload;
                        h.packageData.set('autoload', { Autoload: d });
                        try {
                            for (var x = a(Object.keys(y)), b = x.next(); !b.done; b = x.next()) {
                                var _ = b.value,
                                    M = y[_],
                                    w = n(2 === M.length && Array.isArray(M[0]) ? M : [M, []], 2),
                                    A = w[0],
                                    C = w[1];
                                try {
                                    for (
                                        var P = ((i = void 0), a(A)), S = P.next();
                                        !S.done;
                                        S = P.next()
                                    ) {
                                        var O = S.value;
                                        (g.lookup(O) && 'color' !== O) ||
                                            p.add(O, new s.Macro(O, d, [_, !0]));
                                    }
                                } catch (t) {
                                    i = { error: t };
                                } finally {
                                    try {
                                        S && !S.done && (c = P.return) && c.call(P);
                                    } finally {
                                        if (i) throw i.error;
                                    }
                                }
                                try {
                                    for (
                                        var k = ((u = void 0), a(C)), q = k.next();
                                        !q.done;
                                        q = k.next()
                                    ) {
                                        var T = q.value;
                                        v.lookup(T) || f.add(T, new s.Macro(T, d, [_, !1]));
                                    }
                                } catch (t) {
                                    u = { error: t };
                                } finally {
                                    try {
                                        q && !q.done && (m = k.return) && m.call(k);
                                    } finally {
                                        if (u) throw u.error;
                                    }
                                }
                            }
                        } catch (t) {
                            r = { error: t };
                        } finally {
                            try {
                                b && !b.done && (o = x.return) && o.call(x);
                            } finally {
                                if (r) throw r.error;
                            }
                        }
                        h.packageData.get('require') || l.RequireConfiguration.config(t, e);
                    },
                    init: function (t) {
                        t.options.require ||
                            (0, u.defaultOptions)(t.options, l.RequireConfiguration.options);
                    },
                    priority: 10,
                });
            },
            2133: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.BboxConfiguration = e.BboxMethods = void 0);
                var a = r(251),
                    o = r(5871),
                    i = n(r(3402));
                (e.BboxMethods = {}),
                    (e.BboxMethods.BBox = function (t, e) {
                        for (
                            var r,
                                n,
                                a,
                                o = t.GetBrackets(e, ''),
                                c = t.ParseArg(e),
                                u = o.split(/,/),
                                d = 0,
                                p = u.length;
                            d < p;
                            d++
                        ) {
                            var f = u[d].trim(),
                                m = f.match(/^(\.\d+|\d+(\.\d*)?)(pt|em|ex|mu|px|in|cm|mm)$/);
                            if (m) {
                                if (r)
                                    throw new i.default(
                                        'MultipleBBoxProperty',
                                        '%1 specified twice in %2',
                                        'Padding',
                                        e,
                                    );
                                var h = l(m[1] + m[3]);
                                h &&
                                    (r = {
                                        height: '+' + h,
                                        depth: '+' + h,
                                        lspace: h,
                                        width: '+' + 2 * parseInt(m[1], 10) + m[3],
                                    });
                            } else if (f.match(/^([a-z0-9]+|\#[0-9a-f]{6}|\#[0-9a-f]{3})$/i)) {
                                if (n)
                                    throw new i.default(
                                        'MultipleBBoxProperty',
                                        '%1 specified twice in %2',
                                        'Background',
                                        e,
                                    );
                                n = f;
                            } else if (f.match(/^[-a-z]+:/i)) {
                                if (a)
                                    throw new i.default(
                                        'MultipleBBoxProperty',
                                        '%1 specified twice in %2',
                                        'Style',
                                        e,
                                    );
                                a = s(f);
                            } else if ('' !== f)
                                throw new i.default(
                                    'InvalidBBoxProperty',
                                    '"%1" doesn\'t look like a color, a padding dimension, or a style',
                                    f,
                                );
                        }
                        r && (c = t.create('node', 'mpadded', [c], r)),
                            (n || a) &&
                                ((r = {}),
                                n && Object.assign(r, { mathbackground: n }),
                                a && Object.assign(r, { style: a }),
                                (c = t.create('node', 'mstyle', [c], r))),
                            t.Push(c);
                    });
                var s = function (t) {
                        return t;
                    },
                    l = function (t) {
                        return t;
                    };
                new o.CommandMap('bbox', { bbox: 'BBox' }, e.BboxMethods),
                    (e.BboxConfiguration = a.Configuration.create('bbox', {
                        handler: { macro: ['bbox'] },
                    }));
            },
            2986: function (t, e, r) {
                var n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.BoldsymbolConfiguration =
                        e.rewriteBoldTokens =
                        e.createBoldToken =
                        e.BoldsymbolMethods =
                            void 0);
                var o = r(251),
                    i = a(r(4748)),
                    s = r(6108),
                    l = r(5871),
                    c = r(2348),
                    u = {};
                function d(t, e, r, n) {
                    var a = c.NodeFactory.createToken(t, e, r, n);
                    return (
                        'mtext' !== e &&
                            t.configuration.parser.stack.env.boldsymbol &&
                            (i.default.setProperty(a, 'fixBold', !0),
                            t.configuration.addNode('fixBold', a)),
                        a
                    );
                }
                function p(t) {
                    var e, r;
                    try {
                        for (
                            var a = n(t.data.getList('fixBold')), o = a.next();
                            !o.done;
                            o = a.next()
                        ) {
                            var l = o.value;
                            if (i.default.getProperty(l, 'fixBold')) {
                                var c = i.default.getAttribute(l, 'mathvariant');
                                null == c
                                    ? i.default.setAttribute(
                                          l,
                                          'mathvariant',
                                          s.TexConstant.Variant.BOLD,
                                      )
                                    : i.default.setAttribute(l, 'mathvariant', u[c] || c),
                                    i.default.removeProperties(l, 'fixBold');
                            }
                        }
                    } catch (t) {
                        e = { error: t };
                    } finally {
                        try {
                            o && !o.done && (r = a.return) && r.call(a);
                        } finally {
                            if (e) throw e.error;
                        }
                    }
                }
                (u[s.TexConstant.Variant.NORMAL] = s.TexConstant.Variant.BOLD),
                    (u[s.TexConstant.Variant.ITALIC] = s.TexConstant.Variant.BOLDITALIC),
                    (u[s.TexConstant.Variant.FRAKTUR] = s.TexConstant.Variant.BOLDFRAKTUR),
                    (u[s.TexConstant.Variant.SCRIPT] = s.TexConstant.Variant.BOLDSCRIPT),
                    (u[s.TexConstant.Variant.SANSSERIF] = s.TexConstant.Variant.BOLDSANSSERIF),
                    (u['-tex-calligraphic'] = '-tex-bold-calligraphic'),
                    (u['-tex-oldstyle'] = '-tex-bold-oldstyle'),
                    (u['-tex-mathit'] = s.TexConstant.Variant.BOLDITALIC),
                    (e.BoldsymbolMethods = {}),
                    (e.BoldsymbolMethods.Boldsymbol = function (t, e) {
                        var r = t.stack.env.boldsymbol;
                        t.stack.env.boldsymbol = !0;
                        var n = t.ParseArg(e);
                        (t.stack.env.boldsymbol = r), t.Push(n);
                    }),
                    new l.CommandMap(
                        'boldsymbol',
                        { boldsymbol: 'Boldsymbol' },
                        e.BoldsymbolMethods,
                    ),
                    (e.createBoldToken = d),
                    (e.rewriteBoldTokens = p),
                    (e.BoldsymbolConfiguration = o.Configuration.create('boldsymbol', {
                        handler: { macro: ['boldsymbol'] },
                        nodes: { token: d },
                        postprocessors: [p],
                    }));
            },
            8243: function (t, e, r) {
                var n;
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.BraketConfiguration = void 0);
                var a = r(251),
                    o = r(3519);
                r(3299),
                    (e.BraketConfiguration = a.Configuration.create('braket', {
                        handler: { character: ['Braket-characters'], macro: ['Braket-macros'] },
                        items: ((n = {}), (n[o.BraketItem.prototype.kind] = o.BraketItem), n),
                    }));
            },
            3519: function (t, e, r) {
                var n,
                    a =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                n(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.BraketItem = void 0);
                var i = r(1076),
                    s = r(2955),
                    l = o(r(7398)),
                    c = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            a(e, t),
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
                                    r = this.getProperty('open'),
                                    n = this.getProperty('close');
                                if (this.getProperty('stretchy'))
                                    return l.default.fenced(this.factory.configuration, r, e, n);
                                var a = {
                                        fence: !0,
                                        stretchy: !1,
                                        symmetric: !0,
                                        texClass: s.TEXCLASS.OPEN,
                                    },
                                    o = this.create('token', 'mo', a, r);
                                a.texClass = s.TEXCLASS.CLOSE;
                                var i = this.create('token', 'mo', a, n);
                                return this.create('node', 'mrow', [o, e, i], {
                                    open: r,
                                    close: n,
                                    texClass: s.TEXCLASS.INNER,
                                });
                            }),
                            e
                        );
                    })(i.BaseItem);
                e.BraketItem = c;
            },
            3299: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var a = r(5871),
                    o = n(r(1277));
                new a.CommandMap(
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
                    o.default,
                ),
                    new a.MacroMap('Braket-characters', { '|': 'Bar' }, o.default);
            },
            1277: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var a = n(r(7360)),
                    o = r(2955),
                    i = n(r(3402)),
                    s = {};
                (s.Macro = a.default.Macro),
                    (s.Braket = function (t, e, r, n, a, o) {
                        var s = t.GetNext();
                        if ('' === s)
                            throw new i.default(
                                'MissingArgFor',
                                'Missing argument for %1',
                                t.currentCS,
                            );
                        var l = !0;
                        '{' === s && (t.i++, (l = !1)),
                            t.Push(
                                t.itemFactory.create('braket').setProperties({
                                    barmax: o,
                                    barcount: 0,
                                    open: r,
                                    close: n,
                                    stretchy: a,
                                    single: l,
                                }),
                            );
                    }),
                    (s.Bar = function (t, e) {
                        var r = '|' === e ? '|' : '\u2225',
                            n = t.stack.Top();
                        if (
                            'braket' !== n.kind ||
                            n.getProperty('barcount') >= n.getProperty('barmax')
                        ) {
                            var a = t.create(
                                'token',
                                'mo',
                                { texClass: o.TEXCLASS.ORD, stretchy: !1 },
                                r,
                            );
                            t.Push(a);
                        } else {
                            if (
                                ('|' === r && '|' === t.GetNext() && (t.i++, (r = '\u2225')),
                                n.getProperty('stretchy'))
                            ) {
                                var i = t.create('node', 'TeXAtom', [], {
                                    texClass: o.TEXCLASS.CLOSE,
                                });
                                t.Push(i),
                                    n.setProperty('barcount', n.getProperty('barcount') + 1),
                                    (i = t.create(
                                        'token',
                                        'mo',
                                        { stretchy: !0, braketbar: !0 },
                                        r,
                                    )),
                                    t.Push(i),
                                    (i = t.create('node', 'TeXAtom', [], {
                                        texClass: o.TEXCLASS.OPEN,
                                    })),
                                    t.Push(i);
                            } else {
                                var s = t.create('token', 'mo', { stretchy: !1, braketbar: !0 }, r);
                                t.Push(s);
                            }
                        }
                    }),
                    (e.default = s);
            },
            6333: function (t, e, r) {
                var n;
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.BussproofsConfiguration = void 0);
                var a = r(251),
                    o = r(7854),
                    i = r(378);
                r(1116),
                    (e.BussproofsConfiguration = a.Configuration.create('bussproofs', {
                        handler: {
                            macro: ['Bussproofs-macros'],
                            environment: ['Bussproofs-environments'],
                        },
                        items: ((n = {}), (n[o.ProofTreeItem.prototype.kind] = o.ProofTreeItem), n),
                        preprocessors: [[i.saveDocument, 1]],
                        postprocessors: [
                            [i.clearDocument, 3],
                            [i.makeBsprAttributes, 2],
                            [i.balanceRules, 1],
                        ],
                    }));
            },
            7854: function (t, e, r) {
                var n,
                    a =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                n(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    o =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, n) {
                                  void 0 === n && (n = r);
                                  var a = Object.getOwnPropertyDescriptor(e, r);
                                  (a &&
                                      !('get' in a
                                          ? !e.__esModule
                                          : a.writable || a.configurable)) ||
                                      (a = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, n, a);
                              }
                            : function (t, e, r, n) {
                                  void 0 === n && (n = r), (t[n] = e[r]);
                              }),
                    i =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (t, e) {
                                  Object.defineProperty(t, 'default', { enumerable: !0, value: e });
                              }
                            : function (t, e) {
                                  t.default = e;
                              }),
                    s =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var r in t)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(t, r) &&
                                        o(e, t, r);
                            return i(e, t), e;
                        },
                    l =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.ProofTreeItem = void 0);
                var c = l(r(3402)),
                    u = r(1076),
                    d = l(r(8935)),
                    p = s(r(378)),
                    f = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (
                                (e.leftLabel = null),
                                (e.rigthLabel = null),
                                (e.innerStack = new d.default(e.factory, {}, !0)),
                                e
                            );
                        }
                        return (
                            a(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'proofTree';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.checkItem = function (t) {
                                if (t.isKind('end') && 'prooftree' === t.getName()) {
                                    var e = this.toMml();
                                    return (
                                        p.setProperty(e, 'proof', !0),
                                        [[this.factory.create('mml', e), t], !0]
                                    );
                                }
                                if (t.isKind('stop'))
                                    throw new c.default(
                                        'EnvMissingEnd',
                                        'Missing \\end{%1}',
                                        this.getName(),
                                    );
                                return this.innerStack.Push(t), u.BaseItem.fail;
                            }),
                            (e.prototype.toMml = function () {
                                var e = t.prototype.toMml.call(this),
                                    r = this.innerStack.Top();
                                if (r.isKind('start') && !r.Size()) return e;
                                this.innerStack.Push(this.factory.create('stop'));
                                var n = this.innerStack.Top().toMml();
                                return this.create('node', 'mrow', [n, e], {});
                            }),
                            e
                        );
                    })(u.BaseItem);
                e.ProofTreeItem = f;
            },
            1116: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var a = n(r(2827)),
                    o = n(r(4945)),
                    i = r(5871);
                new i.CommandMap(
                    'Bussproofs-macros',
                    {
                        AxiomC: 'Axiom',
                        UnaryInfC: ['Inference', 1],
                        BinaryInfC: ['Inference', 2],
                        TrinaryInfC: ['Inference', 3],
                        QuaternaryInfC: ['Inference', 4],
                        QuinaryInfC: ['Inference', 5],
                        RightLabel: ['Label', 'right'],
                        LeftLabel: ['Label', 'left'],
                        AXC: 'Axiom',
                        UIC: ['Inference', 1],
                        BIC: ['Inference', 2],
                        TIC: ['Inference', 3],
                        RL: ['Label', 'right'],
                        LL: ['Label', 'left'],
                        noLine: ['SetLine', 'none', !1],
                        singleLine: ['SetLine', 'solid', !1],
                        solidLine: ['SetLine', 'solid', !1],
                        dashedLine: ['SetLine', 'dashed', !1],
                        alwaysNoLine: ['SetLine', 'none', !0],
                        alwaysSingleLine: ['SetLine', 'solid', !0],
                        alwaysSolidLine: ['SetLine', 'solid', !0],
                        alwaysDashedLine: ['SetLine', 'dashed', !0],
                        rootAtTop: ['RootAtTop', !0],
                        alwaysRootAtTop: ['RootAtTop', !0],
                        rootAtBottom: ['RootAtTop', !1],
                        alwaysRootAtBottom: ['RootAtTop', !1],
                        fCenter: 'FCenter',
                        Axiom: 'AxiomF',
                        UnaryInf: ['InferenceF', 1],
                        BinaryInf: ['InferenceF', 2],
                        TrinaryInf: ['InferenceF', 3],
                        QuaternaryInf: ['InferenceF', 4],
                        QuinaryInf: ['InferenceF', 5],
                    },
                    a.default,
                ),
                    new i.EnvironmentMap(
                        'Bussproofs-environments',
                        o.default.environment,
                        { prooftree: ['Prooftree', null, !1] },
                        a.default,
                    );
            },
            2827: function (t, e, r) {
                var n =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, n) {
                                  void 0 === n && (n = r);
                                  var a = Object.getOwnPropertyDescriptor(e, r);
                                  (a &&
                                      !('get' in a
                                          ? !e.__esModule
                                          : a.writable || a.configurable)) ||
                                      (a = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, n, a);
                              }
                            : function (t, e, r, n) {
                                  void 0 === n && (n = r), (t[n] = e[r]);
                              }),
                    a =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (t, e) {
                                  Object.defineProperty(t, 'default', { enumerable: !0, value: e });
                              }
                            : function (t, e) {
                                  t.default = e;
                              }),
                    o =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var r in t)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(t, r) &&
                                        n(e, t, r);
                            return a(e, t), e;
                        },
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                a,
                                o = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                a = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (a) throw a.error;
                                }
                            }
                            return i;
                        },
                    s =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, a = 0, o = e.length; a < o; a++)
                                    (!n && a in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, a)),
                                        (n[a] = e[a]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    l =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var c = l(r(3402)),
                    u = l(r(2193)),
                    d = l(r(7398)),
                    p = o(r(378)),
                    f = {
                        Prooftree: function (t, e) {
                            return (
                                t.Push(e),
                                t.itemFactory.create('proofTree').setProperties({
                                    name: e.getName(),
                                    line: 'solid',
                                    currentLine: 'solid',
                                    rootAtTop: !1,
                                })
                            );
                        },
                        Axiom: function (t, e) {
                            var r = t.stack.Top();
                            if ('proofTree' !== r.kind)
                                throw new c.default(
                                    'IllegalProofCommand',
                                    'Proof commands only allowed in prooftree environment.',
                                );
                            var n = m(t, t.GetArgument(e));
                            p.setProperty(n, 'axiom', !0), r.Push(n);
                        },
                    },
                    m = function (t, e) {
                        var r = d.default.internalMath(t, d.default.trimSpaces(e), 0);
                        if (!r[0].childNodes[0].childNodes.length)
                            return t.create('node', 'mrow', []);
                        var n = t.create('node', 'mspace', [], { width: '.5ex' }),
                            a = t.create('node', 'mspace', [], { width: '.5ex' });
                        return t.create('node', 'mrow', s(s([n], i(r), !1), [a], !1));
                    };
                function h(t, e, r, n, a, o, i) {
                    var s,
                        l,
                        c,
                        u,
                        d = t.create('node', 'mtr', [t.create('node', 'mtd', [e], {})], {}),
                        f = t.create('node', 'mtr', [t.create('node', 'mtd', r, {})], {}),
                        m = t.create('node', 'mtable', i ? [f, d] : [d, f], {
                            align: 'top 2',
                            rowlines: o,
                            framespacing: '0 0',
                        });
                    if (
                        (p.setProperty(m, 'inferenceRule', i ? 'up' : 'down'),
                        n &&
                            ((s = t.create('node', 'mpadded', [n], {
                                height: '+.5em',
                                width: '+.5em',
                                voffset: '-.15em',
                            })),
                            p.setProperty(s, 'prooflabel', 'left')),
                        a &&
                            ((l = t.create('node', 'mpadded', [a], {
                                height: '+.5em',
                                width: '+.5em',
                                voffset: '-.15em',
                            })),
                            p.setProperty(l, 'prooflabel', 'right')),
                        n && a)
                    )
                        (c = [s, m, l]), (u = 'both');
                    else if (n) (c = [s, m]), (u = 'left');
                    else {
                        if (!a) return m;
                        (c = [m, l]), (u = 'right');
                    }
                    return (
                        (m = t.create('node', 'mrow', c)), p.setProperty(m, 'labelledRule', u), m
                    );
                }
                function g(t, e) {
                    if ('$' !== t.GetNext())
                        throw new c.default(
                            'IllegalUseOfCommand',
                            "Use of %1 does not match it's definition.",
                            e,
                        );
                    t.i++;
                    var r = t.GetUpTo(e, '$');
                    if (-1 === r.indexOf('\\fCenter'))
                        throw new c.default('IllegalUseOfCommand', 'Missing \\fCenter in %1.', e);
                    var n = i(r.split('\\fCenter'), 2),
                        a = n[0],
                        o = n[1],
                        s = new u.default(a, t.stack.env, t.configuration).mml(),
                        l = new u.default(o, t.stack.env, t.configuration).mml(),
                        d = new u.default('\\fCenter', t.stack.env, t.configuration).mml(),
                        f = t.create('node', 'mtd', [s], {}),
                        m = t.create('node', 'mtd', [d], {}),
                        h = t.create('node', 'mtd', [l], {}),
                        g = t.create('node', 'mtr', [f, m, h], {}),
                        v = t.create('node', 'mtable', [g], {
                            columnspacing: '.5ex',
                            columnalign: 'center 2',
                        });
                    return (
                        p.setProperty(v, 'sequent', !0), t.configuration.addNode('sequent', g), v
                    );
                }
                (f.Inference = function (t, e, r) {
                    var n = t.stack.Top();
                    if ('proofTree' !== n.kind)
                        throw new c.default(
                            'IllegalProofCommand',
                            'Proof commands only allowed in prooftree environment.',
                        );
                    if (n.Size() < r)
                        throw new c.default('BadProofTree', 'Proof tree badly specified.');
                    var a = n.getProperty('rootAtTop'),
                        o = 1 !== r || n.Peek()[0].childNodes.length ? r : 0,
                        i = [];
                    do {
                        i.length && i.unshift(t.create('node', 'mtd', [], {})),
                            i.unshift(
                                t.create('node', 'mtd', [n.Pop()], {
                                    rowalign: a ? 'top' : 'bottom',
                                }),
                            ),
                            r--;
                    } while (r > 0);
                    var s = t.create('node', 'mtr', i, {}),
                        l = t.create('node', 'mtable', [s], { framespacing: '0 0' }),
                        u = m(t, t.GetArgument(e)),
                        d = n.getProperty('currentLine');
                    d !== n.getProperty('line') &&
                        n.setProperty('currentLine', n.getProperty('line'));
                    var f = h(t, l, [u], n.getProperty('left'), n.getProperty('right'), d, a);
                    n.setProperty('left', null),
                        n.setProperty('right', null),
                        p.setProperty(f, 'inference', o),
                        t.configuration.addNode('inference', f),
                        n.Push(f);
                }),
                    (f.Label = function (t, e, r) {
                        var n = t.stack.Top();
                        if ('proofTree' !== n.kind)
                            throw new c.default(
                                'IllegalProofCommand',
                                'Proof commands only allowed in prooftree environment.',
                            );
                        var a = d.default.internalMath(t, t.GetArgument(e), 0),
                            o = a.length > 1 ? t.create('node', 'mrow', a, {}) : a[0];
                        n.setProperty(r, o);
                    }),
                    (f.SetLine = function (t, e, r, n) {
                        var a = t.stack.Top();
                        if ('proofTree' !== a.kind)
                            throw new c.default(
                                'IllegalProofCommand',
                                'Proof commands only allowed in prooftree environment.',
                            );
                        a.setProperty('currentLine', r), n && a.setProperty('line', r);
                    }),
                    (f.RootAtTop = function (t, e, r) {
                        var n = t.stack.Top();
                        if ('proofTree' !== n.kind)
                            throw new c.default(
                                'IllegalProofCommand',
                                'Proof commands only allowed in prooftree environment.',
                            );
                        n.setProperty('rootAtTop', r);
                    }),
                    (f.AxiomF = function (t, e) {
                        var r = t.stack.Top();
                        if ('proofTree' !== r.kind)
                            throw new c.default(
                                'IllegalProofCommand',
                                'Proof commands only allowed in prooftree environment.',
                            );
                        var n = g(t, e);
                        p.setProperty(n, 'axiom', !0), r.Push(n);
                    }),
                    (f.FCenter = function (t, e) {}),
                    (f.InferenceF = function (t, e, r) {
                        var n = t.stack.Top();
                        if ('proofTree' !== n.kind)
                            throw new c.default(
                                'IllegalProofCommand',
                                'Proof commands only allowed in prooftree environment.',
                            );
                        if (n.Size() < r)
                            throw new c.default('BadProofTree', 'Proof tree badly specified.');
                        var a = n.getProperty('rootAtTop'),
                            o = 1 !== r || n.Peek()[0].childNodes.length ? r : 0,
                            i = [];
                        do {
                            i.length && i.unshift(t.create('node', 'mtd', [], {})),
                                i.unshift(
                                    t.create('node', 'mtd', [n.Pop()], {
                                        rowalign: a ? 'top' : 'bottom',
                                    }),
                                ),
                                r--;
                        } while (r > 0);
                        var s = t.create('node', 'mtr', i, {}),
                            l = t.create('node', 'mtable', [s], { framespacing: '0 0' }),
                            u = g(t, e),
                            d = n.getProperty('currentLine');
                        d !== n.getProperty('line') &&
                            n.setProperty('currentLine', n.getProperty('line'));
                        var f = h(t, l, [u], n.getProperty('left'), n.getProperty('right'), d, a);
                        n.setProperty('left', null),
                            n.setProperty('right', null),
                            p.setProperty(f, 'inference', o),
                            t.configuration.addNode('inference', f),
                            n.Push(f);
                    }),
                    (e.default = f);
            },
            378: function (t, e, r) {
                var n,
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                a,
                                o = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                a = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (a) throw a.error;
                                }
                            }
                            return i;
                        },
                    o =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.clearDocument =
                        e.saveDocument =
                        e.makeBsprAttributes =
                        e.removeProperty =
                        e.getProperty =
                        e.setProperty =
                        e.balanceRules =
                            void 0);
                var s = i(r(4748)),
                    l = i(r(7398)),
                    c = null,
                    u = null,
                    d = function (t) {
                        return (u.root = t), c.outputJax.getBBox(u, c).w;
                    },
                    p = function (t) {
                        for (var e = 0; t && !s.default.isType(t, 'mtable'); ) {
                            if (s.default.isType(t, 'text')) return null;
                            s.default.isType(t, 'mrow')
                                ? ((t = t.childNodes[0]), (e = 0))
                                : ((t = t.parent.childNodes[e]), e++);
                        }
                        return t;
                    },
                    f = function (t, e) {
                        return t.childNodes['up' === e ? 1 : 0].childNodes[0].childNodes[0]
                            .childNodes[0].childNodes[0];
                    },
                    m = function (t, e) {
                        return t.childNodes[e].childNodes[0].childNodes[0];
                    },
                    h = function (t) {
                        return m(t, 0);
                    },
                    g = function (t) {
                        return m(t, t.childNodes.length - 1);
                    },
                    v = function (t, e) {
                        return t.childNodes['up' === e ? 0 : 1].childNodes[0].childNodes[0]
                            .childNodes[0];
                    },
                    y = function (t) {
                        for (; t && !s.default.isType(t, 'mtd'); ) t = t.parent;
                        return t;
                    },
                    x = function (t) {
                        return t.parent.childNodes[t.parent.childNodes.indexOf(t) + 1];
                    },
                    b = function (t) {
                        for (; t && null == (0, e.getProperty)(t, 'inference'); ) t = t.parent;
                        return t;
                    },
                    _ = function (t, e, r) {
                        void 0 === r && (r = !1);
                        var n = 0;
                        if (t === e) return n;
                        if (t !== e.parent) {
                            var a = t.childNodes,
                                o = r ? a.length - 1 : 0;
                            s.default.isType(a[o], 'mspace') && (n += d(a[o])), (t = e.parent);
                        }
                        if (t === e) return n;
                        var i = t.childNodes,
                            l = r ? i.length - 1 : 0;
                        return i[l] !== e && (n += d(i[l])), n;
                    },
                    M = function (t, r) {
                        void 0 === r && (r = !1);
                        var n = p(t),
                            a = v(n, (0, e.getProperty)(n, 'inferenceRule'));
                        return _(t, n, r) + (d(n) - d(a)) / 2;
                    },
                    w = function (t, r, n, a) {
                        if (
                            (void 0 === a && (a = !1),
                            (0, e.getProperty)(r, 'inferenceRule') ||
                                (0, e.getProperty)(r, 'labelledRule'))
                        ) {
                            var o = t.nodeFactory.create('node', 'mrow');
                            r.parent.replaceChild(o, r), o.setChildren([r]), A(r, o), (r = o);
                        }
                        var i = a ? r.childNodes.length - 1 : 0,
                            c = r.childNodes[i];
                        s.default.isType(c, 'mspace')
                            ? s.default.setAttribute(
                                  c,
                                  'width',
                                  l.default.Em(
                                      l.default.dimen2em(s.default.getAttribute(c, 'width')) + n,
                                  ),
                              )
                            : ((c = t.nodeFactory.create('node', 'mspace', [], {
                                  width: l.default.Em(n),
                              })),
                              a ? r.appendChild(c) : ((c.parent = r), r.childNodes.unshift(c)));
                    },
                    A = function (t, r) {
                        ['inference', 'proof', 'maxAdjust', 'labelledRule'].forEach(function (n) {
                            var a = (0, e.getProperty)(t, n);
                            null != a && ((0, e.setProperty)(r, n, a), (0, e.removeProperty)(t, n));
                        });
                    },
                    C = function (t, r, n, a, o) {
                        var i = t.nodeFactory.create('node', 'mspace', [], {
                            width: l.default.Em(o),
                        });
                        if ('left' === a) {
                            var s = r.childNodes[n].childNodes[0];
                            (i.parent = s), s.childNodes.unshift(i);
                        } else r.childNodes[n].appendChild(i);
                        (0, e.setProperty)(r.parent, 'sequentAdjust_' + a, o);
                    },
                    P = function (t, r) {
                        for (var n = r.pop(); r.length; ) {
                            var o = r.pop(),
                                i = a(S(n, o), 2),
                                s = i[0],
                                l = i[1];
                            (0, e.getProperty)(n.parent, 'axiom') &&
                                (C(t, s < 0 ? n : o, 0, 'left', Math.abs(s)),
                                C(t, l < 0 ? n : o, 2, 'right', Math.abs(l))),
                                (n = o);
                        }
                    },
                    S = function (t, e) {
                        var r = d(t.childNodes[2]),
                            n = d(e.childNodes[2]);
                        return [d(t.childNodes[0]) - d(e.childNodes[0]), r - n];
                    };
                e.balanceRules = function (t) {
                    var r, n;
                    u = new t.document.options.MathItem('', null, t.math.display);
                    var a = t.data;
                    !(function (t) {
                        var r = t.nodeLists.sequent;
                        if (r)
                            for (var n = r.length - 1, a = void 0; (a = r[n]); n--)
                                if ((0, e.getProperty)(a, 'sequentProcessed'))
                                    (0, e.removeProperty)(a, 'sequentProcessed');
                                else {
                                    var o = [],
                                        i = b(a);
                                    if (1 === (0, e.getProperty)(i, 'inference')) {
                                        for (
                                            o.push(a);
                                            1 === (0, e.getProperty)(i, 'inference');

                                        ) {
                                            i = p(i);
                                            var s = h(f(i, (0, e.getProperty)(i, 'inferenceRule'))),
                                                l = (0, e.getProperty)(s, 'inferenceRule')
                                                    ? v(s, (0, e.getProperty)(s, 'inferenceRule'))
                                                    : s;
                                            (0, e.getProperty)(l, 'sequent') &&
                                                ((a = l.childNodes[0]),
                                                o.push(a),
                                                (0, e.setProperty)(a, 'sequentProcessed', !0)),
                                                (i = s);
                                        }
                                        P(t, o);
                                    }
                                }
                    })(a);
                    var i = a.nodeLists.inference || [];
                    try {
                        for (var s = o(i), l = s.next(); !l.done; l = s.next()) {
                            var c = l.value,
                                d = (0, e.getProperty)(c, 'proof'),
                                m = p(c),
                                A = f(m, (0, e.getProperty)(m, 'inferenceRule')),
                                C = h(A);
                            if ((0, e.getProperty)(C, 'inference')) {
                                var S = M(C);
                                if (S) {
                                    w(a, C, -S);
                                    var O = _(c, m, !1);
                                    w(a, c, S - O);
                                }
                            }
                            var k = g(A);
                            if (null != (0, e.getProperty)(k, 'inference')) {
                                var q = M(k, !0);
                                w(a, k, -q, !0);
                                var T = _(c, m, !0),
                                    E = (0, e.getProperty)(c, 'maxAdjust');
                                null != E && (q = Math.max(q, E));
                                var I = void 0;
                                if (!d && (I = y(c))) {
                                    var N = x(I);
                                    if (N) {
                                        var D = a.nodeFactory.create('node', 'mspace', [], {
                                            width: q - T + 'em',
                                        });
                                        N.appendChild(D), c.removeProperty('maxAdjust');
                                    } else {
                                        var B = b(I);
                                        B &&
                                            ((q = (0, e.getProperty)(B, 'maxAdjust')
                                                ? Math.max((0, e.getProperty)(B, 'maxAdjust'), q)
                                                : q),
                                            (0, e.setProperty)(B, 'maxAdjust', q));
                                    }
                                } else
                                    w(a, (0, e.getProperty)(c, 'proof') ? c : c.parent, q - T, !0);
                            }
                        }
                    } catch (t) {
                        r = { error: t };
                    } finally {
                        try {
                            l && !l.done && (n = s.return) && n.call(s);
                        } finally {
                            if (r) throw r.error;
                        }
                    }
                };
                var O = 'bspr_',
                    k = (((n = {}).bspr_maxAdjust = !0), n);
                e.setProperty = function (t, e, r) {
                    s.default.setProperty(t, O + e, r);
                };
                e.getProperty = function (t, e) {
                    return s.default.getProperty(t, O + e);
                };
                e.removeProperty = function (t, e) {
                    t.removeProperty(O + e);
                };
                e.makeBsprAttributes = function (t) {
                    t.data.root.walkTree(function (t, e) {
                        var r = [];
                        t.getPropertyNames().forEach(function (e) {
                            !k[e] &&
                                e.match(RegExp('^bspr_')) &&
                                r.push(e + ':' + t.getProperty(e));
                        }),
                            r.length && s.default.setAttribute(t, 'semantics', r.join(';'));
                    });
                };
                e.saveDocument = function (t) {
                    if (!('getBBox' in (c = t.document).outputJax))
                        throw Error(
                            'The bussproofs extension requires an output jax with a getBBox() method',
                        );
                };
                e.clearDocument = function (t) {
                    c = null;
                };
            },
            5774: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CancelConfiguration = e.CancelMethods = void 0);
                var a = r(251),
                    o = r(6108),
                    i = r(5871),
                    s = n(r(7398)),
                    l = r(4272);
                (e.CancelMethods = {}),
                    (e.CancelMethods.Cancel = function (t, e, r) {
                        var n = t.GetBrackets(e, ''),
                            a = t.ParseArg(e),
                            o = s.default.keyvalOptions(n, l.ENCLOSE_OPTIONS);
                        (o.notation = r), t.Push(t.create('node', 'menclose', [a], o));
                    }),
                    (e.CancelMethods.CancelTo = function (t, e) {
                        var r = t.GetBrackets(e, ''),
                            n = t.ParseArg(e),
                            a = t.ParseArg(e),
                            i = s.default.keyvalOptions(r, l.ENCLOSE_OPTIONS);
                        (i.notation = [
                            o.TexConstant.Notation.UPDIAGONALSTRIKE,
                            o.TexConstant.Notation.UPDIAGONALARROW,
                            o.TexConstant.Notation.NORTHEASTARROW,
                        ].join(' ')),
                            (n = t.create('node', 'mpadded', [n], {
                                depth: '-.1em',
                                height: '+.1em',
                                voffset: '.1em',
                            })),
                            t.Push(
                                t.create('node', 'msup', [t.create('node', 'menclose', [a], i), n]),
                            );
                    }),
                    new i.CommandMap(
                        'cancel',
                        {
                            cancel: ['Cancel', o.TexConstant.Notation.UPDIAGONALSTRIKE],
                            bcancel: ['Cancel', o.TexConstant.Notation.DOWNDIAGONALSTRIKE],
                            xcancel: [
                                'Cancel',
                                o.TexConstant.Notation.UPDIAGONALSTRIKE +
                                    ' ' +
                                    o.TexConstant.Notation.DOWNDIAGONALSTRIKE,
                            ],
                            cancelto: 'CancelTo',
                        },
                        e.CancelMethods,
                    ),
                    (e.CancelConfiguration = a.Configuration.create('cancel', {
                        handler: { macro: ['cancel'] },
                    }));
            },
            7530: function (t, e, r) {
                var n,
                    a,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                n(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CasesConfiguration =
                        e.CasesMethods =
                        e.CasesTags =
                        e.CasesBeginItem =
                            void 0);
                var s = r(251),
                    l = r(5871),
                    c = i(r(7398)),
                    u = i(r(7360)),
                    d = i(r(3402)),
                    p = r(2935),
                    f = r(2577),
                    m = r(9301),
                    h = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'cases-begin';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.checkItem = function (e) {
                                return e.isKind('end') &&
                                    e.getName() === this.getName() &&
                                    this.getProperty('end')
                                    ? (this.setProperty('end', !1), [[], !0])
                                    : t.prototype.checkItem.call(this, e);
                            }),
                            e
                        );
                    })(p.BeginItem);
                e.CasesBeginItem = h;
                var g = (function (t) {
                    function e() {
                        var e = (null !== t && t.apply(this, arguments)) || this;
                        return (e.subcounter = 0), e;
                    }
                    return (
                        o(e, t),
                        (e.prototype.start = function (e, r, n) {
                            (this.subcounter = 0), t.prototype.start.call(this, e, r, n);
                        }),
                        (e.prototype.autoTag = function () {
                            null == this.currentTag.tag &&
                                ('subnumcases' === this.currentTag.env
                                    ? (0 === this.subcounter && this.counter++,
                                      this.subcounter++,
                                      this.tag(
                                          this.formatNumber(this.counter, this.subcounter),
                                          !1,
                                      ))
                                    : ((0 !== this.subcounter &&
                                          'numcases-left' === this.currentTag.env) ||
                                          this.counter++,
                                      this.tag(this.formatNumber(this.counter), !1)));
                        }),
                        (e.prototype.formatNumber = function (t, e) {
                            return (
                                void 0 === e && (e = null),
                                t.toString() + (null === e ? '' : String.fromCharCode(96 + e))
                            );
                        }),
                        e
                    );
                })(f.AmsTags);
                (e.CasesTags = g),
                    (e.CasesMethods = {
                        NumCases: function (t, e) {
                            if (t.stack.env.closing === e.getName()) {
                                delete t.stack.env.closing,
                                    t.Push(
                                        t.itemFactory
                                            .create('end')
                                            .setProperty('name', e.getName()),
                                    );
                                var r = t.stack.Top(),
                                    n = r.Last,
                                    a = c.default.copyNode(n, t),
                                    o = r.getProperty('left');
                                return (
                                    m.EmpheqUtil.left(
                                        n,
                                        a,
                                        o + '\\empheqlbrace\\,',
                                        t,
                                        'numcases-left',
                                    ),
                                    t.Push(
                                        t.itemFactory
                                            .create('end')
                                            .setProperty('name', e.getName()),
                                    ),
                                    null
                                );
                            }
                            o = t.GetArgument('\\begin{' + e.getName() + '}');
                            e.setProperty('left', o);
                            var i = u.default.EqnArray(t, e, !0, !0, 'll');
                            return (
                                (i.arraydef.displaystyle = !1),
                                (i.arraydef.rowspacing = '.2em'),
                                i.setProperty('numCases', !0),
                                t.Push(e),
                                i
                            );
                        },
                        Entry: function (t, e) {
                            if (!t.stack.Top().getProperty('numCases'))
                                return u.default.Entry(t, e);
                            t.Push(
                                t.itemFactory
                                    .create('cell')
                                    .setProperties({ isEntry: !0, name: e }),
                            );
                            for (var r = t.string, n = 0, a = t.i, o = r.length; a < o; ) {
                                var i = r.charAt(a);
                                if ('{' === i) n++, a++;
                                else if ('}' === i) {
                                    if (0 === n) break;
                                    n--, a++;
                                } else {
                                    if ('&' === i && 0 === n)
                                        throw new d.default(
                                            'ExtraCasesAlignTab',
                                            'Extra alignment tab in text for numcase environment',
                                        );
                                    if ('\\' === i && 0 === n) {
                                        var s = (r.slice(a + 1).match(/^[a-z]+|./i) || [])[0];
                                        if (
                                            '\\' === s ||
                                            'cr' === s ||
                                            'end' === s ||
                                            'label' === s
                                        )
                                            break;
                                        a += s.length;
                                    } else a++;
                                }
                            }
                            var l = r.substr(t.i, a - t.i).replace(/^\s*/, '');
                            t.PushAll(c.default.internalMath(t, l, 0)), (t.i = a);
                        },
                    }),
                    new l.EnvironmentMap(
                        'cases-env',
                        m.EmpheqUtil.environment,
                        { numcases: ['NumCases', 'cases'], subnumcases: ['NumCases', 'cases'] },
                        e.CasesMethods,
                    ),
                    new l.MacroMap('cases-macros', { '&': 'Entry' }, e.CasesMethods),
                    (e.CasesConfiguration = s.Configuration.create('cases', {
                        handler: { environment: ['cases-env'], character: ['cases-macros'] },
                        items: ((a = {}), (a[h.prototype.kind] = h), a),
                        tags: { cases: g },
                    }));
            },
            2286: function (t, e, r) {
                var n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CenternotConfiguration = e.filterCenterOver = void 0);
                var o = r(251),
                    i = a(r(2193)),
                    s = a(r(4748)),
                    l = r(5871),
                    c = a(r(7360));
                function u(t) {
                    var e,
                        r,
                        a = t.data;
                    try {
                        for (
                            var o = n(a.getList('centerOver')), i = o.next();
                            !i.done;
                            i = o.next()
                        ) {
                            var l = i.value,
                                c = s.default.getTexClass(l.childNodes[0].childNodes[0]);
                            null !== c &&
                                s.default.setProperties(
                                    l.parent.parent.parent.parent.parent.parent,
                                    { texClass: c },
                                );
                        }
                    } catch (t) {
                        e = { error: t };
                    } finally {
                        try {
                            i && !i.done && (r = o.return) && r.call(o);
                        } finally {
                            if (e) throw e.error;
                        }
                    }
                }
                new l.CommandMap(
                    'centernot',
                    {
                        centerOver: 'CenterOver',
                        centernot: ['Macro', '\\centerOver{#1}{{\u29f8}}', 1],
                    },
                    {
                        CenterOver: function (t, e) {
                            var r = '{' + t.GetArgument(e) + '}',
                                n = t.ParseArg(e),
                                a = new i.default(r, t.stack.env, t.configuration).mml(),
                                o = t.create('node', 'TeXAtom', [
                                    new i.default(r, t.stack.env, t.configuration).mml(),
                                    t.create(
                                        'node',
                                        'mpadded',
                                        [
                                            t.create('node', 'mpadded', [n], {
                                                width: 0,
                                                lspace: '-.5width',
                                            }),
                                            t.create('node', 'mphantom', [a]),
                                        ],
                                        { width: 0, lspace: '-.5width' },
                                    ),
                                ]);
                            t.configuration.addNode('centerOver', a), t.Push(o);
                        },
                        Macro: c.default.Macro,
                    },
                ),
                    (e.filterCenterOver = u),
                    (e.CenternotConfiguration = o.Configuration.create('centernot', {
                        handler: { macro: ['centernot'] },
                        postprocessors: [u],
                    }));
            },
            2224: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.ColorConfiguration = void 0);
                var n = r(5871),
                    a = r(251),
                    o = r(6162),
                    i = r(6358);
                new n.CommandMap(
                    'color',
                    {
                        color: 'Color',
                        textcolor: 'TextColor',
                        definecolor: 'DefineColor',
                        colorbox: 'ColorBox',
                        fcolorbox: 'FColorBox',
                    },
                    o.ColorMethods,
                );
                e.ColorConfiguration = a.Configuration.create('color', {
                    handler: { macro: ['color'] },
                    options: { color: { padding: '5px', borderWidth: '2px' } },
                    config: function (t, e) {
                        e.parseOptions.packageData.set('color', { model: new i.ColorModel() });
                    },
                });
            },
            2059: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.COLORS = void 0),
                    (e.COLORS = new Map([
                        ['Apricot', '#FBB982'],
                        ['Aquamarine', '#00B5BE'],
                        ['Bittersweet', '#C04F17'],
                        ['Black', '#221E1F'],
                        ['Blue', '#2D2F92'],
                        ['BlueGreen', '#00B3B8'],
                        ['BlueViolet', '#473992'],
                        ['BrickRed', '#B6321C'],
                        ['Brown', '#792500'],
                        ['BurntOrange', '#F7921D'],
                        ['CadetBlue', '#74729A'],
                        ['CarnationPink', '#F282B4'],
                        ['Cerulean', '#00A2E3'],
                        ['CornflowerBlue', '#41B0E4'],
                        ['Cyan', '#00AEEF'],
                        ['Dandelion', '#FDBC42'],
                        ['DarkOrchid', '#A4538A'],
                        ['Emerald', '#00A99D'],
                        ['ForestGreen', '#009B55'],
                        ['Fuchsia', '#8C368C'],
                        ['Goldenrod', '#FFDF42'],
                        ['Gray', '#949698'],
                        ['Green', '#00A64F'],
                        ['GreenYellow', '#DFE674'],
                        ['JungleGreen', '#00A99A'],
                        ['Lavender', '#F49EC4'],
                        ['LimeGreen', '#8DC73E'],
                        ['Magenta', '#EC008C'],
                        ['Mahogany', '#A9341F'],
                        ['Maroon', '#AF3235'],
                        ['Melon', '#F89E7B'],
                        ['MidnightBlue', '#006795'],
                        ['Mulberry', '#A93C93'],
                        ['NavyBlue', '#006EB8'],
                        ['OliveGreen', '#3C8031'],
                        ['Orange', '#F58137'],
                        ['OrangeRed', '#ED135A'],
                        ['Orchid', '#AF72B0'],
                        ['Peach', '#F7965A'],
                        ['Periwinkle', '#7977B8'],
                        ['PineGreen', '#008B72'],
                        ['Plum', '#92268F'],
                        ['ProcessBlue', '#00B0F0'],
                        ['Purple', '#99479B'],
                        ['RawSienna', '#974006'],
                        ['Red', '#ED1B23'],
                        ['RedOrange', '#F26035'],
                        ['RedViolet', '#A1246B'],
                        ['Rhodamine', '#EF559F'],
                        ['RoyalBlue', '#0071BC'],
                        ['RoyalPurple', '#613F99'],
                        ['RubineRed', '#ED017D'],
                        ['Salmon', '#F69289'],
                        ['SeaGreen', '#3FBC9D'],
                        ['Sepia', '#671800'],
                        ['SkyBlue', '#46C5DD'],
                        ['SpringGreen', '#C6DC67'],
                        ['Tan', '#DA9D76'],
                        ['TealBlue', '#00AEB3'],
                        ['Thistle', '#D883B7'],
                        ['Turquoise', '#00B4CE'],
                        ['Violet', '#58429B'],
                        ['VioletRed', '#EF58A0'],
                        ['White', '#FFFFFF'],
                        ['WildStrawberry', '#EE2967'],
                        ['Yellow', '#FFF200'],
                        ['YellowGreen', '#98CC70'],
                        ['YellowOrange', '#FAA21A'],
                    ]));
            },
            6162: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.ColorMethods = void 0);
                var a = n(r(4748)),
                    o = n(r(7398));
                function i(t) {
                    var e = '+'.concat(t),
                        r = t.replace(/^.*?([a-z]*)$/, '$1'),
                        n = 2 * parseFloat(e);
                    return { width: '+'.concat(n).concat(r), height: e, depth: e, lspace: t };
                }
                (e.ColorMethods = {}),
                    (e.ColorMethods.Color = function (t, e) {
                        var r = t.GetBrackets(e, ''),
                            n = t.GetArgument(e),
                            a = t.configuration.packageData.get('color').model.getColor(r, n),
                            o = t.itemFactory
                                .create('style')
                                .setProperties({ styles: { mathcolor: a } });
                        (t.stack.env.color = a), t.Push(o);
                    }),
                    (e.ColorMethods.TextColor = function (t, e) {
                        var r = t.GetBrackets(e, ''),
                            n = t.GetArgument(e),
                            a = t.configuration.packageData.get('color').model.getColor(r, n),
                            o = t.stack.env.color;
                        t.stack.env.color = a;
                        var i = t.ParseArg(e);
                        o ? (t.stack.env.color = o) : delete t.stack.env.color;
                        var s = t.create('node', 'mstyle', [i], { mathcolor: a });
                        t.Push(s);
                    }),
                    (e.ColorMethods.DefineColor = function (t, e) {
                        var r = t.GetArgument(e),
                            n = t.GetArgument(e),
                            a = t.GetArgument(e);
                        t.configuration.packageData.get('color').model.defineColor(n, r, a);
                    }),
                    (e.ColorMethods.ColorBox = function (t, e) {
                        var r = t.GetArgument(e),
                            n = o.default.internalMath(t, t.GetArgument(e)),
                            s = t.configuration.packageData.get('color').model,
                            l = t.create('node', 'mpadded', n, {
                                mathbackground: s.getColor('named', r),
                            });
                        a.default.setProperties(l, i(t.options.color.padding)), t.Push(l);
                    }),
                    (e.ColorMethods.FColorBox = function (t, e) {
                        var r = t.GetArgument(e),
                            n = t.GetArgument(e),
                            s = o.default.internalMath(t, t.GetArgument(e)),
                            l = t.options.color,
                            c = t.configuration.packageData.get('color').model,
                            u = t.create('node', 'mpadded', s, {
                                mathbackground: c.getColor('named', n),
                                style: 'border: '
                                    .concat(l.borderWidth, ' solid ')
                                    .concat(c.getColor('named', r)),
                            });
                        a.default.setProperties(u, i(l.padding)), t.Push(u);
                    });
            },
            6358: function (t, e, r) {
                var n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.ColorModel = void 0);
                var o = a(r(3402)),
                    i = r(2059),
                    s = new Map(),
                    l = (function () {
                        function t() {
                            this.userColors = new Map();
                        }
                        return (
                            (t.prototype.normalizeColor = function (t, e) {
                                if (!t || 'named' === t) return e;
                                if (s.has(t)) return s.get(t)(e);
                                throw new o.default(
                                    'UndefinedColorModel',
                                    "Color model '%1' not defined",
                                    t,
                                );
                            }),
                            (t.prototype.getColor = function (t, e) {
                                return t && 'named' !== t
                                    ? this.normalizeColor(t, e)
                                    : this.getColorByName(e);
                            }),
                            (t.prototype.getColorByName = function (t) {
                                return this.userColors.has(t)
                                    ? this.userColors.get(t)
                                    : i.COLORS.has(t)
                                      ? i.COLORS.get(t)
                                      : t;
                            }),
                            (t.prototype.defineColor = function (t, e, r) {
                                var n = this.normalizeColor(t, r);
                                this.userColors.set(e, n);
                            }),
                            t
                        );
                    })();
                (e.ColorModel = l),
                    s.set('rgb', function (t) {
                        var e,
                            r,
                            a = t.trim().split(/\s*,\s*/),
                            i = '#';
                        if (3 !== a.length)
                            throw new o.default(
                                'ModelArg1',
                                'Color values for the %1 model require 3 numbers',
                                'rgb',
                            );
                        try {
                            for (var s = n(a), l = s.next(); !l.done; l = s.next()) {
                                var c = l.value;
                                if (!c.match(/^(\d+(\.\d*)?|\.\d+)$/))
                                    throw new o.default(
                                        'InvalidDecimalNumber',
                                        'Invalid decimal number',
                                    );
                                var u = parseFloat(c);
                                if (u < 0 || u > 1)
                                    throw new o.default(
                                        'ModelArg2',
                                        'Color values for the %1 model must be between %2 and %3',
                                        'rgb',
                                        '0',
                                        '1',
                                    );
                                var d = Math.floor(255 * u).toString(16);
                                d.length < 2 && (d = '0' + d), (i += d);
                            }
                        } catch (t) {
                            e = { error: t };
                        } finally {
                            try {
                                l && !l.done && (r = s.return) && r.call(s);
                            } finally {
                                if (e) throw e.error;
                            }
                        }
                        return i;
                    }),
                    s.set('RGB', function (t) {
                        var e,
                            r,
                            a = t.trim().split(/\s*,\s*/),
                            i = '#';
                        if (3 !== a.length)
                            throw new o.default(
                                'ModelArg1',
                                'Color values for the %1 model require 3 numbers',
                                'RGB',
                            );
                        try {
                            for (var s = n(a), l = s.next(); !l.done; l = s.next()) {
                                var c = l.value;
                                if (!c.match(/^\d+$/))
                                    throw new o.default('InvalidNumber', 'Invalid number');
                                var u = parseInt(c);
                                if (u > 255)
                                    throw new o.default(
                                        'ModelArg2',
                                        'Color values for the %1 model must be between %2 and %3',
                                        'RGB',
                                        '0',
                                        '255',
                                    );
                                var d = u.toString(16);
                                d.length < 2 && (d = '0' + d), (i += d);
                            }
                        } catch (t) {
                            e = { error: t };
                        } finally {
                            try {
                                l && !l.done && (r = s.return) && r.call(s);
                            } finally {
                                if (e) throw e.error;
                            }
                        }
                        return i;
                    }),
                    s.set('gray', function (t) {
                        if (!t.match(/^\s*(\d+(\.\d*)?|\.\d+)\s*$/))
                            throw new o.default('InvalidDecimalNumber', 'Invalid decimal number');
                        var e = parseFloat(t);
                        if (e < 0 || e > 1)
                            throw new o.default(
                                'ModelArg2',
                                'Color values for the %1 model must be between %2 and %3',
                                'gray',
                                '0',
                                '1',
                            );
                        var r = Math.floor(255 * e).toString(16);
                        return r.length < 2 && (r = '0' + r), '#'.concat(r).concat(r).concat(r);
                    });
            },
            4558: function (t, e, r) {
                var n,
                    a =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                n(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.ColortblConfiguration = e.ColorArrayItem = void 0);
                var i = r(2935),
                    s = r(251),
                    l = r(5871),
                    c = o(r(3402)),
                    u = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.color = { cell: '', row: '', col: [] }), (e.hasColor = !1), e;
                        }
                        return (
                            a(e, t),
                            (e.prototype.EndEntry = function () {
                                t.prototype.EndEntry.call(this);
                                var e = this.row[this.row.length - 1],
                                    r =
                                        this.color.cell ||
                                        this.color.row ||
                                        this.color.col[this.row.length - 1];
                                r &&
                                    (e.attributes.set('mathbackground', r),
                                    (this.color.cell = ''),
                                    (this.hasColor = !0));
                            }),
                            (e.prototype.EndRow = function () {
                                t.prototype.EndRow.call(this), (this.color.row = '');
                            }),
                            (e.prototype.createMml = function () {
                                var e = t.prototype.createMml.call(this),
                                    r = e.isKind('mrow') ? e.childNodes[1] : e;
                                return (
                                    r.isKind('menclose') && (r = r.childNodes[0].childNodes[0]),
                                    this.hasColor &&
                                        'none' === r.attributes.get('frame') &&
                                        r.attributes.set('frame', ''),
                                    e
                                );
                            }),
                            e
                        );
                    })(i.ArrayItem);
                (e.ColorArrayItem = u),
                    new l.CommandMap(
                        'colortbl',
                        {
                            cellcolor: ['TableColor', 'cell'],
                            rowcolor: ['TableColor', 'row'],
                            columncolor: ['TableColor', 'col'],
                        },
                        {
                            TableColor: function (t, e, r) {
                                var n = t.configuration.packageData.get('color').model,
                                    a = t.GetBrackets(e, ''),
                                    o = n.getColor(a, t.GetArgument(e)),
                                    i = t.stack.Top();
                                if (!(i instanceof u))
                                    throw new c.default(
                                        'UnsupportedTableColor',
                                        'Unsupported use of %1',
                                        t.currentCS,
                                    );
                                if ('col' === r) {
                                    if (i.table.length)
                                        throw new c.default(
                                            'ColumnColorNotTop',
                                            '%1 must be in the top row',
                                            e,
                                        );
                                    (i.color.col[i.row.length] = o),
                                        t.GetBrackets(e, '') && t.GetBrackets(e, '');
                                } else if (
                                    ((i.color[r] = o), 'row' === r && (i.Size() || i.row.length))
                                )
                                    throw new c.default(
                                        'RowColorNotFirst',
                                        '%1 must be at the beginning of a row',
                                        e,
                                    );
                            },
                        },
                    );
                e.ColortblConfiguration = s.Configuration.create('colortbl', {
                    handler: { macro: ['colortbl'] },
                    items: { array: u },
                    priority: 10,
                    config: [
                        function (t, e) {
                            e.parseOptions.packageData.has('color') ||
                                s.ConfigurationHandler.get('color').config(t, e);
                        },
                        10,
                    ],
                });
            },
            7888: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.ColorConfiguration = e.ColorV2Methods = void 0);
                var n = r(5871),
                    a = r(251);
                (e.ColorV2Methods = {
                    Color: function (t, e) {
                        var r = t.GetArgument(e),
                            n = t.stack.env.color;
                        t.stack.env.color = r;
                        var a = t.ParseArg(e);
                        n ? (t.stack.env.color = n) : delete t.stack.env.color;
                        var o = t.create('node', 'mstyle', [a], { mathcolor: r });
                        t.Push(o);
                    },
                }),
                    new n.CommandMap('colorv2', { color: 'Color' }, e.ColorV2Methods),
                    (e.ColorConfiguration = a.Configuration.create('colorv2', {
                        handler: { macro: ['colorv2'] },
                    }));
            },
            6359: function (t, e, r) {
                var n,
                    a =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.ConfigMacrosConfiguration = void 0);
                var i = r(251),
                    s = r(5074),
                    l = r(5871),
                    c = o(r(4945)),
                    u = r(4924),
                    d = o(r(1107)),
                    p = r(1205),
                    f = 'configmacros-map',
                    m = 'configmacros-env-map';
                e.ConfigMacrosConfiguration = i.Configuration.create('configmacros', {
                    init: function (t) {
                        new l.CommandMap(f, {}, {}),
                            new l.EnvironmentMap(m, c.default.environment, {}, {}),
                            t.append(
                                i.Configuration.local({
                                    handler: { macro: [f], environment: [m] },
                                    priority: 3,
                                }),
                            );
                    },
                    config: function (t, e) {
                        !(function (t) {
                            var e,
                                r,
                                n = t.parseOptions.handlers.retrieve(f),
                                o = t.parseOptions.options.macros;
                            try {
                                for (
                                    var i = a(Object.keys(o)), s = i.next();
                                    !s.done;
                                    s = i.next()
                                ) {
                                    var l = s.value,
                                        c = 'string' == typeof o[l] ? [o[l]] : o[l],
                                        p = Array.isArray(c[2])
                                            ? new u.Macro(
                                                  l,
                                                  d.default.MacroWithTemplate,
                                                  c.slice(0, 2).concat(c[2]),
                                              )
                                            : new u.Macro(l, d.default.Macro, c);
                                    n.add(l, p);
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    s && !s.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                        })(e),
                            (function (t) {
                                var e,
                                    r,
                                    n = t.parseOptions.handlers.retrieve(m),
                                    o = t.parseOptions.options.environments;
                                try {
                                    for (
                                        var i = a(Object.keys(o)), s = i.next();
                                        !s.done;
                                        s = i.next()
                                    ) {
                                        var l = s.value;
                                        n.add(
                                            l,
                                            new u.Macro(l, d.default.BeginEnv, [!0].concat(o[l])),
                                        );
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        s && !s.done && (r = i.return) && r.call(i);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                            })(e);
                    },
                    items: ((n = {}), (n[p.BeginEnvItem.prototype.kind] = p.BeginEnvItem), n),
                    options: { macros: (0, s.expandable)({}), environments: (0, s.expandable)({}) },
                });
            },
            2079: function (t, e, r) {
                var n,
                    a,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                n(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                a,
                                o = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                a = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (a) throw a.error;
                                }
                            }
                            return i;
                        },
                    s =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.EmpheqConfiguration = e.EmpheqMethods = e.EmpheqBeginItem = void 0);
                var l = r(251),
                    c = r(5871),
                    u = s(r(7398)),
                    d = s(r(3402)),
                    p = r(2935),
                    f = r(9301),
                    m = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'empheq-begin';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.checkItem = function (e) {
                                return (
                                    e.isKind('end') &&
                                        e.getName() === this.getName() &&
                                        this.setProperty('end', !1),
                                    t.prototype.checkItem.call(this, e)
                                );
                            }),
                            e
                        );
                    })(p.BeginItem);
                (e.EmpheqBeginItem = m),
                    (e.EmpheqMethods = {
                        Empheq: function (t, e) {
                            if (t.stack.env.closing === e.getName()) {
                                delete t.stack.env.closing,
                                    t.Push(
                                        t.itemFactory
                                            .create('end')
                                            .setProperty('name', t.stack.global.empheq),
                                    ),
                                    (t.stack.global.empheq = '');
                                var r = t.stack.Top();
                                f.EmpheqUtil.adjustTable(r, t),
                                    t.Push(
                                        t.itemFactory.create('end').setProperty('name', 'empheq'),
                                    );
                            } else {
                                u.default.checkEqnEnv(t), delete t.stack.global.eqnenv;
                                var n = t.GetBrackets('\\begin{' + e.getName() + '}') || '',
                                    a = i(
                                        (t.GetArgument('\\begin{' + e.getName() + '}') || '').split(
                                            /=/,
                                        ),
                                        2,
                                    ),
                                    o = a[0],
                                    s = a[1];
                                if (!f.EmpheqUtil.checkEnv(o))
                                    throw new d.default(
                                        'UnknownEnv',
                                        'Unknown environment "%1"',
                                        o,
                                    );
                                n &&
                                    e.setProperties(
                                        f.EmpheqUtil.splitOptions(n, { left: 1, right: 1 }),
                                    ),
                                    (t.stack.global.empheq = o),
                                    (t.string =
                                        '\\begin{' +
                                        o +
                                        '}' +
                                        (s ? '{' + s + '}' : '') +
                                        t.string.slice(t.i)),
                                    (t.i = 0),
                                    t.Push(e);
                            }
                        },
                        EmpheqMO: function (t, e, r) {
                            t.Push(t.create('token', 'mo', {}, r));
                        },
                        EmpheqDelim: function (t, e) {
                            var r = t.GetDelimiter(e);
                            t.Push(t.create('token', 'mo', { stretchy: !0, symmetric: !0 }, r));
                        },
                    }),
                    new c.EnvironmentMap(
                        'empheq-env',
                        f.EmpheqUtil.environment,
                        { empheq: ['Empheq', 'empheq'] },
                        e.EmpheqMethods,
                    ),
                    new c.CommandMap(
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
                        e.EmpheqMethods,
                    ),
                    (e.EmpheqConfiguration = l.Configuration.create('empheq', {
                        handler: { macro: ['empheq-macros'], environment: ['empheq-env'] },
                        items: ((a = {}), (a[m.prototype.kind] = m), a),
                    }));
            },
            9301: function (t, e, r) {
                var n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                a,
                                o = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                a = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (a) throw a.error;
                                }
                            }
                            return i;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, a = 0, o = e.length; a < o; a++)
                                    (!n && a in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, a)),
                                        (n[a] = e[a]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    o =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.EmpheqUtil = void 0);
                var s = i(r(7398)),
                    l = i(r(2193));
                e.EmpheqUtil = {
                    environment: function (t, e, r, o) {
                        var i = o[0],
                            s = t.itemFactory
                                .create(i + '-begin')
                                .setProperties({ name: e, end: i });
                        t.Push(r.apply(void 0, a([t, s], n(o.slice(1)), !1)));
                    },
                    splitOptions: function (t, e) {
                        return void 0 === e && (e = null), s.default.keyvalOptions(t, e, !0);
                    },
                    columnCount: function (t) {
                        var e,
                            r,
                            n = 0;
                        try {
                            for (var a = o(t.childNodes), i = a.next(); !i.done; i = a.next()) {
                                var s = i.value,
                                    l = s.childNodes.length - (s.isKind('mlabeledtr') ? 1 : 0);
                                l > n && (n = l);
                            }
                        } catch (t) {
                            e = { error: t };
                        } finally {
                            try {
                                i && !i.done && (r = a.return) && r.call(a);
                            } finally {
                                if (e) throw e.error;
                            }
                        }
                        return n;
                    },
                    cellBlock: function (t, e, r, n) {
                        var a,
                            i,
                            s = r.create('node', 'mpadded', [], {
                                height: 0,
                                depth: 0,
                                voffset: '-1height',
                            }),
                            c = new l.default(t, r.stack.env, r.configuration),
                            u = c.mml();
                        n &&
                            c.configuration.tags.label &&
                            ((c.configuration.tags.currentTag.env = n),
                            c.configuration.tags.getTag(!0));
                        try {
                            for (
                                var d = o(u.isInferred ? u.childNodes : [u]), p = d.next();
                                !p.done;
                                p = d.next()
                            ) {
                                var f = p.value;
                                s.appendChild(f);
                            }
                        } catch (t) {
                            a = { error: t };
                        } finally {
                            try {
                                p && !p.done && (i = d.return) && i.call(d);
                            } finally {
                                if (a) throw a.error;
                            }
                        }
                        return (
                            s.appendChild(
                                r.create('node', 'mphantom', [
                                    r.create('node', 'mpadded', [e], { width: 0 }),
                                ]),
                            ),
                            s
                        );
                    },
                    topRowTable: function (t, e) {
                        var r = s.default.copyNode(t, e);
                        return (
                            r.setChildren(r.childNodes.slice(0, 1)),
                            r.attributes.set('align', 'baseline 1'),
                            t.factory.create('mphantom', {}, [
                                e.create('node', 'mpadded', [r], { width: 0 }),
                            ])
                        );
                    },
                    rowspanCell: function (t, e, r, n, a) {
                        t.appendChild(
                            n.create(
                                'node',
                                'mpadded',
                                [
                                    this.cellBlock(e, s.default.copyNode(r, n), n, a),
                                    this.topRowTable(r, n),
                                ],
                                { height: 0, depth: 0, voffset: 'height' },
                            ),
                        );
                    },
                    left: function (t, e, r, n, a) {
                        var i, s, l;
                        void 0 === a && (a = ''),
                            t.attributes.set(
                                'columnalign',
                                'right ' + (t.attributes.get('columnalign') || ''),
                            ),
                            t.attributes.set(
                                'columnspacing',
                                '0em ' + (t.attributes.get('columnspacing') || ''),
                            );
                        try {
                            for (
                                var c = o(t.childNodes.slice(0).reverse()), u = c.next();
                                !u.done;
                                u = c.next()
                            ) {
                                var d = u.value;
                                (l = n.create('node', 'mtd')),
                                    d.childNodes.unshift(l),
                                    (l.parent = d),
                                    d.isKind('mlabeledtr') &&
                                        ((d.childNodes[0] = d.childNodes[1]),
                                        (d.childNodes[1] = l));
                            }
                        } catch (t) {
                            i = { error: t };
                        } finally {
                            try {
                                u && !u.done && (s = c.return) && s.call(c);
                            } finally {
                                if (i) throw i.error;
                            }
                        }
                        this.rowspanCell(l, r, e, n, a);
                    },
                    right: function (t, r, n, a, o) {
                        void 0 === o && (o = ''),
                            0 === t.childNodes.length && t.appendChild(a.create('node', 'mtr'));
                        for (
                            var i = e.EmpheqUtil.columnCount(t), s = t.childNodes[0];
                            s.childNodes.length < i;

                        )
                            s.appendChild(a.create('node', 'mtd'));
                        var l = s.appendChild(a.create('node', 'mtd'));
                        e.EmpheqUtil.rowspanCell(l, n, r, a, o),
                            t.attributes.set(
                                'columnalign',
                                (t.attributes.get('columnalign') || '')
                                    .split(/ /)
                                    .slice(0, i)
                                    .join(' ') + ' left',
                            ),
                            t.attributes.set(
                                'columnspacing',
                                (t.attributes.get('columnspacing') || '')
                                    .split(/ /)
                                    .slice(0, i - 1)
                                    .join(' ') + ' 0em',
                            );
                    },
                    adjustTable: function (t, e) {
                        var r = t.getProperty('left'),
                            n = t.getProperty('right');
                        if (r || n) {
                            var a = t.Last,
                                o = s.default.copyNode(a, e);
                            r && this.left(a, o, r, e), n && this.right(a, o, n, e);
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
                    checkEnv: function (t) {
                        return this.allowEnv.hasOwnProperty(t.replace(/\*$/, '')) || !1;
                    },
                };
            },
            4272: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.EncloseConfiguration = e.EncloseMethods = e.ENCLOSE_OPTIONS = void 0);
                var a = r(251),
                    o = r(5871),
                    i = n(r(7398));
                (e.ENCLOSE_OPTIONS = {
                    'data-arrowhead': 1,
                    color: 1,
                    mathcolor: 1,
                    background: 1,
                    mathbackground: 1,
                    'data-padding': 1,
                    'data-thickness': 1,
                }),
                    (e.EncloseMethods = {}),
                    (e.EncloseMethods.Enclose = function (t, r) {
                        var n = t.GetArgument(r).replace(/,/g, ' '),
                            a = t.GetBrackets(r, ''),
                            o = t.ParseArg(r),
                            s = i.default.keyvalOptions(a, e.ENCLOSE_OPTIONS);
                        (s.notation = n), t.Push(t.create('node', 'menclose', [o], s));
                    }),
                    new o.CommandMap('enclose', { enclose: 'Enclose' }, e.EncloseMethods),
                    (e.EncloseConfiguration = a.Configuration.create('enclose', {
                        handler: { macro: ['enclose'] },
                    }));
            },
            3646: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.ExtpfeilConfiguration = e.ExtpfeilMethods = void 0);
                var a = r(251),
                    o = r(5871),
                    i = r(8016),
                    s = n(r(4406)),
                    l = r(2048),
                    c = n(r(3402));
                (e.ExtpfeilMethods = {}),
                    (e.ExtpfeilMethods.xArrow = i.AmsMethods.xArrow),
                    (e.ExtpfeilMethods.NewExtArrow = function (t, r) {
                        var n = t.GetArgument(r),
                            a = t.GetArgument(r),
                            o = t.GetArgument(r);
                        if (!n.match(/^\\([a-z]+|.)$/i))
                            throw new c.default(
                                'NewextarrowArg1',
                                'First argument to %1 must be a control sequence name',
                                r,
                            );
                        if (!a.match(/^(\d+),(\d+)$/))
                            throw new c.default(
                                'NewextarrowArg2',
                                'Second argument to %1 must be two integers separated by a comma',
                                r,
                            );
                        if (!o.match(/^(\d+|0x[0-9A-F]+)$/i))
                            throw new c.default(
                                'NewextarrowArg3',
                                'Third argument to %1 must be a unicode character number',
                                r,
                            );
                        n = n.substr(1);
                        var i = a.split(',');
                        s.default.addMacro(t, n, e.ExtpfeilMethods.xArrow, [
                            parseInt(o),
                            parseInt(i[0]),
                            parseInt(i[1]),
                        ]);
                    }),
                    new o.CommandMap(
                        'extpfeil',
                        {
                            xtwoheadrightarrow: ['xArrow', 8608, 12, 16],
                            xtwoheadleftarrow: ['xArrow', 8606, 17, 13],
                            xmapsto: ['xArrow', 8614, 6, 7],
                            xlongequal: ['xArrow', 61, 7, 7],
                            xtofrom: ['xArrow', 8644, 12, 12],
                            Newextarrow: 'NewExtArrow',
                        },
                        e.ExtpfeilMethods,
                    );
                e.ExtpfeilConfiguration = a.Configuration.create('extpfeil', {
                    handler: { macro: ['extpfeil'] },
                    init: function (t) {
                        l.NewcommandConfiguration.init(t);
                    },
                });
            },
            2082: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.GensymbConfiguration = void 0);
                var n = r(251),
                    a = r(6108);
                new (r(5871).CharacterMap)(
                    'gensymb-symbols',
                    function (t, e) {
                        var r = e.attributes || {};
                        (r.mathvariant = a.TexConstant.Variant.NORMAL), (r.class = 'MathML-Unit');
                        var n = t.create('token', 'mi', r, e.char);
                        t.Push(n);
                    },
                    {
                        ohm: '\u2126',
                        degree: '\xb0',
                        celsius: '\u2103',
                        perthousand: '\u2030',
                        micro: '\xb5',
                    },
                ),
                    (e.GensymbConfiguration = n.Configuration.create('gensymb', {
                        handler: { macro: ['gensymb-symbols'] },
                    }));
            },
            1738: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.HtmlConfiguration = void 0);
                var a = r(251),
                    o = r(5871),
                    i = n(r(6248));
                new o.CommandMap(
                    'html_macros',
                    { href: 'Href', class: 'Class', style: 'Style', cssId: 'Id' },
                    i.default,
                ),
                    (e.HtmlConfiguration = a.Configuration.create('html', {
                        handler: { macro: ['html_macros'] },
                    }));
            },
            6248: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var a = n(r(4748)),
                    o = {
                        Href: function (t, e) {
                            var r = t.GetArgument(e),
                                n = i(t, e);
                            a.default.setAttribute(n, 'href', r), t.Push(n);
                        },
                        Class: function (t, e) {
                            var r = t.GetArgument(e),
                                n = i(t, e),
                                o = a.default.getAttribute(n, 'class');
                            o && (r = o + ' ' + r),
                                a.default.setAttribute(n, 'class', r),
                                t.Push(n);
                        },
                        Style: function (t, e) {
                            var r = t.GetArgument(e),
                                n = i(t, e),
                                o = a.default.getAttribute(n, 'style');
                            o && (';' !== r.charAt(r.length - 1) && (r += ';'), (r = o + ' ' + r)),
                                a.default.setAttribute(n, 'style', r),
                                t.Push(n);
                        },
                        Id: function (t, e) {
                            var r = t.GetArgument(e),
                                n = i(t, e);
                            a.default.setAttribute(n, 'id', r), t.Push(n);
                        },
                    },
                    i = function (t, e) {
                        var r = t.ParseArg(e);
                        if (!a.default.isInferred(r)) return r;
                        var n = a.default.getChildren(r);
                        if (1 === n.length) return n[0];
                        var o = t.create('node', 'mrow');
                        return a.default.copyChildren(r, o), a.default.copyAttributes(r, o), o;
                    };
                e.default = o;
            },
            205: function (t, e, r) {
                var n,
                    a =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MathtoolsConfiguration = e.fixPrescripts = e.PAIREDDELIMS = void 0);
                var i = r(251),
                    s = r(5871),
                    l = o(r(4748)),
                    c = r(5074);
                r(8926);
                var u = r(5262),
                    d = r(3298),
                    p = r(144);
                function f(t) {
                    var e,
                        r,
                        n,
                        o,
                        i,
                        s,
                        c = t.data;
                    try {
                        for (
                            var u = a(c.getList('mmultiscripts')), d = u.next();
                            !d.done;
                            d = u.next()
                        ) {
                            var p = d.value;
                            if (p.getProperty('fixPrescript')) {
                                var f = l.default.getChildren(p),
                                    m = 0;
                                try {
                                    for (
                                        var h = ((n = void 0), a([1, 2])), g = h.next();
                                        !g.done;
                                        g = h.next()
                                    ) {
                                        f[(x = g.value)] ||
                                            (l.default.setChild(
                                                p,
                                                x,
                                                c.nodeFactory.create('node', 'none'),
                                            ),
                                            m++);
                                    }
                                } catch (t) {
                                    n = { error: t };
                                } finally {
                                    try {
                                        g && !g.done && (o = h.return) && o.call(h);
                                    } finally {
                                        if (n) throw n.error;
                                    }
                                }
                                try {
                                    for (
                                        var v = ((i = void 0), a([4, 5])), y = v.next();
                                        !y.done;
                                        y = v.next()
                                    ) {
                                        var x = y.value;
                                        l.default.isType(f[x], 'mrow') &&
                                            0 === l.default.getChildren(f[x]).length &&
                                            l.default.setChild(
                                                p,
                                                x,
                                                c.nodeFactory.create('node', 'none'),
                                            );
                                    }
                                } catch (t) {
                                    i = { error: t };
                                } finally {
                                    try {
                                        y && !y.done && (s = v.return) && s.call(v);
                                    } finally {
                                        if (i) throw i.error;
                                    }
                                }
                                2 === m && f.splice(1, 2);
                            }
                        }
                    } catch (t) {
                        e = { error: t };
                    } finally {
                        try {
                            d && !d.done && (r = u.return) && r.call(u);
                        } finally {
                            if (e) throw e.error;
                        }
                    }
                }
                (e.PAIREDDELIMS = 'mathtools-paired-delims'),
                    (e.fixPrescripts = f),
                    (e.MathtoolsConfiguration = i.Configuration.create('mathtools', {
                        handler: {
                            macro: ['mathtools-macros', 'mathtools-delimiters'],
                            environment: ['mathtools-environments'],
                            delimiter: ['mathtools-delimiters'],
                            character: ['mathtools-characters'],
                        },
                        items: ((n = {}), (n[p.MultlinedItem.prototype.kind] = p.MultlinedItem), n),
                        init: function (t) {
                            new s.CommandMap(e.PAIREDDELIMS, {}, {}),
                                t.append(
                                    i.Configuration.local({
                                        handler: { macro: [e.PAIREDDELIMS] },
                                        priority: -5,
                                    }),
                                );
                        },
                        config: function (t, e) {
                            var r,
                                n,
                                o = e.parseOptions,
                                i = o.options.mathtools.pairedDelimiters;
                            try {
                                for (
                                    var s = a(Object.keys(i)), l = s.next();
                                    !l.done;
                                    l = s.next()
                                ) {
                                    var c = l.value;
                                    u.MathtoolsUtil.addPairedDelims(o, c, i[c]);
                                }
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    l && !l.done && (n = s.return) && n.call(s);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                            (0, d.MathtoolsTagFormat)(t, e);
                        },
                        postprocessors: [[f, -6]],
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
                                pairedDelimiters: (0, c.expandable)({}),
                                tagforms: (0, c.expandable)({}),
                            },
                        },
                    }));
            },
            144: function (t, e, r) {
                var n,
                    a =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                n(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MultlinedItem = void 0);
                var i = r(7971),
                    s = o(r(4748)),
                    l = r(6108),
                    c = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            a(e, t),
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
                                        r = e.multlinegap,
                                        n = e['firstline-afterskip'] || r,
                                        a = e['lastline-preskip'] || r,
                                        o = s.default.getChildren(this.table[0])[0];
                                    s.default.getAttribute(o, 'columnalign') !==
                                        l.TexConstant.Align.RIGHT &&
                                        o.appendChild(
                                            this.create('node', 'mspace', [], { width: n }),
                                        );
                                    var i = s.default.getChildren(
                                        this.table[this.table.length - 1],
                                    )[0];
                                    if (
                                        s.default.getAttribute(i, 'columnalign') !==
                                        l.TexConstant.Align.LEFT
                                    ) {
                                        var c = s.default.getChildren(i)[0];
                                        c.childNodes.unshift(null);
                                        var u = this.create('node', 'mspace', [], { width: a });
                                        s.default.setChild(c, 0, u);
                                    }
                                }
                                t.prototype.EndTable.call(this);
                            }),
                            e
                        );
                    })(i.MultlineItem);
                e.MultlinedItem = c;
            },
            8926: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var a = n(r(4945)),
                    o = r(5871),
                    i = r(6108),
                    s = r(2178);
                new o.CommandMap(
                    'mathtools-macros',
                    {
                        shoveleft: ['HandleShove', i.TexConstant.Align.LEFT],
                        shoveright: ['HandleShove', i.TexConstant.Align.RIGHT],
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
                    s.MathtoolsMethods,
                ),
                    new o.EnvironmentMap(
                        'mathtools-environments',
                        a.default.environment,
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
                        s.MathtoolsMethods,
                    ),
                    new o.DelimiterMap('mathtools-delimiters', a.default.delimiter, {
                        '\\lparen': '(',
                        '\\rparen': ')',
                    }),
                    new o.CommandMap(
                        'mathtools-characters',
                        { ':': ['CenterColon', !0] },
                        s.MathtoolsMethods,
                    );
            },
            2178: function (t, e, r) {
                var n =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (n =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, r = 1, n = arguments.length; r < n; r++)
                                            for (var a in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, a) &&
                                                    (t[a] = e[a]);
                                        return t;
                                    }),
                                n.apply(this, arguments)
                            );
                        },
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                a,
                                o = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                a = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (a) throw a.error;
                                }
                            }
                            return i;
                        },
                    o =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MathtoolsMethods = void 0);
                var s = i(r(7398)),
                    l = r(8016),
                    c = i(r(7360)),
                    u = i(r(2193)),
                    d = i(r(3402)),
                    p = i(r(4748)),
                    f = r(2955),
                    m = r(1230),
                    h = r(5074),
                    g = i(r(4406)),
                    v = i(r(1107)),
                    y = r(5262);
                e.MathtoolsMethods = {
                    MtMatrix: function (t, r, n, a) {
                        var o = t.GetBrackets('\\begin{'.concat(r.getName(), '}'), 'c');
                        return e.MathtoolsMethods.Array(t, r, n, a, o);
                    },
                    MtSmallMatrix: function (t, r, n, a, o) {
                        return (
                            o ||
                                (o = t.GetBrackets(
                                    '\\begin{'.concat(r.getName(), '}'),
                                    t.options.mathtools['smallmatrix-align'],
                                )),
                            e.MathtoolsMethods.Array(
                                t,
                                r,
                                n,
                                a,
                                o,
                                s.default.Em(1 / 3),
                                '.2em',
                                'S',
                                1,
                            )
                        );
                    },
                    MtMultlined: function (t, e) {
                        var r,
                            n = '\\begin{'.concat(e.getName(), '}'),
                            o = t.GetBrackets(n, t.options.mathtools['multlined-pos'] || 'c'),
                            i = o ? t.GetBrackets(n, '') : '';
                        o && !o.match(/^[cbt]$/) && ((i = (r = a([o, i], 2))[0]), (o = r[1])),
                            t.Push(e);
                        var l = t.itemFactory.create('multlined', t, e);
                        return (
                            (l.arraydef = {
                                displaystyle: !0,
                                rowspacing: '.5em',
                                width: i || 'auto',
                                columnwidth: '100%',
                            }),
                            s.default.setArrayAlign(l, o || 'c')
                        );
                    },
                    HandleShove: function (t, e, r) {
                        var n = t.stack.Top();
                        if ('multline' !== n.kind && 'multlined' !== n.kind)
                            throw new d.default(
                                'CommandInMultlined',
                                '%1 can only appear within the multline or multlined environments',
                                e,
                            );
                        if (n.Size())
                            throw new d.default(
                                'CommandAtTheBeginingOfLine',
                                '%1 must come at the beginning of the line',
                                e,
                            );
                        n.setProperty('shove', r);
                        var a = t.GetBrackets(e),
                            o = t.ParseArg(e);
                        if (a) {
                            var i = t.create('node', 'mrow', []),
                                s = t.create('node', 'mspace', [], { width: a });
                            'left' === r
                                ? (i.appendChild(s), i.appendChild(o))
                                : (i.appendChild(o), i.appendChild(s)),
                                (o = i);
                        }
                        t.Push(o);
                    },
                    SpreadLines: function (t, e) {
                        var r, n;
                        if (t.stack.env.closing === e.getName()) {
                            delete t.stack.env.closing;
                            var a = t.stack.Pop(),
                                i = a.toMml(),
                                s = a.getProperty('spread');
                            if (i.isInferred)
                                try {
                                    for (
                                        var l = o(p.default.getChildren(i)), c = l.next();
                                        !c.done;
                                        c = l.next()
                                    ) {
                                        var u = c.value;
                                        y.MathtoolsUtil.spreadLines(u, s);
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        c && !c.done && (n = l.return) && n.call(l);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                            else y.MathtoolsUtil.spreadLines(i, s);
                            t.Push(i);
                        } else {
                            s = t.GetDimen('\\begin{'.concat(e.getName(), '}'));
                            e.setProperty('spread', s), t.Push(e);
                        }
                    },
                    Cases: function (t, e, r, n, a) {
                        var o = t.itemFactory.create('array').setProperty('casesEnv', e.getName());
                        return (
                            (o.arraydef = {
                                rowspacing: '.2em',
                                columnspacing: '1em',
                                columnalign: 'left',
                            }),
                            'D' === a && (o.arraydef.displaystyle = !0),
                            o.setProperties({ open: r, close: n }),
                            t.Push(e),
                            o
                        );
                    },
                    MathLap: function (t, e, r, a) {
                        var o = t.GetBrackets(e, '').trim(),
                            i = t.create(
                                'node',
                                'mstyle',
                                [
                                    t.create(
                                        'node',
                                        'mpadded',
                                        [t.ParseArg(e)],
                                        n(
                                            { width: 0 },
                                            'r' === r
                                                ? {}
                                                : { lspace: 'l' === r ? '-1width' : '-.5width' },
                                        ),
                                    ),
                                ],
                                { 'data-cramped': a },
                            );
                        y.MathtoolsUtil.setDisplayLevel(i, o),
                            t.Push(t.create('node', 'TeXAtom', [i]));
                    },
                    Cramped: function (t, e) {
                        var r = t.GetBrackets(e, '').trim(),
                            n = t.ParseArg(e),
                            a = t.create('node', 'mstyle', [n], { 'data-cramped': !0 });
                        y.MathtoolsUtil.setDisplayLevel(a, r), t.Push(a);
                    },
                    MtLap: function (t, e, r) {
                        var n = s.default.internalMath(t, t.GetArgument(e), 0),
                            a = t.create('node', 'mpadded', n, { width: 0 });
                        'r' !== r &&
                            p.default.setAttribute(a, 'lspace', 'l' === r ? '-1width' : '-.5width'),
                            t.Push(a);
                    },
                    MathMakeBox: function (t, e) {
                        var r = t.GetBrackets(e),
                            n = t.GetBrackets(e, 'c'),
                            a = t.create('node', 'mpadded', [t.ParseArg(e)]);
                        r && p.default.setAttribute(a, 'width', r);
                        var o = (0, h.lookup)(n, { c: 'center', r: 'right' }, '');
                        o && p.default.setAttribute(a, 'data-align', o), t.Push(a);
                    },
                    MathMBox: function (t, e) {
                        t.Push(t.create('node', 'mrow', [t.ParseArg(e)]));
                    },
                    UnderOverBracket: function (t, e) {
                        var r = (0, m.length2em)(t.GetBrackets(e, '.1em'), 0.1),
                            n = t.GetBrackets(e, '.2em'),
                            o = t.GetArgument(e),
                            i = a(
                                'o' === e.charAt(1)
                                    ? ['over', 'accent', 'bottom']
                                    : ['under', 'accentunder', 'top'],
                                3,
                            ),
                            l = i[0],
                            c = i[1],
                            d = i[2],
                            f = (0, m.em)(r),
                            h = new u.default(o, t.stack.env, t.configuration).mml(),
                            g = new u.default(o, t.stack.env, t.configuration).mml(),
                            v = t.create('node', 'mpadded', [t.create('node', 'mphantom', [g])], {
                                style: 'border: '.concat(f, ' solid; border-').concat(d, ': none'),
                                height: n,
                                depth: 0,
                            }),
                            y = s.default.underOver(t, h, v, l, !0),
                            x = p.default.getChildAt(p.default.getChildAt(y, 0), 0);
                        p.default.setAttribute(x, c, !0), t.Push(y);
                    },
                    Aboxed: function (t, e) {
                        var r = y.MathtoolsUtil.checkAlignment(t, e);
                        r.row.length % 2 == 1 && r.row.push(t.create('node', 'mtd', []));
                        var n = t.GetArgument(e),
                            a = t.string.substr(t.i);
                        (t.string = n + '&&\\endAboxed'), (t.i = 0);
                        var o = t.GetUpTo(e, '&'),
                            i = t.GetUpTo(e, '&');
                        t.GetUpTo(e, '\\endAboxed');
                        var l = s.default.substituteArgs(
                            t,
                            [o, i],
                            '\\rlap{\\boxed{#1{}#2}}\\kern.267em\\phantom{#1}&\\phantom{{}#2}\\kern.267em',
                        );
                        (t.string = l + a), (t.i = 0);
                    },
                    ArrowBetweenLines: function (t, e) {
                        var r = y.MathtoolsUtil.checkAlignment(t, e);
                        if (r.Size() || r.row.length)
                            throw new d.default('BetweenLines', '%1 must be on a row by itself', e);
                        var n = t.GetStar(),
                            a = t.GetBrackets(e, '\\Updownarrow');
                        n && (r.EndEntry(), r.EndEntry());
                        var o = n ? '\\quad' + a : a + '\\quad',
                            i = new u.default(o, t.stack.env, t.configuration).mml();
                        t.Push(i), r.EndEntry(), r.EndRow();
                    },
                    VDotsWithin: function (t, e) {
                        var r = t.stack.Top(),
                            a = r.getProperty('flushspaceabove') === r.table.length,
                            o = '\\mmlToken{mi}{}' + t.GetArgument(e) + '\\mmlToken{mi}{}',
                            i = new u.default(o, t.stack.env, t.configuration).mml(),
                            s = t.create(
                                'node',
                                'mpadded',
                                [
                                    t.create(
                                        'node',
                                        'mpadded',
                                        [t.create('node', 'mo', [t.create('text', '\u22ee')])],
                                        n(
                                            { width: 0, lspace: '-.5width' },
                                            a ? { height: '-.6em', voffset: '-.18em' } : {},
                                        ),
                                    ),
                                    t.create('node', 'mphantom', [i]),
                                ],
                                { lspace: '.5width' },
                            );
                        t.Push(s);
                    },
                    ShortVDotsWithin: function (t, r) {
                        var n = t.stack.Top(),
                            a = t.GetStar();
                        e.MathtoolsMethods.FlushSpaceAbove(t, '\\MTFlushSpaceAbove'),
                            !a && n.EndEntry(),
                            e.MathtoolsMethods.VDotsWithin(t, '\\vdotswithin'),
                            a && n.EndEntry(),
                            e.MathtoolsMethods.FlushSpaceBelow(t, '\\MTFlushSpaceBelow');
                    },
                    FlushSpaceAbove: function (t, e) {
                        var r = y.MathtoolsUtil.checkAlignment(t, e);
                        r.setProperty('flushspaceabove', r.table.length),
                            r.addRowSpacing('-' + t.options.mathtools.shortvdotsadjustabove);
                    },
                    FlushSpaceBelow: function (t, e) {
                        var r = y.MathtoolsUtil.checkAlignment(t, e);
                        r.Size() && r.EndEntry(),
                            r.EndRow(),
                            r.addRowSpacing('-' + t.options.mathtools.shortvdotsadjustbelow);
                    },
                    PairedDelimiters: function (t, e, r, n, o, i, l, c) {
                        void 0 === o && (o = '#1'),
                            void 0 === i && (i = 1),
                            void 0 === l && (l = ''),
                            void 0 === c && (c = '');
                        var u = t.GetStar(),
                            d = u ? '' : t.GetBrackets(e),
                            p = a(u ? ['\\left', '\\right'] : d ? [d + 'l', d + 'r'] : ['', ''], 2),
                            f = p[0],
                            m = p[1],
                            h = u ? '\\middle' : d || '';
                        if (i) {
                            for (var g = [], v = g.length; v < i; v++) g.push(t.GetArgument(e));
                            (l = s.default.substituteArgs(t, g, l)),
                                (o = s.default.substituteArgs(t, g, o)),
                                (c = s.default.substituteArgs(t, g, c));
                        }
                        (o = o.replace(/\\delimsize/g, h)),
                            (t.string = [l, f, r, o, m, n, c, t.string.substr(t.i)].reduce(
                                function (e, r) {
                                    return s.default.addArgs(t, e, r);
                                },
                                '',
                            )),
                            (t.i = 0),
                            s.default.checkMaxMacros(t);
                    },
                    DeclarePairedDelimiter: function (t, e) {
                        var r = g.default.GetCsNameArgument(t, e),
                            n = t.GetArgument(e),
                            a = t.GetArgument(e);
                        y.MathtoolsUtil.addPairedDelims(t.configuration, r, [n, a]);
                    },
                    DeclarePairedDelimiterX: function (t, e) {
                        var r = g.default.GetCsNameArgument(t, e),
                            n = g.default.GetArgCount(t, e),
                            a = t.GetArgument(e),
                            o = t.GetArgument(e),
                            i = t.GetArgument(e);
                        y.MathtoolsUtil.addPairedDelims(t.configuration, r, [a, o, i, n]);
                    },
                    DeclarePairedDelimiterXPP: function (t, e) {
                        var r = g.default.GetCsNameArgument(t, e),
                            n = g.default.GetArgCount(t, e),
                            a = t.GetArgument(e),
                            o = t.GetArgument(e),
                            i = t.GetArgument(e),
                            s = t.GetArgument(e),
                            l = t.GetArgument(e);
                        y.MathtoolsUtil.addPairedDelims(t.configuration, r, [o, i, l, n, a, s]);
                    },
                    CenterColon: function (t, e, r, a, o) {
                        void 0 === a && (a = !1), void 0 === o && (o = !1);
                        var i = t.options.mathtools,
                            s = t.create('token', 'mo', {}, ':');
                        if (r && (i.centercolon || a)) {
                            var l = i['centercolon-offset'];
                            s = t.create(
                                'node',
                                'mpadded',
                                [s],
                                n(
                                    { voffset: l, height: '+'.concat(l), depth: '-'.concat(l) },
                                    o
                                        ? { width: i['thincolon-dw'], lspace: i['thincolon-dx'] }
                                        : {},
                                ),
                            );
                        }
                        t.Push(s);
                    },
                    Relation: function (t, e, r, n) {
                        t.options.mathtools['use-unicode'] && n
                            ? t.Push(t.create('token', 'mo', { texClass: f.TEXCLASS.REL }, n))
                            : ((r =
                                  '\\mathrel{' +
                                  r.replace(/:/g, '\\MTThinColon').replace(/-/g, '\\mathrel{-}') +
                                  '}'),
                              (t.string = s.default.addArgs(t, r, t.string.substr(t.i))),
                              (t.i = 0));
                    },
                    NArrow: function (t, e, r, n) {
                        t.Push(
                            t.create(
                                'node',
                                'TeXAtom',
                                [
                                    t.create('token', 'mtext', {}, r),
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
                                                { width: 0, lspace: '-.5width', voffset: n },
                                            ),
                                            t.create('node', 'mphantom', [
                                                t.create('token', 'mtext', {}, r),
                                            ]),
                                        ],
                                        { width: 0, lspace: '-.5width' },
                                    ),
                                ],
                                { texClass: f.TEXCLASS.REL },
                            ),
                        );
                    },
                    SplitFrac: function (t, e, r) {
                        var n = t.ParseArg(e),
                            a = t.ParseArg(e);
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
                                                    n,
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
                                                    a,
                                                ],
                                                { scriptlevel: 0 },
                                            ),
                                        ],
                                        { linethickness: 0, numalign: 'left', denomalign: 'right' },
                                    ),
                                ],
                                { displaystyle: r, scriptlevel: 0 },
                            ),
                        );
                    },
                    XMathStrut: function (t, e) {
                        var r = t.GetBrackets(e),
                            n = t.GetArgument(e);
                        (n = y.MathtoolsUtil.plusOrMinus(e, n)),
                            (r = y.MathtoolsUtil.plusOrMinus(e, r || n)),
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
                                            { width: 0, height: n + 'height', depth: r + 'depth' },
                                        ),
                                    ],
                                    { texClass: f.TEXCLASS.ORD },
                                ),
                            );
                    },
                    Prescript: function (t, e) {
                        var r = y.MathtoolsUtil.getScript(t, e, 'sup'),
                            n = y.MathtoolsUtil.getScript(t, e, 'sub'),
                            a = y.MathtoolsUtil.getScript(t, e, 'arg');
                        if (p.default.isType(r, 'none') && p.default.isType(n, 'none')) t.Push(a);
                        else {
                            var o = t.create('node', 'mmultiscripts', [a]);
                            p.default.getChildren(o).push(null, null),
                                p.default.appendChildren(o, [
                                    t.create('node', 'mprescripts'),
                                    n,
                                    r,
                                ]),
                                o.setProperty('fixPrescript', !0),
                                t.Push(o);
                        }
                    },
                    NewTagForm: function (t, e, r) {
                        void 0 === r && (r = !1);
                        var n = t.tags;
                        if (!('mtFormats' in n))
                            throw new d.default(
                                'TagsNotMT',
                                '%1 can only be used with ams or mathtools tags',
                                e,
                            );
                        var a = t.GetArgument(e).trim();
                        if (!a)
                            throw new d.default('InvalidTagFormID', "Tag form name can't be empty");
                        var o = t.GetBrackets(e, ''),
                            i = t.GetArgument(e),
                            s = t.GetArgument(e);
                        if (!r && n.mtFormats.has(a))
                            throw new d.default('DuplicateTagForm', 'Duplicate tag form: %1', a);
                        n.mtFormats.set(a, [i, s, o]);
                    },
                    UseTagForm: function (t, e) {
                        var r = t.tags;
                        if (!('mtFormats' in r))
                            throw new d.default(
                                'TagsNotMT',
                                '%1 can only be used with ams or mathtools tags',
                                e,
                            );
                        var n = t.GetArgument(e).trim();
                        if (n) {
                            if (!r.mtFormats.has(n))
                                throw new d.default(
                                    'UndefinedTagForm',
                                    'Undefined tag form: %1',
                                    n,
                                );
                            r.mtCurrent = r.mtFormats.get(n);
                        } else r.mtCurrent = null;
                    },
                    SetOptions: function (t, e) {
                        var r,
                            n,
                            a = t.options.mathtools;
                        if (!a['allow-mathtoolsset'])
                            throw new d.default('ForbiddenMathtoolsSet', '%1 is disabled', e);
                        var i = {};
                        Object.keys(a).forEach(function (t) {
                            'pariedDelimiters' !== t &&
                                'tagforms' !== t &&
                                'allow-mathtoolsset' !== t &&
                                (i[t] = 1);
                        });
                        var l = t.GetArgument(e),
                            c = s.default.keyvalOptions(l, i, !0);
                        try {
                            for (var u = o(Object.keys(c)), p = u.next(); !p.done; p = u.next()) {
                                var f = p.value;
                                a[f] = c[f];
                            }
                        } catch (t) {
                            r = { error: t };
                        } finally {
                            try {
                                p && !p.done && (n = u.return) && n.call(u);
                            } finally {
                                if (r) throw r.error;
                            }
                        }
                    },
                    Array: c.default.Array,
                    Macro: c.default.Macro,
                    xArrow: l.AmsMethods.xArrow,
                    HandleRef: l.AmsMethods.HandleRef,
                    AmsEqnArray: l.AmsMethods.AmsEqnArray,
                    MacroWithTemplate: v.default.MacroWithTemplate,
                };
            },
            3298: function (t, e, r) {
                var n,
                    a =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                n(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    o =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                a,
                                o = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                a = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (a) throw a.error;
                                }
                            }
                            return i;
                        },
                    s =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MathtoolsTagFormat = void 0);
                var l = s(r(3402)),
                    c = r(4680),
                    u = 0;
                e.MathtoolsTagFormat = function (t, e) {
                    var r = e.parseOptions.options.tags;
                    'base' !== r && t.tags.hasOwnProperty(r) && c.TagsFactory.add(r, t.tags[r]);
                    var n = (function (t) {
                            function r() {
                                var r,
                                    n,
                                    a = t.call(this) || this;
                                (a.mtFormats = new Map()), (a.mtCurrent = null);
                                var i = e.parseOptions.options.mathtools.tagforms;
                                try {
                                    for (
                                        var s = o(Object.keys(i)), c = s.next();
                                        !c.done;
                                        c = s.next()
                                    ) {
                                        var u = c.value;
                                        if (!Array.isArray(i[u]) || 3 !== i[u].length)
                                            throw new l.default(
                                                'InvalidTagFormDef',
                                                'The tag form definition for "%1" should be an array fo three strings',
                                                u,
                                            );
                                        a.mtFormats.set(u, i[u]);
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        c && !c.done && (n = s.return) && n.call(s);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                                return a;
                            }
                            return (
                                a(r, t),
                                (r.prototype.formatTag = function (e) {
                                    if (this.mtCurrent) {
                                        var r = i(this.mtCurrent, 3),
                                            n = r[0],
                                            a = r[1],
                                            o = r[2];
                                        return o
                                            ? ''.concat(n).concat(o, '{').concat(e, '}').concat(a)
                                            : ''.concat(n).concat(e).concat(a);
                                    }
                                    return t.prototype.formatTag.call(this, e);
                                }),
                                r
                            );
                        })(c.TagsFactory.create(e.parseOptions.options.tags).constructor),
                        s = 'MathtoolsTags-' + ++u;
                    c.TagsFactory.add(s, n), (e.parseOptions.options.tags = s);
                };
            },
            5262: function (t, e, r) {
                var n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                a,
                                o = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                a = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (a) throw a.error;
                                }
                            }
                            return i;
                        },
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MathtoolsUtil = void 0);
                var o = r(2935),
                    i = a(r(7398)),
                    s = a(r(2193)),
                    l = a(r(3402)),
                    c = r(4924),
                    u = r(5074),
                    d = r(2178),
                    p = r(205);
                e.MathtoolsUtil = {
                    setDisplayLevel: function (t, e) {
                        if (e) {
                            var r = n(
                                    (0, u.lookup)(
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
                                a = r[0],
                                o = r[1];
                            null !== a &&
                                (t.attributes.set('displaystyle', a),
                                t.attributes.set('scriptlevel', o));
                        }
                    },
                    checkAlignment: function (t, e) {
                        var r = t.stack.Top();
                        if (r.kind !== o.EqnArrayItem.prototype.kind)
                            throw new l.default(
                                'NotInAlignment',
                                '%1 can only be used in aligment environments',
                                e,
                            );
                        return r;
                    },
                    addPairedDelims: function (t, e, r) {
                        t.handlers
                            .retrieve(p.PAIREDDELIMS)
                            .add(e, new c.Macro(e, d.MathtoolsMethods.PairedDelimiters, r));
                    },
                    spreadLines: function (t, e) {
                        if (t.isKind('mtable')) {
                            var r = t.attributes.get('rowspacing');
                            if (r) {
                                var n = i.default.dimen2em(e);
                                r = r
                                    .split(/ /)
                                    .map(function (t) {
                                        return i.default.Em(Math.max(0, i.default.dimen2em(t) + n));
                                    })
                                    .join(' ');
                            } else r = e;
                            t.attributes.set('rowspacing', r);
                        }
                    },
                    plusOrMinus: function (t, e) {
                        if (!(e = e.trim()).match(/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/))
                            throw new l.default('NotANumber', 'Argument to %1 is not a number', t);
                        return e.match(/^[-+]/) ? e : '+' + e;
                    },
                    getScript: function (t, e, r) {
                        var n = i.default.trimSpaces(t.GetArgument(e));
                        if ('' === n) return t.create('node', 'none');
                        var a = t.options.mathtools['prescript-'.concat(r, '-format')];
                        return (
                            a && (n = ''.concat(a, '{').concat(n, '}')),
                            new s.default(n, t.stack.env, t.configuration).mml()
                        );
                    },
                };
            },
            7078: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MhchemConfiguration = void 0);
                var a = r(251),
                    o = r(5871),
                    i = n(r(3402)),
                    s = n(r(7360)),
                    l = r(8016),
                    c = r(4652),
                    u = {};
                (u.Macro = s.default.Macro),
                    (u.xArrow = l.AmsMethods.xArrow),
                    (u.Machine = function (t, e, r) {
                        var n,
                            a = t.GetArgument(e);
                        try {
                            n = c.mhchemParser.toTex(a, r);
                        } catch (t) {
                            throw new i.default(t[0], t[1]);
                        }
                        (t.string = n + t.string.substr(t.i)), (t.i = 0);
                    }),
                    new o.CommandMap(
                        'mhchem',
                        {
                            ce: ['Machine', 'ce'],
                            pu: ['Machine', 'pu'],
                            longrightleftharpoons: [
                                'Macro',
                                '\\stackrel{\\textstyle{-}\\!\\!{\\rightharpoonup}}{\\smash{{\\leftharpoondown}\\!\\!{-}}}',
                            ],
                            longRightleftharpoons: [
                                'Macro',
                                '\\stackrel{\\textstyle{-}\\!\\!{\\rightharpoonup}}{\\smash{\\leftharpoondown}}',
                            ],
                            longLeftrightharpoons: [
                                'Macro',
                                '\\stackrel{\\textstyle\\vphantom{{-}}{\\rightharpoonup}}{\\smash{{\\leftharpoondown}\\!\\!{-}}}',
                            ],
                            longleftrightarrows: [
                                'Macro',
                                '\\stackrel{\\longrightarrow}{\\smash{\\longleftarrow}\\Rule{0px}{.25em}{0px}}',
                            ],
                            tripledash: [
                                'Macro',
                                '\\vphantom{-}\\raise2mu{\\kern2mu\\tiny\\text{-}\\kern1mu\\text{-}\\kern1mu\\text{-}\\kern2mu}',
                            ],
                            xleftrightarrow: ['xArrow', 8596, 6, 6],
                            xrightleftharpoons: ['xArrow', 8652, 5, 7],
                            xRightleftharpoons: ['xArrow', 8652, 5, 7],
                            xLeftrightharpoons: ['xArrow', 8652, 5, 7],
                        },
                        u,
                    ),
                    (e.MhchemConfiguration = a.Configuration.create('mhchem', {
                        handler: { macro: ['mhchem'] },
                    }));
            },
            2048: function (t, e, r) {
                var n,
                    a =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, n) {
                                  void 0 === n && (n = r);
                                  var a = Object.getOwnPropertyDescriptor(e, r);
                                  (a &&
                                      !('get' in a
                                          ? !e.__esModule
                                          : a.writable || a.configurable)) ||
                                      (a = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, n, a);
                              }
                            : function (t, e, r, n) {
                                  void 0 === n && (n = r), (t[n] = e[r]);
                              }),
                    o =
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
                                for (var r in t)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(t, r) &&
                                        a(e, t, r);
                            return o(e, t), e;
                        },
                    s =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.NewcommandConfiguration = void 0);
                var l = r(251),
                    c = r(1205),
                    u = s(r(4406));
                r(9297);
                var d = s(r(4945)),
                    p = i(r(5871));
                e.NewcommandConfiguration = l.Configuration.create('newcommand', {
                    handler: { macro: ['Newcommand-macros'] },
                    items: ((n = {}), (n[c.BeginEnvItem.prototype.kind] = c.BeginEnvItem), n),
                    options: { maxMacros: 1e3 },
                    init: function (t) {
                        new p.DelimiterMap(u.default.NEW_DELIMITER, d.default.delimiter, {}),
                            new p.CommandMap(u.default.NEW_COMMAND, {}, {}),
                            new p.EnvironmentMap(
                                u.default.NEW_ENVIRONMENT,
                                d.default.environment,
                                {},
                                {},
                            ),
                            t.append(
                                l.Configuration.local({
                                    handler: {
                                        character: [],
                                        delimiter: [u.default.NEW_DELIMITER],
                                        macro: [u.default.NEW_DELIMITER, u.default.NEW_COMMAND],
                                        environment: [u.default.NEW_ENVIRONMENT],
                                    },
                                    priority: -1,
                                }),
                            );
                    },
                });
            },
            1205: function (t, e, r) {
                var n,
                    a =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                n(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.BeginEnvItem = void 0);
                var i = o(r(3402)),
                    s = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            a(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'beginEnv';
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
                                if (e.isKind('end')) {
                                    if (e.getName() !== this.getName())
                                        throw new i.default(
                                            'EnvBadEnd',
                                            '\\begin{%1} ended with \\end{%2}',
                                            this.getName(),
                                            e.getName(),
                                        );
                                    return [[this.factory.create('mml', this.toMml())], !0];
                                }
                                if (e.isKind('stop'))
                                    throw new i.default(
                                        'EnvMissingEnd',
                                        'Missing \\end{%1}',
                                        this.getName(),
                                    );
                                return t.prototype.checkItem.call(this, e);
                            }),
                            e
                        );
                    })(r(1076).BaseItem);
                e.BeginEnvItem = s;
            },
            9297: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var a = n(r(1107));
                new (r(5871).CommandMap)(
                    'Newcommand-macros',
                    {
                        newcommand: 'NewCommand',
                        renewcommand: 'NewCommand',
                        newenvironment: 'NewEnvironment',
                        renewenvironment: 'NewEnvironment',
                        def: 'MacroDef',
                        let: 'Let',
                    },
                    a.default,
                );
            },
            1107: function (t, e, r) {
                var n =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, n) {
                                  void 0 === n && (n = r);
                                  var a = Object.getOwnPropertyDescriptor(e, r);
                                  (a &&
                                      !('get' in a
                                          ? !e.__esModule
                                          : a.writable || a.configurable)) ||
                                      (a = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, n, a);
                              }
                            : function (t, e, r, n) {
                                  void 0 === n && (n = r), (t[n] = e[r]);
                              }),
                    a =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (t, e) {
                                  Object.defineProperty(t, 'default', { enumerable: !0, value: e });
                              }
                            : function (t, e) {
                                  t.default = e;
                              }),
                    o =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var r in t)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(t, r) &&
                                        n(e, t, r);
                            return a(e, t), e;
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var s = i(r(3402)),
                    l = o(r(5871)),
                    c = i(r(7360)),
                    u = i(r(7398)),
                    d = i(r(4406)),
                    p = {
                        NewCommand: function (t, e) {
                            var r = d.default.GetCsNameArgument(t, e),
                                n = d.default.GetArgCount(t, e),
                                a = t.GetBrackets(e),
                                o = t.GetArgument(e);
                            d.default.addMacro(t, r, p.Macro, [o, n, a]);
                        },
                        NewEnvironment: function (t, e) {
                            var r = u.default.trimSpaces(t.GetArgument(e)),
                                n = d.default.GetArgCount(t, e),
                                a = t.GetBrackets(e),
                                o = t.GetArgument(e),
                                i = t.GetArgument(e);
                            d.default.addEnvironment(t, r, p.BeginEnv, [!0, o, i, n, a]);
                        },
                        MacroDef: function (t, e) {
                            var r = d.default.GetCSname(t, e),
                                n = d.default.GetTemplate(t, e, '\\' + r),
                                a = t.GetArgument(e);
                            n instanceof Array
                                ? d.default.addMacro(t, r, p.MacroWithTemplate, [a].concat(n))
                                : d.default.addMacro(t, r, p.Macro, [a, n]);
                        },
                        Let: function (t, e) {
                            var r = d.default.GetCSname(t, e),
                                n = t.GetNext();
                            '=' === n && (t.i++, (n = t.GetNext()));
                            var a = t.configuration.handlers;
                            if ('\\' !== n) {
                                t.i++;
                                var o = a.get('delimiter').lookup(n);
                                o
                                    ? d.default.addDelimiter(t, '\\' + r, o.char, o.attributes)
                                    : d.default.addMacro(t, r, p.Macro, [n]);
                            } else {
                                e = d.default.GetCSname(t, e);
                                var i = a.get('delimiter').lookup('\\' + e);
                                if (i)
                                    return void d.default.addDelimiter(
                                        t,
                                        '\\' + r,
                                        i.char,
                                        i.attributes,
                                    );
                                var s = a.get('macro').applicable(e);
                                if (!s) return;
                                if (s instanceof l.MacroMap) {
                                    var c = s.lookup(e);
                                    return void d.default.addMacro(t, r, c.func, c.args, c.symbol);
                                }
                                i = s.lookup(e);
                                var u = d.default.disassembleSymbol(r, i);
                                d.default.addMacro(
                                    t,
                                    r,
                                    function (t, e) {
                                        for (var r = [], n = 2; n < arguments.length; n++)
                                            r[n - 2] = arguments[n];
                                        var a = d.default.assembleSymbol(r);
                                        return s.parser(t, a);
                                    },
                                    u,
                                );
                            }
                        },
                        MacroWithTemplate: function (t, e, r, n) {
                            for (var a = [], o = 4; o < arguments.length; o++)
                                a[o - 4] = arguments[o];
                            var i = parseInt(n, 10);
                            if (i) {
                                var l = [];
                                if ((t.GetNext(), a[0] && !d.default.MatchParam(t, a[0])))
                                    throw new s.default(
                                        'MismatchUseDef',
                                        "Use of %1 doesn't match its definition",
                                        e,
                                    );
                                for (var c = 0; c < i; c++)
                                    l.push(d.default.GetParameter(t, e, a[c + 1]));
                                r = u.default.substituteArgs(t, l, r);
                            }
                            (t.string = u.default.addArgs(t, r, t.string.slice(t.i))),
                                (t.i = 0),
                                u.default.checkMaxMacros(t);
                        },
                        BeginEnv: function (t, e, r, n, a, o) {
                            if (e.getProperty('end') && t.stack.env.closing === e.getName()) {
                                delete t.stack.env.closing;
                                var i = t.string.slice(t.i);
                                return (
                                    (t.string = n),
                                    (t.i = 0),
                                    t.Parse(),
                                    (t.string = i),
                                    (t.i = 0),
                                    t.itemFactory.create('end').setProperty('name', e.getName())
                                );
                            }
                            if (a) {
                                var s = [];
                                if (null != o) {
                                    var l = t.GetBrackets('\\begin{' + e.getName() + '}');
                                    s.push(null == l ? o : l);
                                }
                                for (var c = s.length; c < a; c++)
                                    s.push(t.GetArgument('\\begin{' + e.getName() + '}'));
                                (r = u.default.substituteArgs(t, s, r)),
                                    (n = u.default.substituteArgs(t, [], n));
                            }
                            return (
                                (t.string = u.default.addArgs(t, r, t.string.slice(t.i))),
                                (t.i = 0),
                                t.itemFactory.create('beginEnv').setProperty('name', e.getName())
                            );
                        },
                    };
                (p.Macro = c.default.Macro), (e.default = p);
            },
            4406: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var a,
                    o = n(r(7398)),
                    i = n(r(3402)),
                    s = r(4924);
                !(function (t) {
                    function e(t, e) {
                        return t.string.substr(t.i, e.length) !== e ||
                            (e.match(/\\[a-z]+$/i) &&
                                t.string.charAt(t.i + e.length).match(/[a-z]/i))
                            ? 0
                            : ((t.i += e.length), 1);
                    }
                    (t.disassembleSymbol = function (t, e) {
                        var r = [t, e.char];
                        if (e.attributes)
                            for (var n in e.attributes) r.push(n), r.push(e.attributes[n]);
                        return r;
                    }),
                        (t.assembleSymbol = function (t) {
                            for (var e = t[0], r = t[1], n = {}, a = 2; a < t.length; a += 2)
                                n[t[a]] = t[a + 1];
                            return new s.Symbol(e, r, n);
                        }),
                        (t.GetCSname = function (t, e) {
                            if ('\\' !== t.GetNext())
                                throw new i.default(
                                    'MissingCS',
                                    '%1 must be followed by a control sequence',
                                    e,
                                );
                            return o.default.trimSpaces(t.GetArgument(e)).substr(1);
                        }),
                        (t.GetCsNameArgument = function (t, e) {
                            var r = o.default.trimSpaces(t.GetArgument(e));
                            if (
                                ('\\' === r.charAt(0) && (r = r.substr(1)),
                                !r.match(/^(.|[a-z]+)$/i))
                            )
                                throw new i.default(
                                    'IllegalControlSequenceName',
                                    'Illegal control sequence name for %1',
                                    e,
                                );
                            return r;
                        }),
                        (t.GetArgCount = function (t, e) {
                            var r = t.GetBrackets(e);
                            if (r && !(r = o.default.trimSpaces(r)).match(/^[0-9]+$/))
                                throw new i.default(
                                    'IllegalParamNumber',
                                    'Illegal number of parameters specified in %1',
                                    e,
                                );
                            return r;
                        }),
                        (t.GetTemplate = function (t, e, r) {
                            for (
                                var n = t.GetNext(), a = [], o = 0, s = t.i;
                                t.i < t.string.length;

                            ) {
                                if ('#' === (n = t.GetNext())) {
                                    if (
                                        (s !== t.i && (a[o] = t.string.substr(s, t.i - s)),
                                        !(n = t.string.charAt(++t.i)).match(/^[1-9]$/))
                                    )
                                        throw new i.default(
                                            'CantUseHash2',
                                            'Illegal use of # in template for %1',
                                            r,
                                        );
                                    if (parseInt(n) !== ++o)
                                        throw new i.default(
                                            'SequentialParam',
                                            'Parameters for %1 must be numbered sequentially',
                                            r,
                                        );
                                    s = t.i + 1;
                                } else if ('{' === n)
                                    return (
                                        s !== t.i && (a[o] = t.string.substr(s, t.i - s)),
                                        a.length > 0 ? [o.toString()].concat(a) : o
                                    );
                                t.i++;
                            }
                            throw new i.default(
                                'MissingReplacementString',
                                'Missing replacement string for definition of %1',
                                e,
                            );
                        }),
                        (t.GetParameter = function (t, r, n) {
                            if (null == n) return t.GetArgument(r);
                            for (var a = t.i, o = 0, s = 0; t.i < t.string.length; ) {
                                var l = t.string.charAt(t.i);
                                if ('{' === l)
                                    t.i === a && (s = 1), t.GetArgument(r), (o = t.i - a);
                                else {
                                    if (e(t, n)) return s && (a++, (o -= 2)), t.string.substr(a, o);
                                    if ('\\' === l) {
                                        t.i++, o++, (s = 0);
                                        var c = t.string.substr(t.i).match(/[a-z]+|./i);
                                        c && ((t.i += c[0].length), (o = t.i - a));
                                    } else t.i++, o++, (s = 0);
                                }
                            }
                            throw new i.default('RunawayArgument', 'Runaway argument for %1?', r);
                        }),
                        (t.MatchParam = e),
                        (t.addDelimiter = function (e, r, n, a) {
                            e.configuration.handlers
                                .retrieve(t.NEW_DELIMITER)
                                .add(r, new s.Symbol(r, n, a));
                        }),
                        (t.addMacro = function (e, r, n, a, o) {
                            void 0 === o && (o = ''),
                                e.configuration.handlers
                                    .retrieve(t.NEW_COMMAND)
                                    .add(r, new s.Macro(o || r, n, a));
                        }),
                        (t.addEnvironment = function (e, r, n, a) {
                            e.configuration.handlers
                                .retrieve(t.NEW_ENVIRONMENT)
                                .add(r, new s.Macro(r, n, a));
                        }),
                        (t.NEW_DELIMITER = 'new-Delimiter'),
                        (t.NEW_COMMAND = 'new-Command'),
                        (t.NEW_ENVIRONMENT = 'new-Environment');
                })(a || (a = {})),
                    (e.default = a);
            },
            5634: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.NoErrorsConfiguration = void 0);
                var n = r(251);
                e.NoErrorsConfiguration = n.Configuration.create('noerrors', {
                    nodes: {
                        error: function (t, e, r, n) {
                            var a = t.create('token', 'mtext', {}, n.replace(/\n/g, ' '));
                            return t.create('node', 'merror', [a], {
                                'data-mjx-error': e,
                                title: e,
                            });
                        },
                    },
                });
            },
            1999: function (t, e, r) {
                var n =
                    (this && this.__values) ||
                    function (t) {
                        var e = 'function' == typeof Symbol && Symbol.iterator,
                            r = e && t[e],
                            n = 0;
                        if (r) return r.call(t);
                        if (t && 'number' == typeof t.length)
                            return {
                                next: function () {
                                    return (
                                        t && n >= t.length && (t = void 0),
                                        { value: t && t[n++], done: !t }
                                    );
                                },
                            };
                        throw new TypeError(
                            e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                        );
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.NoUndefinedConfiguration = void 0);
                var a = r(251);
                e.NoUndefinedConfiguration = a.Configuration.create('noundefined', {
                    fallback: {
                        macro: function (t, e) {
                            var r,
                                a,
                                o = t.create('text', '\\' + e),
                                i = t.options.noundefined || {},
                                s = {};
                            try {
                                for (
                                    var l = n(['color', 'background', 'size']), c = l.next();
                                    !c.done;
                                    c = l.next()
                                ) {
                                    var u = c.value;
                                    i[u] && (s['math' + u] = i[u]);
                                }
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    c && !c.done && (a = l.return) && a.call(l);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                            t.Push(t.create('node', 'mtext', [], s, o));
                        },
                    },
                    options: { noundefined: { color: 'red', background: '', size: '' } },
                    priority: 3,
                });
            },
            2996: function (t, e, r) {
                var n;
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.PhysicsConfiguration = void 0);
                var a = r(251),
                    o = r(4855);
                r(3842),
                    (e.PhysicsConfiguration = a.Configuration.create('physics', {
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
                        items: ((n = {}), (n[o.AutoOpen.prototype.kind] = o.AutoOpen), n),
                        options: { physics: { italicdiff: !1, arrowdel: !1 } },
                    }));
            },
            4855: function (t, e, r) {
                var n,
                    a =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                n(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.AutoOpen = void 0);
                var i = r(1076),
                    s = o(r(7398)),
                    l = o(r(4748)),
                    c = o(r(2193)),
                    u = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.openCount = 0), e;
                        }
                        return (
                            a(e, t),
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
                                    r = this.getProperty('right');
                                if (this.getProperty('smash')) {
                                    var n = t.prototype.toMml.call(this),
                                        a = e.create('node', 'mpadded', [n], {
                                            height: 0,
                                            depth: 0,
                                        });
                                    this.Clear(), this.Push(e.create('node', 'TeXAtom', [a]));
                                }
                                r &&
                                    this.Push(new c.default(r, e.stack.env, e.configuration).mml());
                                var o = s.default.fenced(
                                    this.factory.configuration,
                                    this.getProperty('open'),
                                    t.prototype.toMml.call(this),
                                    this.getProperty('close'),
                                    this.getProperty('big'),
                                );
                                return (
                                    l.default.removeProperties(o, 'open', 'close', 'texClass'), o
                                );
                            }),
                            (e.prototype.checkItem = function (e) {
                                if (e.isKind('mml') && 1 === e.Size()) {
                                    var r = e.toMml();
                                    r.isKind('mo') &&
                                        r.getText() === this.getProperty('open') &&
                                        this.openCount++;
                                }
                                var n = e.getProperty('autoclose');
                                return n && n === this.getProperty('close') && !this.openCount--
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
            3842: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var a = r(5871),
                    o = n(r(2458)),
                    i = r(6108),
                    s = n(r(4945)),
                    l = r(2955);
                new a.CommandMap(
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
                    new a.CharacterMap('Physics-vector-mo', s.default.mathchar0mo, {
                        dotproduct: ['\u22c5', { mathvariant: i.TexConstant.Variant.BOLD }],
                        vdot: ['\u22c5', { mathvariant: i.TexConstant.Variant.BOLD }],
                        crossproduct: '\xd7',
                        cross: '\xd7',
                        cp: '\xd7',
                        gradientnabla: ['\u2207', { mathvariant: i.TexConstant.Variant.BOLD }],
                    }),
                    new a.CharacterMap('Physics-vector-mi', s.default.mathchar0mi, {
                        real: ['\u211c', { mathvariant: i.TexConstant.Variant.NORMAL }],
                        imaginary: ['\u2111', { mathvariant: i.TexConstant.Variant.NORMAL }],
                    }),
                    new a.CommandMap(
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
                    new a.CommandMap(
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
                    new a.CommandMap(
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
                    new a.CommandMap(
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
                    new a.CommandMap(
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
                    new a.CommandMap(
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
                    new a.EnvironmentMap(
                        'Physics-aux-envs',
                        s.default.environment,
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
                    new a.MacroMap(
                        'Physics-characters',
                        { '|': ['AutoClose', l.TEXCLASS.ORD], ')': 'AutoClose', ']': 'AutoClose' },
                        o.default,
                    );
            },
            2458: function (t, e, r) {
                var n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                a,
                                o = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                a = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (a) throw a.error;
                                }
                            }
                            return i;
                        },
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var o = a(r(7360)),
                    i = a(r(2193)),
                    s = a(r(3402)),
                    l = r(2955),
                    c = a(r(7398)),
                    u = a(r(4748)),
                    d = r(2348),
                    p = {},
                    f = { '(': ')', '[': ']', '{': '}', '|': '|' },
                    m = /^(b|B)i(g{1,2})$/;
                (p.Quantity = function (t, e, r, n, a, o, d) {
                    void 0 === r && (r = '('),
                        void 0 === n && (n = ')'),
                        void 0 === a && (a = !1),
                        void 0 === o && (o = ''),
                        void 0 === d && (d = '');
                    var p = !!a && t.GetStar(),
                        h = t.GetNext(),
                        g = t.i,
                        v = null;
                    if ('\\' === h) {
                        if ((t.i++, !(v = t.GetCS()).match(m))) {
                            var y = t.create('node', 'mrow');
                            return (
                                t.Push(c.default.fenced(t.configuration, r, y, n)), void (t.i = g)
                            );
                        }
                        h = t.GetNext();
                    }
                    var x = f[h];
                    if (a && '{' !== h)
                        throw new s.default(
                            'MissingArgFor',
                            'Missing argument for %1',
                            t.currentCS,
                        );
                    if (!x) {
                        y = t.create('node', 'mrow');
                        return t.Push(c.default.fenced(t.configuration, r, y, n)), void (t.i = g);
                    }
                    if (o) {
                        var b = t.create('token', 'mi', { texClass: l.TEXCLASS.OP }, o);
                        d && u.default.setAttribute(b, 'mathvariant', d),
                            t.Push(t.itemFactory.create('fn', b));
                    }
                    if ('{' === h) {
                        var _ = t.GetArgument(e);
                        return (
                            (h = a ? r : '\\{'),
                            (x = a ? n : '\\}'),
                            (_ = p
                                ? h + ' ' + _ + ' ' + x
                                : v
                                  ? '\\' + v + 'l' + h + ' ' + _ + ' \\' + v + 'r' + x
                                  : '\\left' + h + ' ' + _ + ' \\right' + x),
                            void t.Push(new i.default(_, t.stack.env, t.configuration).mml())
                        );
                    }
                    a && ((h = r), (x = n)),
                        t.i++,
                        t.Push(
                            t.itemFactory
                                .create('auto open')
                                .setProperties({ open: h, close: x, big: v }),
                        );
                }),
                    (p.Eval = function (t, e) {
                        var r = t.GetStar(),
                            n = t.GetNext();
                        if ('{' !== n) {
                            if ('(' === n || '[' === n)
                                return (
                                    t.i++,
                                    void t.Push(
                                        t.itemFactory.create('auto open').setProperties({
                                            open: n,
                                            close: '|',
                                            smash: r,
                                            right: '\\vphantom{\\int}',
                                        }),
                                    )
                                );
                            throw new s.default(
                                'MissingArgFor',
                                'Missing argument for %1',
                                t.currentCS,
                            );
                        }
                        var a = t.GetArgument(e),
                            o =
                                '\\left. ' +
                                (r ? '\\smash{' + a + '}' : a) +
                                ' \\vphantom{\\int}\\right|';
                        t.string = t.string.slice(0, t.i) + o + t.string.slice(t.i);
                    }),
                    (p.Commutator = function (t, e, r, n) {
                        void 0 === r && (r = '['), void 0 === n && (n = ']');
                        var a = t.GetStar(),
                            o = t.GetNext(),
                            l = null;
                        if ('\\' === o) {
                            if ((t.i++, !(l = t.GetCS()).match(m)))
                                throw new s.default(
                                    'MissingArgFor',
                                    'Missing argument for %1',
                                    t.currentCS,
                                );
                            o = t.GetNext();
                        }
                        if ('{' !== o)
                            throw new s.default(
                                'MissingArgFor',
                                'Missing argument for %1',
                                t.currentCS,
                            );
                        var c = t.GetArgument(e) + ',' + t.GetArgument(e);
                        (c = a
                            ? r + ' ' + c + ' ' + n
                            : l
                              ? '\\' + l + 'l' + r + ' ' + c + ' \\' + l + 'r' + n
                              : '\\left' + r + ' ' + c + ' \\right' + n),
                            t.Push(new i.default(c, t.stack.env, t.configuration).mml());
                    });
                var h = [65, 90],
                    g = [97, 122],
                    v = [913, 937],
                    y = [945, 969],
                    x = [48, 57];
                function b(t, e) {
                    return t >= e[0] && t <= e[1];
                }
                function _(t, e, r, n) {
                    var a = t.configuration.parser,
                        o = d.NodeFactory.createToken(t, e, r, n),
                        i = n.codePointAt(0);
                    return (
                        1 === n.length &&
                            !a.stack.env.font &&
                            a.stack.env.vectorFont &&
                            (b(i, h) ||
                                b(i, g) ||
                                b(i, v) ||
                                b(i, x) ||
                                (b(i, y) && a.stack.env.vectorStar) ||
                                u.default.getAttribute(o, 'accent')) &&
                            u.default.setAttribute(o, 'mathvariant', a.stack.env.vectorFont),
                        o
                    );
                }
                (p.VectorBold = function (t, e) {
                    var r = t.GetStar(),
                        n = t.GetArgument(e),
                        a = t.configuration.nodeFactory.get('token'),
                        o = t.stack.env.font;
                    delete t.stack.env.font,
                        t.configuration.nodeFactory.set('token', _),
                        (t.stack.env.vectorFont = r ? 'bold-italic' : 'bold'),
                        (t.stack.env.vectorStar = r);
                    var s = new i.default(n, t.stack.env, t.configuration).mml();
                    o && (t.stack.env.font = o),
                        delete t.stack.env.vectorFont,
                        delete t.stack.env.vectorStar,
                        t.configuration.nodeFactory.set('token', a),
                        t.Push(s);
                }),
                    (p.StarMacro = function (t, e, r) {
                        for (var n = [], a = 3; a < arguments.length; a++) n[a - 3] = arguments[a];
                        var o = t.GetStar(),
                            i = [];
                        if (r) for (var s = i.length; s < r; s++) i.push(t.GetArgument(e));
                        var l = n.join(o ? '*' : '');
                        (l = c.default.substituteArgs(t, i, l)),
                            (t.string = c.default.addArgs(t, l, t.string.slice(t.i))),
                            (t.i = 0),
                            c.default.checkMaxMacros(t);
                    });
                var M = function (t, e, r, n, a) {
                    var o = new i.default(n, t.stack.env, t.configuration).mml();
                    t.Push(t.itemFactory.create(e, o));
                    var s = t.GetNext(),
                        l = f[s];
                    if (l) {
                        var c = -1 !== a.indexOf(s);
                        if ('{' === s) {
                            var u =
                                (c ? '\\left\\{' : '') +
                                ' ' +
                                t.GetArgument(r) +
                                ' ' +
                                (c ? '\\right\\}' : '');
                            return (t.string = u + t.string.slice(t.i)), void (t.i = 0);
                        }
                        c &&
                            (t.i++,
                            t.Push(
                                t.itemFactory
                                    .create('auto open')
                                    .setProperties({ open: s, close: l }),
                            ));
                    }
                };
                function w(t, e, r) {
                    var a = n(t, 3),
                        o = a[0],
                        i = a[1],
                        s = a[2];
                    return e && r
                        ? '\\left\\langle{'
                              .concat(o, '}\\middle\\vert{')
                              .concat(i, '}\\middle\\vert{')
                              .concat(s, '}\\right\\rangle')
                        : e
                          ? '\\langle{'
                                .concat(o, '}\\vert{')
                                .concat(i, '}\\vert{')
                                .concat(s, '}\\rangle')
                          : '\\left\\langle{'
                                .concat(o, '}\\right\\vert{')
                                .concat(i, '}\\left\\vert{')
                                .concat(s, '}\\right\\rangle');
                }
                (p.OperatorApplication = function (t, e, r) {
                    for (var n = [], a = 3; a < arguments.length; a++) n[a - 3] = arguments[a];
                    M(t, 'fn', e, r, n);
                }),
                    (p.VectorOperator = function (t, e, r) {
                        for (var n = [], a = 3; a < arguments.length; a++) n[a - 3] = arguments[a];
                        M(t, 'mml', e, r, n);
                    }),
                    (p.Expression = function (t, e, r, n) {
                        void 0 === r && (r = !0), void 0 === n && (n = ''), (n = n || e.slice(1));
                        var a = r ? t.GetBrackets(e) : null,
                            o = t.create('token', 'mi', { texClass: l.TEXCLASS.OP }, n);
                        if (a) {
                            var s = new i.default(a, t.stack.env, t.configuration).mml();
                            o = t.create('node', 'msup', [o, s]);
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
                    (p.Qqtext = function (t, e, r) {
                        var n =
                            (t.GetStar() ? '' : '\\quad') +
                            '\\text{' +
                            (r || t.GetArgument(e)) +
                            '}\\quad ';
                        t.string = t.string.slice(0, t.i) + n + t.string.slice(t.i);
                    }),
                    (p.Differential = function (t, e, r) {
                        var n = t.GetBrackets(e),
                            a = null != n ? '^{' + n + '}' : ' ',
                            o = '(' === t.GetNext(),
                            s = '{' === t.GetNext(),
                            c = r + a;
                        if (o || s)
                            if (s) {
                                c += t.GetArgument(e);
                                u = new i.default(c, t.stack.env, t.configuration).mml();
                                t.Push(
                                    t.create('node', 'TeXAtom', [u], { texClass: l.TEXCLASS.OP }),
                                );
                            } else
                                t.Push(new i.default(c, t.stack.env, t.configuration).mml()),
                                    t.i++,
                                    t.Push(
                                        t.itemFactory
                                            .create('auto open')
                                            .setProperties({ open: '(', close: ')' }),
                                    );
                        else {
                            c += t.GetArgument(e, !0) || '';
                            var u = new i.default(c, t.stack.env, t.configuration).mml();
                            t.Push(u);
                        }
                    }),
                    (p.Derivative = function (t, e, r, n) {
                        var a = t.GetStar(),
                            o = t.GetBrackets(e),
                            s = 1,
                            l = [];
                        for (l.push(t.GetArgument(e)); '{' === t.GetNext() && s < r; )
                            l.push(t.GetArgument(e)), s++;
                        var c = !1,
                            u = ' ',
                            d = ' ';
                        r > 2 && l.length > 2
                            ? ((u = '^{' + (l.length - 1) + '}'), (c = !0))
                            : null != o &&
                              (r > 2 && l.length > 1 && (c = !0), (d = u = '^{' + o + '}'));
                        for (
                            var p = a ? '\\flatfrac' : '\\frac',
                                f = l.length > 1 ? l[0] : '',
                                m = l.length > 1 ? l[1] : l[0],
                                h = '',
                                g = 2,
                                v = void 0;
                            (v = l[g]);
                            g++
                        )
                            h += n + ' ' + v;
                        var y = p + '{' + n + u + f + '}{' + n + ' ' + m + d + ' ' + h + '}';
                        t.Push(new i.default(y, t.stack.env, t.configuration).mml()),
                            '(' === t.GetNext() &&
                                (t.i++,
                                t.Push(
                                    t.itemFactory
                                        .create('auto open')
                                        .setProperties({ open: '(', close: ')', ignore: c }),
                                ));
                    }),
                    (p.Bra = function (t, e) {
                        var r = t.GetStar(),
                            n = t.GetArgument(e),
                            a = '',
                            o = !1,
                            s = !1;
                        if ('\\' === t.GetNext()) {
                            var l = t.i;
                            t.i++;
                            var c = t.GetCS(),
                                u = t.lookup('macro', c);
                            u && 'ket' === u.symbol
                                ? ((o = !0),
                                  (l = t.i),
                                  (s = t.GetStar()),
                                  '{' === t.GetNext()
                                      ? (a = t.GetArgument(c, !0))
                                      : ((t.i = l), (s = !1)))
                                : (t.i = l);
                        }
                        var d = '';
                        (d = o
                            ? r || s
                                ? '\\langle{'.concat(n, '}\\vert{').concat(a, '}\\rangle')
                                : '\\left\\langle{'
                                      .concat(n, '}\\middle\\vert{')
                                      .concat(a, '}\\right\\rangle')
                            : r || s
                              ? '\\langle{'.concat(n, '}\\vert')
                              : '\\left\\langle{'.concat(n, '}\\right\\vert{').concat(a, '}')),
                            t.Push(new i.default(d, t.stack.env, t.configuration).mml());
                    }),
                    (p.Ket = function (t, e) {
                        var r = t.GetStar(),
                            n = t.GetArgument(e),
                            a = r
                                ? '\\vert{'.concat(n, '}\\rangle')
                                : '\\left\\vert{'.concat(n, '}\\right\\rangle');
                        t.Push(new i.default(a, t.stack.env, t.configuration).mml());
                    }),
                    (p.BraKet = function (t, e) {
                        var r = t.GetStar(),
                            n = t.GetArgument(e),
                            a = null;
                        '{' === t.GetNext() && (a = t.GetArgument(e, !0));
                        var o = '';
                        (o =
                            null == a
                                ? r
                                    ? '\\langle{'.concat(n, '}\\vert{').concat(n, '}\\rangle')
                                    : '\\left\\langle{'
                                          .concat(n, '}\\middle\\vert{')
                                          .concat(n, '}\\right\\rangle')
                                : r
                                  ? '\\langle{'.concat(n, '}\\vert{').concat(a, '}\\rangle')
                                  : '\\left\\langle{'
                                        .concat(n, '}\\middle\\vert{')
                                        .concat(a, '}\\right\\rangle')),
                            t.Push(new i.default(o, t.stack.env, t.configuration).mml());
                    }),
                    (p.KetBra = function (t, e) {
                        var r = t.GetStar(),
                            n = t.GetArgument(e),
                            a = null;
                        '{' === t.GetNext() && (a = t.GetArgument(e, !0));
                        var o = '';
                        (o =
                            null == a
                                ? r
                                    ? '\\vert{'
                                          .concat(n, '}\\rangle\\!\\langle{')
                                          .concat(n, '}\\vert')
                                    : '\\left\\vert{'
                                          .concat(n, '}\\middle\\rangle\\!\\middle\\langle{')
                                          .concat(n, '}\\right\\vert')
                                : r
                                  ? '\\vert{'
                                        .concat(n, '}\\rangle\\!\\langle{')
                                        .concat(a, '}\\vert')
                                  : '\\left\\vert{'
                                        .concat(n, '}\\middle\\rangle\\!\\middle\\langle{')
                                        .concat(a, '}\\right\\vert')),
                            t.Push(new i.default(o, t.stack.env, t.configuration).mml());
                    }),
                    (p.Expectation = function (t, e) {
                        var r = t.GetStar(),
                            n = r && t.GetStar(),
                            a = t.GetArgument(e),
                            o = null;
                        '{' === t.GetNext() && (o = t.GetArgument(e, !0));
                        var s =
                            a && o
                                ? w([o, a, o], r, n)
                                : r
                                  ? '\\langle {'.concat(a, '} \\rangle')
                                  : '\\left\\langle {'.concat(a, '} \\right\\rangle');
                        t.Push(new i.default(s, t.stack.env, t.configuration).mml());
                    }),
                    (p.MatrixElement = function (t, e) {
                        var r = t.GetStar(),
                            n = r && t.GetStar(),
                            a = w([t.GetArgument(e), t.GetArgument(e), t.GetArgument(e)], r, n);
                        t.Push(new i.default(a, t.stack.env, t.configuration).mml());
                    }),
                    (p.MatrixQuantity = function (t, e, r) {
                        var n = t.GetStar(),
                            a = r ? 'smallmatrix' : 'array',
                            o = '',
                            s = '',
                            l = '';
                        switch (t.GetNext()) {
                            case '{':
                                o = t.GetArgument(e);
                                break;
                            case '(':
                                t.i++,
                                    (s = n ? '\\lgroup' : '('),
                                    (l = n ? '\\rgroup' : ')'),
                                    (o = t.GetUpTo(e, ')'));
                                break;
                            case '[':
                                t.i++, (s = '['), (l = ']'), (o = t.GetUpTo(e, ']'));
                                break;
                            case '|':
                                t.i++, (s = '|'), (l = '|'), (o = t.GetUpTo(e, '|'));
                                break;
                            default:
                                (s = '('), (l = ')');
                        }
                        var c =
                            (s ? '\\left' : '') +
                            s +
                            '\\begin{' +
                            a +
                            '}{} ' +
                            o +
                            '\\end{' +
                            a +
                            '}' +
                            (s ? '\\right' : '') +
                            l;
                        t.Push(new i.default(c, t.stack.env, t.configuration).mml());
                    }),
                    (p.IdentityMatrix = function (t, e) {
                        var r = t.GetArgument(e),
                            n = parseInt(r, 10);
                        if (isNaN(n)) throw new s.default('InvalidNumber', 'Invalid number');
                        if (n <= 1) return (t.string = '1' + t.string.slice(t.i)), void (t.i = 0);
                        for (var a = Array(n).fill('0'), o = [], i = 0; i < n; i++) {
                            var l = a.slice();
                            (l[i] = '1'), o.push(l.join(' & '));
                        }
                        (t.string = o.join('\\\\ ') + t.string.slice(t.i)), (t.i = 0);
                    }),
                    (p.XMatrix = function (t, e) {
                        var r = t.GetStar(),
                            n = t.GetArgument(e),
                            a = t.GetArgument(e),
                            o = t.GetArgument(e),
                            i = parseInt(a, 10),
                            l = parseInt(o, 10);
                        if (isNaN(i) || isNaN(l) || l.toString() !== o || i.toString() !== a)
                            throw new s.default('InvalidNumber', 'Invalid number');
                        if (((i = i < 1 ? 1 : i), (l = l < 1 ? 1 : l), !r)) {
                            var c = Array(l).fill(n).join(' & '),
                                u = Array(i).fill(c).join('\\\\ ');
                            return (t.string = u + t.string.slice(t.i)), void (t.i = 0);
                        }
                        var d = '';
                        if (1 === i && 1 === l) d = n;
                        else if (1 === i) {
                            c = [];
                            for (var p = 1; p <= l; p++) c.push(''.concat(n, '_{').concat(p, '}'));
                            d = c.join(' & ');
                        } else if (1 === l) {
                            for (c = [], p = 1; p <= i; p++)
                                c.push(''.concat(n, '_{').concat(p, '}'));
                            d = c.join('\\\\ ');
                        } else {
                            var f = [];
                            for (p = 1; p <= i; p++) {
                                c = [];
                                for (var m = 1; m <= l; m++)
                                    c.push(''.concat(n, '_{{').concat(p, '}{').concat(m, '}}'));
                                f.push(c.join(' & '));
                            }
                            d = f.join('\\\\ ');
                        }
                        (t.string = d + t.string.slice(t.i)), (t.i = 0);
                    }),
                    (p.PauliMatrix = function (t, e) {
                        var r = t.GetArgument(e),
                            n = r.slice(1);
                        switch (r[0]) {
                            case '0':
                                n += ' 1 & 0\\\\ 0 & 1';
                                break;
                            case '1':
                            case 'x':
                                n += ' 0 & 1\\\\ 1 & 0';
                                break;
                            case '2':
                            case 'y':
                                n += ' 0 & -i\\\\ i & 0';
                                break;
                            case '3':
                            case 'z':
                                n += ' 1 & 0\\\\ 0 & -1';
                        }
                        (t.string = n + t.string.slice(t.i)), (t.i = 0);
                    }),
                    (p.DiagonalMatrix = function (t, e, r) {
                        if ('{' === t.GetNext()) {
                            var n = t.i;
                            t.GetArgument(e);
                            var a = t.i;
                            t.i = n + 1;
                            for (var o = [], i = '', s = t.i; s < a; ) {
                                try {
                                    i = t.GetUpTo(e, ',');
                                } catch (e) {
                                    (t.i = a), o.push(t.string.slice(s, a - 1));
                                    break;
                                }
                                if (t.i >= a) {
                                    o.push(t.string.slice(s, a));
                                    break;
                                }
                                (s = t.i), o.push(i);
                            }
                            (t.string =
                                (function (t, e) {
                                    for (var r = t.length, n = [], a = 0; a < r; a++)
                                        n.push(
                                            Array(e ? r - a : a + 1).join('&') +
                                                '\\mqty{' +
                                                t[a] +
                                                '}',
                                        );
                                    return n.join('\\\\ ');
                                })(o, r) + t.string.slice(a)),
                                (t.i = 0);
                        }
                    }),
                    (p.AutoClose = function (t, e, r) {
                        var n = t.create('token', 'mo', { stretchy: !1 }, e),
                            a = t.itemFactory.create('mml', n).setProperties({ autoclose: e });
                        t.Push(a);
                    }),
                    (p.Vnabla = function (t, e) {
                        var r = t.options.physics.arrowdel
                            ? '\\vec{\\gradientnabla}'
                            : '{\\gradientnabla}';
                        return t.Push(new i.default(r, t.stack.env, t.configuration).mml());
                    }),
                    (p.DiffD = function (t, e) {
                        var r = t.options.physics.italicdiff ? 'd' : '{\\rm d}';
                        return t.Push(new i.default(r, t.stack.env, t.configuration).mml());
                    }),
                    (p.Macro = o.default.Macro),
                    (p.NamedFn = o.default.NamedFn),
                    (p.Array = o.default.Array),
                    (e.default = p);
            },
            2778: function (t, e, r) {
                var n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                a,
                                o = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                a = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (a) throw a.error;
                                }
                            }
                            return i;
                        },
                    o =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, a = 0, o = e.length; a < o; a++)
                                    (!n && a in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, a)),
                                        (n[a] = e[a]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.RequireConfiguration =
                        e.options =
                        e.RequireMethods =
                        e.RequireLoad =
                            void 0);
                var s = r(251),
                    l = r(5871),
                    c = i(r(3402)),
                    u = r(8955),
                    d = r(4629),
                    p = r(4282),
                    f = r(8149),
                    m = r(5074),
                    h = u.MathJax.config;
                function g(t, e) {
                    var r,
                        a = t.parseOptions.options.require,
                        o = t.parseOptions.packageData.get('require').required,
                        i = e.substr(a.prefix.length);
                    if (o.indexOf(i) < 0) {
                        o.push(i),
                            (function (t, e) {
                                var r, a;
                                void 0 === e && (e = []);
                                var o = t.parseOptions.options.require.prefix;
                                try {
                                    for (var i = n(e), s = i.next(); !s.done; s = i.next()) {
                                        var l = s.value;
                                        l.substr(0, o.length) === o && g(t, l);
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        s && !s.done && (a = i.return) && a.call(i);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                            })(t, p.CONFIG.dependencies[e]);
                        var l = s.ConfigurationHandler.get(i);
                        if (l) {
                            var c = h[e] || {};
                            l.options &&
                                1 === Object.keys(l.options).length &&
                                l.options[i] &&
                                (((r = {})[i] = c), (c = r)),
                                t.configuration.add(i, t, c);
                            var u = t.parseOptions.packageData.get('require').configured;
                            l.preprocessors.length &&
                                !u.has(i) &&
                                (u.set(i, !0), f.mathjax.retryAfter(Promise.resolve()));
                        }
                    }
                }
                function v(t, e) {
                    var r = t.options.require,
                        n = r.allow,
                        a = ('[' === e.substr(0, 1) ? '' : r.prefix) + e;
                    if (!(n.hasOwnProperty(a) ? n[a] : n.hasOwnProperty(e) ? n[e] : r.defaultAllow))
                        throw new c.default(
                            'BadRequire',
                            'Extension "%1" is not allowed to be loaded',
                            a,
                        );
                    d.Package.packages.has(a)
                        ? g(t.configuration.packageData.get('require').jax, a)
                        : f.mathjax.retryAfter(p.Loader.load(a));
                }
                (e.RequireLoad = v),
                    (e.RequireMethods = {
                        Require: function (t, e) {
                            var r = t.GetArgument(e);
                            if (r.match(/[^_a-zA-Z0-9]/) || '' === r)
                                throw new c.default(
                                    'BadPackageName',
                                    'Argument for %1 is not a valid package name',
                                    e,
                                );
                            v(t, r);
                        },
                    }),
                    (e.options = {
                        require: {
                            allow: (0, m.expandable)({
                                base: !1,
                                'all-packages': !1,
                                autoload: !1,
                                configmacros: !1,
                                tagformat: !1,
                                setoptions: !1,
                            }),
                            defaultAllow: !0,
                            prefix: 'tex',
                        },
                    }),
                    new l.CommandMap('require', { require: 'Require' }, e.RequireMethods),
                    (e.RequireConfiguration = s.Configuration.create('require', {
                        handler: { macro: ['require'] },
                        config: function (t, e) {
                            e.parseOptions.packageData.set('require', {
                                jax: e,
                                required: o([], a(e.options.packages), !1),
                                configured: new Map(),
                            });
                            var r = e.parseOptions.options.require,
                                n = r.prefix;
                            if (n.match(/[^_a-zA-Z0-9]/))
                                throw Error('Illegal characters used in \\require prefix');
                            p.CONFIG.paths[n] ||
                                (p.CONFIG.paths[n] = '[mathjax]/input/tex/extensions'),
                                (r.prefix = '[' + n + ']/');
                        },
                        options: e.options,
                    }));
            },
            1596: function (t, e, r) {
                var n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.SetOptionsConfiguration = e.SetOptionsUtil = void 0);
                var o = r(251),
                    i = r(5871),
                    s = a(r(3402)),
                    l = a(r(7398)),
                    c = r(4924),
                    u = a(r(7360)),
                    d = r(5074);
                e.SetOptionsUtil = {
                    filterPackage: function (t, e) {
                        if ('tex' !== e && !o.ConfigurationHandler.get(e))
                            throw new s.default('NotAPackage', 'Not a defined package: %1', e);
                        var r = t.options.setoptions,
                            n = r.allowOptions[e];
                        if ((void 0 === n && !r.allowPackageDefault) || !1 === n)
                            throw new s.default(
                                'PackageNotSettable',
                                'Options can\'t be set for package "%1"',
                                e,
                            );
                        return !0;
                    },
                    filterOption: function (t, e, r) {
                        var n,
                            a = t.options.setoptions,
                            o = a.allowOptions[e] || {},
                            i = o.hasOwnProperty(r) && !(0, d.isObject)(o[r]) ? o[r] : null;
                        if (!1 === i || (null === i && !a.allowOptionsDefault))
                            throw new s.default(
                                'OptionNotSettable',
                                'Option "%1" is not allowed to be set',
                                r,
                            );
                        if (
                            !(null === (n = 'tex' === e ? t.options : t.options[e]) || void 0 === n
                                ? void 0
                                : n.hasOwnProperty(r))
                        )
                            throw 'tex' === e
                                ? new s.default('InvalidTexOption', 'Invalid TeX option "%1"', r)
                                : new s.default(
                                      'InvalidOptionKey',
                                      'Invalid option "%1" for package "%2"',
                                      r,
                                      e,
                                  );
                        return !0;
                    },
                    filterValue: function (t, e, r, n) {
                        return n;
                    },
                };
                var p = new i.CommandMap(
                    'setoptions',
                    { setOptions: 'SetOptions' },
                    {
                        SetOptions: function (t, e) {
                            var r,
                                a,
                                o = t.GetBrackets(e) || 'tex',
                                i = l.default.keyvalOptions(t.GetArgument(e)),
                                s = t.options.setoptions;
                            if (s.filterPackage(t, o))
                                try {
                                    for (
                                        var c = n(Object.keys(i)), u = c.next();
                                        !u.done;
                                        u = c.next()
                                    ) {
                                        var d = u.value;
                                        s.filterOption(t, o, d) &&
                                            (('tex' === o ? t.options : t.options[o])[d] =
                                                s.filterValue(t, o, d, i[d]));
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        u && !u.done && (a = c.return) && a.call(c);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                        },
                    },
                );
                e.SetOptionsConfiguration = o.Configuration.create('setoptions', {
                    handler: { macro: ['setoptions'] },
                    config: function (t, e) {
                        var r = e.parseOptions.handlers.get('macro').lookup('require');
                        r &&
                            (p.add('Require', new c.Macro('Require', r._func)),
                            p.add(
                                'require',
                                new c.Macro('require', u.default.Macro, [
                                    '\\Require{#2}\\setOptions[#2]{#1}',
                                    2,
                                    '',
                                ]),
                            ));
                    },
                    priority: 3,
                    options: {
                        setoptions: {
                            filterPackage: e.SetOptionsUtil.filterPackage,
                            filterOption: e.SetOptionsUtil.filterOption,
                            filterValue: e.SetOptionsUtil.filterValue,
                            allowPackageDefault: !0,
                            allowOptionsDefault: !0,
                            allowOptions: (0, d.expandable)({
                                tex: {
                                    FindTeX: !1,
                                    formatError: !1,
                                    package: !1,
                                    baseURL: !1,
                                    tags: !1,
                                    maxBuffer: !1,
                                    maxMaxros: !1,
                                    macros: !1,
                                    environments: !1,
                                },
                                setoptions: !1,
                                autoload: !1,
                                require: !1,
                                configmacros: !1,
                                tagformat: !1,
                            }),
                        },
                    },
                });
            },
            5941: function (t, e, r) {
                var n,
                    a =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                n(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TagFormatConfiguration = e.tagformatConfig = void 0);
                var o = r(251),
                    i = r(4680),
                    s = 0;
                function l(t, e) {
                    var r = e.parseOptions.options.tags;
                    'base' !== r && t.tags.hasOwnProperty(r) && i.TagsFactory.add(r, t.tags[r]);
                    var n = (function (t) {
                            function r() {
                                return (null !== t && t.apply(this, arguments)) || this;
                            }
                            return (
                                a(r, t),
                                (r.prototype.formatNumber = function (t) {
                                    return e.parseOptions.options.tagformat.number(t);
                                }),
                                (r.prototype.formatTag = function (t) {
                                    return e.parseOptions.options.tagformat.tag(t);
                                }),
                                (r.prototype.formatId = function (t) {
                                    return e.parseOptions.options.tagformat.id(t);
                                }),
                                (r.prototype.formatUrl = function (t, r) {
                                    return e.parseOptions.options.tagformat.url(t, r);
                                }),
                                r
                            );
                        })(i.TagsFactory.create(e.parseOptions.options.tags).constructor),
                        o = 'configTags-' + ++s;
                    i.TagsFactory.add(o, n), (e.parseOptions.options.tags = o);
                }
                (e.tagformatConfig = l),
                    (e.TagFormatConfiguration = o.Configuration.create('tagformat', {
                        config: [l, 10],
                        options: {
                            tagformat: {
                                number: function (t) {
                                    return t.toString();
                                },
                                tag: function (t) {
                                    return '(' + t + ')';
                                },
                                id: function (t) {
                                    return 'mjx-eqn:' + t.replace(/\s/g, '_');
                                },
                                url: function (t, e) {
                                    return e + '#' + encodeURIComponent(t);
                                },
                            },
                        },
                    }));
            },
            1845: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TextcompConfiguration = void 0);
                var n = r(251);
                r(6832),
                    (e.TextcompConfiguration = n.Configuration.create('textcomp', {
                        handler: { macro: ['textcomp-macros'] },
                    }));
            },
            6832: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 });
                var a = r(5871),
                    o = r(6108),
                    i = r(4807),
                    s = n(r(7398)),
                    l = r(787);
                new a.CommandMap(
                    'textcomp-macros',
                    {
                        textasciicircum: ['Insert', '^'],
                        textasciitilde: ['Insert', '~'],
                        textasteriskcentered: ['Insert', '*'],
                        textbackslash: ['Insert', '\\'],
                        textbar: ['Insert', '|'],
                        textbraceleft: ['Insert', '{'],
                        textbraceright: ['Insert', '}'],
                        textbullet: ['Insert', '\u2022'],
                        textdagger: ['Insert', '\u2020'],
                        textdaggerdbl: ['Insert', '\u2021'],
                        textellipsis: ['Insert', '\u2026'],
                        textemdash: ['Insert', '\u2014'],
                        textendash: ['Insert', '\u2013'],
                        textexclamdown: ['Insert', '\xa1'],
                        textgreater: ['Insert', '>'],
                        textless: ['Insert', '<'],
                        textordfeminine: ['Insert', '\xaa'],
                        textordmasculine: ['Insert', '\xba'],
                        textparagraph: ['Insert', '\xb6'],
                        textperiodcentered: ['Insert', '\xb7'],
                        textquestiondown: ['Insert', '\xbf'],
                        textquotedblleft: ['Insert', '\u201c'],
                        textquotedblright: ['Insert', '\u201d'],
                        textquoteleft: ['Insert', '\u2018'],
                        textquoteright: ['Insert', '\u2019'],
                        textsection: ['Insert', '\xa7'],
                        textunderscore: ['Insert', '_'],
                        textvisiblespace: ['Insert', '\u2423'],
                        textacutedbl: ['Insert', '\u02dd'],
                        textasciiacute: ['Insert', '\xb4'],
                        textasciibreve: ['Insert', '\u02d8'],
                        textasciicaron: ['Insert', '\u02c7'],
                        textasciidieresis: ['Insert', '\xa8'],
                        textasciimacron: ['Insert', '\xaf'],
                        textgravedbl: ['Insert', '\u02f5'],
                        texttildelow: ['Insert', '\u02f7'],
                        textbaht: ['Insert', '\u0e3f'],
                        textcent: ['Insert', '\xa2'],
                        textcolonmonetary: ['Insert', '\u20a1'],
                        textcurrency: ['Insert', '\xa4'],
                        textdollar: ['Insert', '$'],
                        textdong: ['Insert', '\u20ab'],
                        texteuro: ['Insert', '\u20ac'],
                        textflorin: ['Insert', '\u0192'],
                        textguarani: ['Insert', '\u20b2'],
                        textlira: ['Insert', '\u20a4'],
                        textnaira: ['Insert', '\u20a6'],
                        textpeso: ['Insert', '\u20b1'],
                        textsterling: ['Insert', '\xa3'],
                        textwon: ['Insert', '\u20a9'],
                        textyen: ['Insert', '\xa5'],
                        textcircledP: ['Insert', '\u2117'],
                        textcompwordmark: ['Insert', '\u200c'],
                        textcopyleft: ['Insert', '\ud83c\udd2f'],
                        textcopyright: ['Insert', '\xa9'],
                        textregistered: ['Insert', '\xae'],
                        textservicemark: ['Insert', '\u2120'],
                        texttrademark: ['Insert', '\u2122'],
                        textbardbl: ['Insert', '\u2016'],
                        textbigcircle: ['Insert', '\u25ef'],
                        textblank: ['Insert', '\u2422'],
                        textbrokenbar: ['Insert', '\xa6'],
                        textdiscount: ['Insert', '\u2052'],
                        textestimated: ['Insert', '\u212e'],
                        textinterrobang: ['Insert', '\u203d'],
                        textinterrobangdown: ['Insert', '\u2e18'],
                        textmusicalnote: ['Insert', '\u266a'],
                        textnumero: ['Insert', '\u2116'],
                        textopenbullet: ['Insert', '\u25e6'],
                        textpertenthousand: ['Insert', '\u2031'],
                        textperthousand: ['Insert', '\u2030'],
                        textrecipe: ['Insert', '\u211e'],
                        textreferencemark: ['Insert', '\u203b'],
                        textlangle: ['Insert', '\u2329'],
                        textrangle: ['Insert', '\u232a'],
                        textlbrackdbl: ['Insert', '\u27e6'],
                        textrbrackdbl: ['Insert', '\u27e7'],
                        textlquill: ['Insert', '\u2045'],
                        textrquill: ['Insert', '\u2046'],
                        textcelsius: ['Insert', '\u2103'],
                        textdegree: ['Insert', '\xb0'],
                        textdiv: ['Insert', '\xf7'],
                        textdownarrow: ['Insert', '\u2193'],
                        textfractionsolidus: ['Insert', '\u2044'],
                        textleftarrow: ['Insert', '\u2190'],
                        textlnot: ['Insert', '\xac'],
                        textmho: ['Insert', '\u2127'],
                        textminus: ['Insert', '\u2212'],
                        textmu: ['Insert', '\xb5'],
                        textohm: ['Insert', '\u2126'],
                        textonehalf: ['Insert', '\xbd'],
                        textonequarter: ['Insert', '\xbc'],
                        textonesuperior: ['Insert', '\xb9'],
                        textpm: ['Insert', '\xb1'],
                        textrightarrow: ['Insert', '\u2192'],
                        textsurd: ['Insert', '\u221a'],
                        textthreequarters: ['Insert', '\xbe'],
                        textthreesuperior: ['Insert', '\xb3'],
                        texttimes: ['Insert', '\xd7'],
                        texttwosuperior: ['Insert', '\xb2'],
                        textuparrow: ['Insert', '\u2191'],
                        textborn: ['Insert', '*'],
                        textdied: ['Insert', '\u2020'],
                        textdivorced: ['Insert', '\u26ae'],
                        textmarried: ['Insert', '\u26ad'],
                        textcentoldstyle: ['Insert', '\xa2', o.TexConstant.Variant.OLDSTYLE],
                        textdollaroldstyle: ['Insert', '$', o.TexConstant.Variant.OLDSTYLE],
                        textzerooldstyle: ['Insert', '0', o.TexConstant.Variant.OLDSTYLE],
                        textoneoldstyle: ['Insert', '1', o.TexConstant.Variant.OLDSTYLE],
                        texttwooldstyle: ['Insert', '2', o.TexConstant.Variant.OLDSTYLE],
                        textthreeoldstyle: ['Insert', '3', o.TexConstant.Variant.OLDSTYLE],
                        textfouroldstyle: ['Insert', '4', o.TexConstant.Variant.OLDSTYLE],
                        textfiveoldstyle: ['Insert', '5', o.TexConstant.Variant.OLDSTYLE],
                        textsixoldstyle: ['Insert', '6', o.TexConstant.Variant.OLDSTYLE],
                        textsevenoldstyle: ['Insert', '7', o.TexConstant.Variant.OLDSTYLE],
                        texteightoldstyle: ['Insert', '8', o.TexConstant.Variant.OLDSTYLE],
                        textnineoldstyle: ['Insert', '9', o.TexConstant.Variant.OLDSTYLE],
                    },
                    {
                        Insert: function (t, e, r, n) {
                            if (t instanceof l.TextParser) {
                                if (!n) return void i.TextMacrosMethods.Insert(t, e, r);
                                t.saveText();
                            }
                            t.Push(s.default.internalText(t, r, n ? { mathvariant: n } : {}));
                        },
                    },
                );
            },
            3762: function (t, e, r) {
                var n,
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TextMacrosConfiguration = e.TextBaseConfiguration = void 0);
                var o = r(251),
                    i = a(r(5278)),
                    s = r(4680),
                    l = r(2935),
                    c = r(787),
                    u = r(4807);
                function d(t, e, r, n) {
                    var a = t.configuration.packageData.get('textmacros');
                    return (
                        t instanceof c.TextParser || (a.texParser = t),
                        [new c.TextParser(e, n ? { mathvariant: n } : {}, a.parseOptions, r).mml()]
                    );
                }
                r(5557),
                    (e.TextBaseConfiguration = o.Configuration.create('text-base', {
                        parser: 'text',
                        handler: { character: ['command', 'text-special'], macro: ['text-macros'] },
                        fallback: {
                            character: function (t, e) {
                                t.text += e;
                            },
                            macro: function (t, e) {
                                var r = t.texParser,
                                    n = r.lookup('macro', e);
                                n &&
                                    n._func !== u.TextMacrosMethods.Macro &&
                                    t.Error(
                                        'MathMacro',
                                        '%1 is only supported in math mode',
                                        '\\' + e,
                                    ),
                                    r.parse('macro', [t, e]);
                            },
                        },
                        items:
                            ((n = {}),
                            (n[l.StartItem.prototype.kind] = l.StartItem),
                            (n[l.StopItem.prototype.kind] = l.StopItem),
                            (n[l.MmlItem.prototype.kind] = l.MmlItem),
                            (n[l.StyleItem.prototype.kind] = l.StyleItem),
                            n),
                    })),
                    (e.TextMacrosConfiguration = o.Configuration.create('textmacros', {
                        config: function (t, e) {
                            var r = new o.ParserConfiguration(
                                e.parseOptions.options.textmacros.packages,
                                ['tex', 'text'],
                            );
                            r.init();
                            var n = new i.default(r, []);
                            (n.options = e.parseOptions.options),
                                r.config(e),
                                s.TagsFactory.addTags(r.tags),
                                (n.tags = s.TagsFactory.getDefault()),
                                (n.tags.configuration = n),
                                (n.packageData = e.parseOptions.packageData),
                                n.packageData.set('textmacros', {
                                    parseOptions: n,
                                    jax: e,
                                    texParser: null,
                                }),
                                (n.options.internalMath = d);
                        },
                        preprocessors: [
                            function (t) {
                                var e = t.data.packageData.get('textmacros');
                                e.parseOptions.nodeFactory.setMmlFactory(e.jax.mmlFactory);
                            },
                        ],
                        options: { textmacros: { packages: ['text-base'] } },
                    }));
            },
            5557: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 });
                var n = r(5871),
                    a = r(6108),
                    o = r(4807),
                    i = r(1230);
                new n.MacroMap(
                    'text-special',
                    {
                        $: 'Math',
                        '%': 'Comment',
                        '^': 'MathModeOnly',
                        _: 'MathModeOnly',
                        '&': 'Misplaced',
                        '#': 'Misplaced',
                        '~': 'Tilde',
                        ' ': 'Space',
                        '\t': 'Space',
                        '\r': 'Space',
                        '\n': 'Space',
                        '\xa0': 'Tilde',
                        '{': 'OpenBrace',
                        '}': 'CloseBrace',
                        '`': 'OpenQuote',
                        "'": 'CloseQuote',
                    },
                    o.TextMacrosMethods,
                ),
                    new n.CommandMap(
                        'text-macros',
                        {
                            '(': 'Math',
                            $: 'SelfQuote',
                            _: 'SelfQuote',
                            '%': 'SelfQuote',
                            '{': 'SelfQuote',
                            '}': 'SelfQuote',
                            ' ': 'SelfQuote',
                            '&': 'SelfQuote',
                            '#': 'SelfQuote',
                            '\\': 'SelfQuote',
                            "'": ['Accent', '\xb4'],
                            '\u2019': ['Accent', '\xb4'],
                            '`': ['Accent', '`'],
                            '\u2018': ['Accent', '`'],
                            '^': ['Accent', '^'],
                            '"': ['Accent', '\xa8'],
                            '~': ['Accent', '~'],
                            '=': ['Accent', '\xaf'],
                            '.': ['Accent', '\u02d9'],
                            u: ['Accent', '\u02d8'],
                            v: ['Accent', '\u02c7'],
                            emph: 'Emph',
                            rm: ['SetFont', a.TexConstant.Variant.NORMAL],
                            mit: ['SetFont', a.TexConstant.Variant.ITALIC],
                            oldstyle: ['SetFont', a.TexConstant.Variant.OLDSTYLE],
                            cal: ['SetFont', a.TexConstant.Variant.CALLIGRAPHIC],
                            it: ['SetFont', '-tex-mathit'],
                            bf: ['SetFont', a.TexConstant.Variant.BOLD],
                            bbFont: ['SetFont', a.TexConstant.Variant.DOUBLESTRUCK],
                            scr: ['SetFont', a.TexConstant.Variant.SCRIPT],
                            frak: ['SetFont', a.TexConstant.Variant.FRAKTUR],
                            sf: ['SetFont', a.TexConstant.Variant.SANSSERIF],
                            tt: ['SetFont', a.TexConstant.Variant.MONOSPACE],
                            tiny: ['SetSize', 0.5],
                            Tiny: ['SetSize', 0.6],
                            scriptsize: ['SetSize', 0.7],
                            small: ['SetSize', 0.85],
                            normalsize: ['SetSize', 1],
                            large: ['SetSize', 1.2],
                            Large: ['SetSize', 1.44],
                            LARGE: ['SetSize', 1.73],
                            huge: ['SetSize', 2.07],
                            Huge: ['SetSize', 2.49],
                            Bbb: ['Macro', '{\\bbFont #1}', 1],
                            textnormal: ['Macro', '{\\rm #1}', 1],
                            textup: ['Macro', '{\\rm #1}', 1],
                            textrm: ['Macro', '{\\rm #1}', 1],
                            textit: ['Macro', '{\\it #1}', 1],
                            textbf: ['Macro', '{\\bf #1}', 1],
                            textsf: ['Macro', '{\\sf #1}', 1],
                            texttt: ['Macro', '{\\tt #1}', 1],
                            dagger: ['Insert', '\u2020'],
                            ddagger: ['Insert', '\u2021'],
                            S: ['Insert', '\xa7'],
                            ',': ['Spacer', i.MATHSPACE.thinmathspace],
                            ':': ['Spacer', i.MATHSPACE.mediummathspace],
                            '>': ['Spacer', i.MATHSPACE.mediummathspace],
                            ';': ['Spacer', i.MATHSPACE.thickmathspace],
                            '!': ['Spacer', i.MATHSPACE.negativethinmathspace],
                            enspace: ['Spacer', 0.5],
                            quad: ['Spacer', 1],
                            qquad: ['Spacer', 2],
                            thinspace: ['Spacer', i.MATHSPACE.thinmathspace],
                            negthinspace: ['Spacer', i.MATHSPACE.negativethinmathspace],
                            hskip: 'Hskip',
                            hspace: 'Hskip',
                            kern: 'Hskip',
                            mskip: 'Hskip',
                            mspace: 'Hskip',
                            mkern: 'Hskip',
                            rule: 'rule',
                            Rule: ['Rule'],
                            Space: ['Rule', 'blank'],
                            color: 'CheckAutoload',
                            textcolor: 'CheckAutoload',
                            colorbox: 'CheckAutoload',
                            fcolorbox: 'CheckAutoload',
                            href: 'CheckAutoload',
                            style: 'CheckAutoload',
                            class: 'CheckAutoload',
                            cssId: 'CheckAutoload',
                            unicode: 'CheckAutoload',
                            ref: ['HandleRef', !1],
                            eqref: ['HandleRef', !0],
                        },
                        o.TextMacrosMethods,
                    );
            },
            4807: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TextMacrosMethods = void 0);
                var a = n(r(2193)),
                    o = r(3832),
                    i = n(r(7360));
                e.TextMacrosMethods = {
                    Comment: function (t, e) {
                        for (; t.i < t.string.length && '\n' !== t.string.charAt(t.i); ) t.i++;
                        t.i++;
                    },
                    Math: function (t, e) {
                        t.saveText();
                        for (var r, n, o = t.i, i = 0; (n = t.GetNext()); )
                            switch (((r = t.i++), n)) {
                                case '\\':
                                    ')' === t.GetCS() && (n = '\\(');
                                case '$':
                                    if (0 === i && e === n) {
                                        var s = t.texParser.configuration,
                                            l = new a.default(
                                                t.string.substr(o, r - o),
                                                t.stack.env,
                                                s,
                                            ).mml();
                                        return void t.PushMath(l);
                                    }
                                    break;
                                case '{':
                                    i++;
                                    break;
                                case '}':
                                    0 === i &&
                                        t.Error(
                                            'ExtraCloseMissingOpen',
                                            'Extra close brace or missing open brace',
                                        ),
                                        i--;
                            }
                        t.Error('MathNotTerminated', 'Math-mode is not properly terminated');
                    },
                    MathModeOnly: function (t, e) {
                        t.Error('MathModeOnly', "'%1' allowed only in math mode", e);
                    },
                    Misplaced: function (t, e) {
                        t.Error('Misplaced', "'%1' can not be used here", e);
                    },
                    OpenBrace: function (t, e) {
                        var r = t.stack.env;
                        t.envStack.push(r), (t.stack.env = Object.assign({}, r));
                    },
                    CloseBrace: function (t, e) {
                        t.envStack.length
                            ? (t.saveText(), (t.stack.env = t.envStack.pop()))
                            : t.Error(
                                  'ExtraCloseMissingOpen',
                                  'Extra close brace or missing open brace',
                              );
                    },
                    OpenQuote: function (t, e) {
                        t.string.charAt(t.i) === e
                            ? ((t.text += '\u201c'), t.i++)
                            : (t.text += '\u2018');
                    },
                    CloseQuote: function (t, e) {
                        t.string.charAt(t.i) === e
                            ? ((t.text += '\u201d'), t.i++)
                            : (t.text += '\u2019');
                    },
                    Tilde: function (t, e) {
                        t.text += '\xa0';
                    },
                    Space: function (t, e) {
                        for (t.text += ' '; t.GetNext().match(/\s/); ) t.i++;
                    },
                    SelfQuote: function (t, e) {
                        t.text += e.substr(1);
                    },
                    Insert: function (t, e, r) {
                        t.text += r;
                    },
                    Accent: function (t, e, r) {
                        var n = t.ParseArg(e),
                            a = t.create('token', 'mo', {}, r);
                        t.addAttributes(a), t.Push(t.create('node', 'mover', [n, a]));
                    },
                    Emph: function (t, e) {
                        var r =
                            '-tex-mathit' === t.stack.env.mathvariant ? 'normal' : '-tex-mathit';
                        t.Push(t.ParseTextArg(e, { mathvariant: r }));
                    },
                    SetFont: function (t, e, r) {
                        t.saveText(), (t.stack.env.mathvariant = r);
                    },
                    SetSize: function (t, e, r) {
                        t.saveText(), (t.stack.env.mathsize = r);
                    },
                    CheckAutoload: function (t, e) {
                        var r = t.configuration.packageData.get('autoload'),
                            n = t.texParser;
                        e = e.slice(1);
                        var a = n.lookup('macro', e);
                        if (!a || (r && a._func === r.Autoload)) {
                            if ((n.parse('macro', [n, e]), !a)) return;
                            (0, o.retryAfter)(Promise.resolve());
                        }
                        n.parse('macro', [t, e]);
                    },
                    Macro: i.default.Macro,
                    Spacer: i.default.Spacer,
                    Hskip: i.default.Hskip,
                    rule: i.default.rule,
                    Rule: i.default.Rule,
                    HandleRef: i.default.HandleRef,
                };
            },
            787: function (t, e, r) {
                var n,
                    a =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
                                    }),
                                n(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = t;
                            }
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    o =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                a,
                                o = r.call(t),
                                i = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = o.next()).done; )
                                    i.push(n.value);
                            } catch (t) {
                                a = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = o.return) && r.call(o);
                                } finally {
                                    if (a) throw a.error;
                                }
                            }
                            return i;
                        },
                    s =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, a = 0, o = e.length; a < o; a++)
                                    (!n && a in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, a)),
                                        (n[a] = e[a]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    l =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.TextParser = void 0);
                var c = l(r(2193)),
                    u = l(r(3402)),
                    d = l(r(7398)),
                    p = r(2955),
                    f = l(r(4748)),
                    m = r(2935),
                    h = (function (t) {
                        function e(e, r, n, a) {
                            var o = t.call(this, e, r, n) || this;
                            return (o.level = a), o;
                        }
                        return (
                            a(e, t),
                            Object.defineProperty(e.prototype, 'texParser', {
                                get: function () {
                                    return this.configuration.packageData.get('textmacros')
                                        .texParser;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'tags', {
                                get: function () {
                                    return this.texParser.tags;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.mml = function () {
                                return null != this.level
                                    ? this.create('node', 'mstyle', this.nodes, {
                                          displaystyle: !1,
                                          scriptlevel: this.level,
                                      })
                                    : 1 === this.nodes.length
                                      ? this.nodes[0]
                                      : this.create('node', 'mrow', this.nodes);
                            }),
                            (e.prototype.Parse = function () {
                                (this.text = ''),
                                    (this.nodes = []),
                                    (this.envStack = []),
                                    t.prototype.Parse.call(this);
                            }),
                            (e.prototype.saveText = function () {
                                if (this.text) {
                                    var t = this.stack.env.mathvariant,
                                        e = d.default.internalText(
                                            this,
                                            this.text,
                                            t ? { mathvariant: t } : {},
                                        );
                                    (this.text = ''), this.Push(e);
                                }
                            }),
                            (e.prototype.Push = function (e) {
                                if ((this.text && this.saveText(), e instanceof m.StopItem))
                                    return t.prototype.Push.call(this, e);
                                e instanceof m.StyleItem
                                    ? (this.stack.env.mathcolor = this.stack.env.color)
                                    : e instanceof p.AbstractMmlNode &&
                                      (this.addAttributes(e), this.nodes.push(e));
                            }),
                            (e.prototype.PushMath = function (t) {
                                var e,
                                    r,
                                    n = this.stack.env;
                                t.isKind('TeXAtom') || (t = this.create('node', 'TeXAtom', [t]));
                                try {
                                    for (
                                        var a = o(['mathsize', 'mathcolor']), i = a.next();
                                        !i.done;
                                        i = a.next()
                                    ) {
                                        var s = i.value;
                                        n[s] &&
                                            !t.attributes.getExplicit(s) &&
                                            (t.isToken ||
                                                t.isKind('mstyle') ||
                                                (t = this.create('node', 'mstyle', [t])),
                                            f.default.setAttribute(t, s, n[s]));
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        i && !i.done && (r = a.return) && r.call(a);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                                t.isInferred && (t = this.create('node', 'mrow', t.childNodes)),
                                    this.nodes.push(t);
                            }),
                            (e.prototype.addAttributes = function (t) {
                                var e,
                                    r,
                                    n = this.stack.env;
                                if (t.isToken)
                                    try {
                                        for (
                                            var a = o(['mathsize', 'mathcolor', 'mathvariant']),
                                                i = a.next();
                                            !i.done;
                                            i = a.next()
                                        ) {
                                            var s = i.value;
                                            n[s] &&
                                                !t.attributes.getExplicit(s) &&
                                                f.default.setAttribute(t, s, n[s]);
                                        }
                                    } catch (t) {
                                        e = { error: t };
                                    } finally {
                                        try {
                                            i && !i.done && (r = a.return) && r.call(a);
                                        } finally {
                                            if (e) throw e.error;
                                        }
                                    }
                            }),
                            (e.prototype.ParseTextArg = function (t, r) {
                                return new e(
                                    this.GetArgument(t),
                                    (r = Object.assign(Object.assign({}, this.stack.env), r)),
                                    this.configuration,
                                ).mml();
                            }),
                            (e.prototype.ParseArg = function (t) {
                                return new e(
                                    this.GetArgument(t),
                                    this.stack.env,
                                    this.configuration,
                                ).mml();
                            }),
                            (e.prototype.Error = function (t, e) {
                                for (var r = [], n = 2; n < arguments.length; n++)
                                    r[n - 2] = arguments[n];
                                throw new (u.default.bind.apply(
                                    u.default,
                                    s([void 0, t, e], i(r), !1),
                                ))();
                            }),
                            e
                        );
                    })(c.default);
                e.TextParser = h;
            },
            5376: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.UnicodeConfiguration = e.UnicodeMethods = void 0);
                var a = r(251),
                    o = n(r(3402)),
                    i = r(5871),
                    s = n(r(7398)),
                    l = n(r(4748)),
                    c = r(992);
                e.UnicodeMethods = {};
                var u = {};
                (e.UnicodeMethods.Unicode = function (t, e) {
                    var r = t.GetBrackets(e),
                        n = null,
                        a = null;
                    r &&
                        (r.replace(/ /g, '').match(/^(\d+(\.\d*)?|\.\d+),(\d+(\.\d*)?|\.\d+)$/)
                            ? ((n = r.replace(/ /g, '').split(/,/)), (a = t.GetBrackets(e)))
                            : (a = r));
                    var i = s.default.trimSpaces(t.GetArgument(e)).replace(/^0x/, 'x');
                    if (!i.match(/^(x[0-9A-Fa-f]+|[0-9]+)$/))
                        throw new o.default('BadUnicode', 'Argument to \\unicode must be a number');
                    var d = parseInt(i.match(/^x/) ? '0' + i : i);
                    u[d] ? a || (a = u[d][2]) : (u[d] = [800, 200, a, d]),
                        n &&
                            ((u[d][0] = Math.floor(1e3 * parseFloat(n[0]))),
                            (u[d][1] = Math.floor(1e3 * parseFloat(n[1]))));
                    var p = t.stack.env.font,
                        f = {};
                    a
                        ? ((u[d][2] = f.fontfamily = a.replace(/'/g, "'")),
                          p &&
                              (p.match(/bold/) && (f.fontweight = 'bold'),
                              p.match(/italic|-mathit/) && (f.fontstyle = 'italic')))
                        : p && (f.mathvariant = p);
                    var m = t.create('token', 'mtext', f, (0, c.numeric)(i));
                    l.default.setProperty(m, 'unicode', !0), t.Push(m);
                }),
                    new i.CommandMap('unicode', { unicode: 'Unicode' }, e.UnicodeMethods),
                    (e.UnicodeConfiguration = a.Configuration.create('unicode', {
                        handler: { macro: ['unicode'] },
                    }));
            },
            7927: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.UpgreekConfiguration = void 0);
                var n = r(251),
                    a = r(5871),
                    o = r(6108);
                new a.CharacterMap(
                    'upgreek',
                    function (t, e) {
                        var r = e.attributes || {};
                        r.mathvariant = o.TexConstant.Variant.NORMAL;
                        var n = t.create('token', 'mi', r, e.char);
                        t.Push(n);
                    },
                    {
                        upalpha: '\u03b1',
                        upbeta: '\u03b2',
                        upgamma: '\u03b3',
                        updelta: '\u03b4',
                        upepsilon: '\u03f5',
                        upzeta: '\u03b6',
                        upeta: '\u03b7',
                        uptheta: '\u03b8',
                        upiota: '\u03b9',
                        upkappa: '\u03ba',
                        uplambda: '\u03bb',
                        upmu: '\u03bc',
                        upnu: '\u03bd',
                        upxi: '\u03be',
                        upomicron: '\u03bf',
                        uppi: '\u03c0',
                        uprho: '\u03c1',
                        upsigma: '\u03c3',
                        uptau: '\u03c4',
                        upupsilon: '\u03c5',
                        upphi: '\u03d5',
                        upchi: '\u03c7',
                        uppsi: '\u03c8',
                        upomega: '\u03c9',
                        upvarepsilon: '\u03b5',
                        upvartheta: '\u03d1',
                        upvarpi: '\u03d6',
                        upvarrho: '\u03f1',
                        upvarsigma: '\u03c2',
                        upvarphi: '\u03c6',
                        Upgamma: '\u0393',
                        Updelta: '\u0394',
                        Uptheta: '\u0398',
                        Uplambda: '\u039b',
                        Upxi: '\u039e',
                        Uppi: '\u03a0',
                        Upsigma: '\u03a3',
                        Upupsilon: '\u03a5',
                        Upphi: '\u03a6',
                        Uppsi: '\u03a8',
                        Upomega: '\u03a9',
                    },
                ),
                    (e.UpgreekConfiguration = n.Configuration.create('upgreek', {
                        handler: { macro: ['upgreek'] },
                    }));
            },
            8768: function (t, e, r) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.VerbConfiguration = e.VerbMethods = void 0);
                var a = r(251),
                    o = r(6108),
                    i = r(5871),
                    s = n(r(3402));
                (e.VerbMethods = {}),
                    (e.VerbMethods.Verb = function (t, e) {
                        var r = t.GetNext(),
                            n = ++t.i;
                        if ('' === r)
                            throw new s.default('MissingArgFor', 'Missing argument for %1', e);
                        for (; t.i < t.string.length && t.string.charAt(t.i) !== r; ) t.i++;
                        if (t.i === t.string.length)
                            throw new s.default(
                                'NoClosingDelim',
                                "Can't find closing delimiter for %1",
                                t.currentCS,
                            );
                        var a = t.string.slice(n, t.i).replace(/ /g, '\xa0');
                        t.i++,
                            t.Push(
                                t.create(
                                    'token',
                                    'mtext',
                                    { mathvariant: o.TexConstant.Variant.MONOSPACE },
                                    a,
                                ),
                            );
                    }),
                    new i.CommandMap('verb', { verb: 'Verb' }, e.VerbMethods),
                    (e.VerbConfiguration = a.Configuration.create('verb', {
                        handler: { macro: ['verb'] },
                    }));
            },
            8955: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.isObject = MathJax._.components.global.isObject),
                    (e.combineConfig = MathJax._.components.global.combineConfig),
                    (e.combineDefaults = MathJax._.components.global.combineDefaults),
                    (e.combineWithMathJax = MathJax._.components.global.combineWithMathJax),
                    (e.MathJax = MathJax._.components.global.MathJax);
            },
            2955: function (t, e) {
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
            8149: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.mathjax = MathJax._.mathjax.mathjax);
            },
            992: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.options = MathJax._.util.Entities.options),
                    (e.entities = MathJax._.util.Entities.entities),
                    (e.add = MathJax._.util.Entities.add),
                    (e.remove = MathJax._.util.Entities.remove),
                    (e.translate = MathJax._.util.Entities.translate),
                    (e.numeric = MathJax._.util.Entities.numeric);
            },
            5074: function (t, e) {
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
            3832: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.handleRetriesFor = MathJax._.util.Retries.handleRetriesFor),
                    (e.retryAfter = MathJax._.util.Retries.retryAfter);
            },
            1230: function (t, e) {
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
            2348: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.NodeFactory = MathJax._.input.tex.NodeFactory.NodeFactory);
            },
            4748: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.NodeUtil.default);
            },
            4945: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.ParseMethods.default);
            },
            5278: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.ParseOptions.default);
            },
            7398: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.ParseUtil.default);
            },
            8935: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.Stack.default);
            },
            1076: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlStack = MathJax._.input.tex.StackItem.MmlStack),
                    (e.BaseItem = MathJax._.input.tex.StackItem.BaseItem);
            },
            4924: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Symbol = MathJax._.input.tex.Symbol.Symbol),
                    (e.Macro = MathJax._.input.tex.Symbol.Macro);
            },
            5871: function (t, e) {
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
            4680: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Label = MathJax._.input.tex.Tags.Label),
                    (e.TagInfo = MathJax._.input.tex.Tags.TagInfo),
                    (e.AbstractTags = MathJax._.input.tex.Tags.AbstractTags),
                    (e.NoTags = MathJax._.input.tex.Tags.NoTags),
                    (e.AllTags = MathJax._.input.tex.Tags.AllTags),
                    (e.TagsFactory = MathJax._.input.tex.Tags.TagsFactory);
            },
            6108: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TexConstant = MathJax._.input.tex.TexConstants.TexConstant);
            },
            3402: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.TexError.default);
            },
            2193: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.TexParser.default);
            },
            2379: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Other = MathJax._.input.tex.base.BaseConfiguration.Other),
                    (e.BaseTags = MathJax._.input.tex.base.BaseConfiguration.BaseTags),
                    (e.BaseConfiguration =
                        MathJax._.input.tex.base.BaseConfiguration.BaseConfiguration);
            },
            2935: function (t, e) {
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
            7360: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.base.BaseMethods.default);
            },
            4282: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.PathFilters = MathJax._.components.loader.PathFilters),
                    (e.Loader = MathJax._.components.loader.Loader),
                    (e.MathJax = MathJax._.components.loader.MathJax),
                    (e.CONFIG = MathJax._.components.loader.CONFIG);
            },
            4629: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.PackageError = MathJax._.components.package.PackageError),
                    (e.Package = MathJax._.components.package.Package);
            },
            4652: function (t, e) {
                /*!
                 *************************************************************************
                 *
                 *  mhchemParser.ts
                 *  4.1.1
                 *
                 *  Parser for the \ce command and \pu command for MathJax and Co.
                 *
                 *  mhchem's \ce is a tool for writing beautiful chemical equations easily.
                 *  mhchem's \pu is a tool for writing physical units easily.
                 *
                 *  ----------------------------------------------------------------------
                 *
                 *  Copyright (c) 2015-2021 Martin Hensel
                 *
                 *  Licensed under the Apache License, Version 2.0 (the "License");
                 *  you may not use this file except in compliance with the License.
                 *  You may obtain a copy of the License at
                 *
                 *      http://www.apache.org/licenses/LICENSE-2.0
                 *
                 *  Unless required by applicable law or agreed to in writing, software
                 *  distributed under the License is distributed on an "AS IS" BASIS,
                 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                 *  See the License for the specific language governing permissions and
                 *  limitations under the License.
                 *
                 *  ----------------------------------------------------------------------
                 *
                 *  https://github.com/mhchem/mhchemParser
                 *
                 */
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.mhchemParser = void 0);
                var r = (function () {
                    function t() {}
                    return (
                        (t.toTex = function (t, e) {
                            return o.go(a.go(t, e), 'tex' !== e);
                        }),
                        t
                    );
                })();
                function n(t) {
                    var e,
                        r,
                        n = {};
                    for (e in t)
                        for (r in t[e]) {
                            var a = r.split('|');
                            t[e][r].stateArray = a;
                            for (var o = 0; o < a.length; o++) n[a[o]] = [];
                        }
                    for (e in t)
                        for (r in t[e])
                            for (a = t[e][r].stateArray || [], o = 0; o < a.length; o++) {
                                var i = t[e][r];
                                i.action_ = [].concat(i.action_);
                                for (var s = 0; s < i.action_.length; s++)
                                    'string' == typeof i.action_[s] &&
                                        (i.action_[s] = { type_: i.action_[s] });
                                for (var l = e.split('|'), c = 0; c < l.length; c++)
                                    if ('*' === a[o]) {
                                        var u = void 0;
                                        for (u in n) n[u].push({ pattern: l[c], task: i });
                                    } else n[a[o]].push({ pattern: l[c], task: i });
                            }
                    return n;
                }
                e.mhchemParser = r;
                var a = {
                        go: function (t, e) {
                            if (!t) return [];
                            void 0 === e && (e = 'ce');
                            var r,
                                n = '0',
                                o = {};
                            (o.parenthesisLevel = 0),
                                (t = (t = (t = t.replace(/\n/g, ' ')).replace(
                                    /[\u2212\u2013\u2014\u2010]/g,
                                    '-',
                                )).replace(/[\u2026]/g, '...'));
                            for (var i = 10, s = []; ; ) {
                                r !== t ? ((i = 10), (r = t)) : i--;
                                var l = a.stateMachines[e],
                                    c = l.transitions[n] || l.transitions['*'];
                                t: for (var u = 0; u < c.length; u++) {
                                    var d = a.patterns.match_(c[u].pattern, t);
                                    if (d) {
                                        for (var p = c[u].task, f = 0; f < p.action_.length; f++) {
                                            var m = void 0;
                                            if (l.actions[p.action_[f].type_])
                                                m = l.actions[p.action_[f].type_](
                                                    o,
                                                    d.match_,
                                                    p.action_[f].option,
                                                );
                                            else {
                                                if (!a.actions[p.action_[f].type_])
                                                    throw [
                                                        'MhchemBugA',
                                                        'mhchem bug A. Please report. (' +
                                                            p.action_[f].type_ +
                                                            ')',
                                                    ];
                                                m = a.actions[p.action_[f].type_](
                                                    o,
                                                    d.match_,
                                                    p.action_[f].option,
                                                );
                                            }
                                            a.concatArray(s, m);
                                        }
                                        if (((n = p.nextState || n), !(t.length > 0))) return s;
                                        if ((p.revisit || (t = d.remainder), !p.toContinue))
                                            break t;
                                    }
                                }
                                if (i <= 0) throw ['MhchemBugU', 'mhchem bug U. Please report.'];
                            }
                        },
                        concatArray: function (t, e) {
                            if (e)
                                if (Array.isArray(e))
                                    for (var r = 0; r < e.length; r++) t.push(e[r]);
                                else t.push(e);
                        },
                        patterns: {
                            patterns: {
                                empty: /^$/,
                                else: /^./,
                                else2: /^./,
                                space: /^\s/,
                                'space A': /^\s(?=[A-Z\\$])/,
                                space$: /^\s$/,
                                'a-z': /^[a-z]/,
                                x: /^x/,
                                x$: /^x$/,
                                i$: /^i$/,
                                letters:
                                    /^(?:[a-zA-Z\u03B1-\u03C9\u0391-\u03A9?@]|(?:\\(?:alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega)(?:\s+|\{\}|(?![a-zA-Z]))))+/,
                                '\\greek':
                                    /^\\(?:alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega)(?:\s+|\{\}|(?![a-zA-Z]))/,
                                'one lowercase latin letter $': /^(?:([a-z])(?:$|[^a-zA-Z]))$/,
                                '$one lowercase latin letter$ $':
                                    /^\$(?:([a-z])(?:$|[^a-zA-Z]))\$$/,
                                'one lowercase greek letter $':
                                    /^(?:\$?[\u03B1-\u03C9]\$?|\$?\\(?:alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega)\s*\$?)(?:\s+|\{\}|(?![a-zA-Z]))$/,
                                digits: /^[0-9]+/,
                                '-9.,9': /^[+\-]?(?:[0-9]+(?:[,.][0-9]+)?|[0-9]*(?:\.[0-9]+))/,
                                '-9.,9 no missing 0': /^[+\-]?[0-9]+(?:[.,][0-9]+)?/,
                                '(-)(9.,9)(e)(99)': function (t) {
                                    var e = t.match(
                                        /^(\+\-|\+\/\-|\+|\-|\\pm\s?)?([0-9]+(?:[,.][0-9]+)?|[0-9]*(?:\.[0-9]+))?(\((?:[0-9]+(?:[,.][0-9]+)?|[0-9]*(?:\.[0-9]+))\))?(?:(?:([eE])|\s*(\*|x|\\times|\u00D7)\s*10\^)([+\-]?[0-9]+|\{[+\-]?[0-9]+\}))?/,
                                    );
                                    return e && e[0]
                                        ? { match_: e.slice(1), remainder: t.substr(e[0].length) }
                                        : null;
                                },
                                '(-)(9)^(-9)':
                                    /^(\+\-|\+\/\-|\+|\-|\\pm\s?)?([0-9]+(?:[,.][0-9]+)?|[0-9]*(?:\.[0-9]+)?)\^([+\-]?[0-9]+|\{[+\-]?[0-9]+\})/,
                                'state of aggregation $': function (t) {
                                    var e = a.patterns.findObserveGroups(
                                        t,
                                        '',
                                        /^\([a-z]{1,3}(?=[\),])/,
                                        ')',
                                        '',
                                    );
                                    if (e && e.remainder.match(/^($|[\s,;\)\]\}])/)) return e;
                                    var r = t.match(/^(?:\((?:\\ca\s?)?\$[amothc]\$\))/);
                                    return r
                                        ? { match_: r[0], remainder: t.substr(r[0].length) }
                                        : null;
                                },
                                '_{(state of aggregation)}$': /^_\{(\([a-z]{1,3}\))\}/,
                                '{[(': /^(?:\\\{|\[|\()/,
                                ')]}': /^(?:\)|\]|\\\})/,
                                ', ': /^[,;]\s*/,
                                ',': /^[,;]/,
                                '.': /^[.]/,
                                '. __* ': /^([.\u22C5\u00B7\u2022]|[*])\s*/,
                                '...': /^\.\.\.(?=$|[^.])/,
                                '^{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(t, '^{', '', '', '}');
                                },
                                '^($...$)': function (t) {
                                    return a.patterns.findObserveGroups(t, '^', '$', '$', '');
                                },
                                '^a': /^\^([0-9]+|[^\\_])/,
                                '^\\x{}{}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '^',
                                        /^\\[a-zA-Z]+\{/,
                                        '}',
                                        '',
                                        '',
                                        '{',
                                        '}',
                                        '',
                                        !0,
                                    );
                                },
                                '^\\x{}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '^',
                                        /^\\[a-zA-Z]+\{/,
                                        '}',
                                        '',
                                    );
                                },
                                '^\\x': /^\^(\\[a-zA-Z]+)\s*/,
                                '^(-1)': /^\^(-?\d+)/,
                                "'": /^'/,
                                '_{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(t, '_{', '', '', '}');
                                },
                                '_($...$)': function (t) {
                                    return a.patterns.findObserveGroups(t, '_', '$', '$', '');
                                },
                                _9: /^_([+\-]?[0-9]+|[^\\])/,
                                '_\\x{}{}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '_',
                                        /^\\[a-zA-Z]+\{/,
                                        '}',
                                        '',
                                        '',
                                        '{',
                                        '}',
                                        '',
                                        !0,
                                    );
                                },
                                '_\\x{}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '_',
                                        /^\\[a-zA-Z]+\{/,
                                        '}',
                                        '',
                                    );
                                },
                                '_\\x': /^_(\\[a-zA-Z]+)\s*/,
                                '^_': /^(?:\^(?=_)|\_(?=\^)|[\^_]$)/,
                                '{}^': /^\{\}(?=\^)/,
                                '{}': /^\{\}/,
                                '{...}': function (t) {
                                    return a.patterns.findObserveGroups(t, '', '{', '}', '');
                                },
                                '{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(t, '{', '', '', '}');
                                },
                                '$...$': function (t) {
                                    return a.patterns.findObserveGroups(t, '', '$', '$', '');
                                },
                                '${(...)}$__$(...)$': function (t) {
                                    return (
                                        a.patterns.findObserveGroups(t, '${', '', '', '}$') ||
                                        a.patterns.findObserveGroups(t, '$', '', '', '$')
                                    );
                                },
                                '=<>': /^[=<>]/,
                                '#': /^[#\u2261]/,
                                '+': /^\+/,
                                '-$': /^-(?=[\s_},;\]/]|$|\([a-z]+\))/,
                                '-9': /^-(?=[0-9])/,
                                '- orbital overlap': /^-(?=(?:[spd]|sp)(?:$|[\s,;\)\]\}]))/,
                                '-': /^-/,
                                'pm-operator': /^(?:\\pm|\$\\pm\$|\+-|\+\/-)/,
                                operator:
                                    /^(?:\+|(?:[\-=<>]|<<|>>|\\approx|\$\\approx\$)(?=\s|$|-?[0-9]))/,
                                arrowUpDown: /^(?:v|\(v\)|\^|\(\^\))(?=$|[\s,;\)\]\}])/,
                                '\\bond{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(t, '\\bond{', '', '', '}');
                                },
                                '->': /^(?:<->|<-->|->|<-|<=>>|<<=>|<=>|[\u2192\u27F6\u21CC])/,
                                CMT: /^[CMT](?=\[)/,
                                '[(...)]': function (t) {
                                    return a.patterns.findObserveGroups(t, '[', '', '', ']');
                                },
                                '1st-level escape': /^(&|\\\\|\\hline)\s*/,
                                '\\,': /^(?:\\[,\ ;:])/,
                                '\\x{}{}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '',
                                        /^\\[a-zA-Z]+\{/,
                                        '}',
                                        '',
                                        '',
                                        '{',
                                        '}',
                                        '',
                                        !0,
                                    );
                                },
                                '\\x{}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '',
                                        /^\\[a-zA-Z]+\{/,
                                        '}',
                                        '',
                                    );
                                },
                                '\\ca': /^\\ca(?:\s+|(?![a-zA-Z]))/,
                                '\\x': /^(?:\\[a-zA-Z]+\s*|\\[_&{}%])/,
                                orbital: /^(?:[0-9]{1,2}[spdfgh]|[0-9]{0,2}sp)(?=$|[^a-zA-Z])/,
                                others: /^[\/~|]/,
                                '\\frac{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '\\frac{',
                                        '',
                                        '',
                                        '}',
                                        '{',
                                        '',
                                        '',
                                        '}',
                                    );
                                },
                                '\\overset{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '\\overset{',
                                        '',
                                        '',
                                        '}',
                                        '{',
                                        '',
                                        '',
                                        '}',
                                    );
                                },
                                '\\underset{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '\\underset{',
                                        '',
                                        '',
                                        '}',
                                        '{',
                                        '',
                                        '',
                                        '}',
                                    );
                                },
                                '\\underbrace{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(
                                        t,
                                        '\\underbrace{',
                                        '',
                                        '',
                                        '}_',
                                        '{',
                                        '',
                                        '',
                                        '}',
                                    );
                                },
                                '\\color{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(t, '\\color{', '', '', '}');
                                },
                                '\\color{(...)}{(...)}': function (t) {
                                    return (
                                        a.patterns.findObserveGroups(
                                            t,
                                            '\\color{',
                                            '',
                                            '',
                                            '}',
                                            '{',
                                            '',
                                            '',
                                            '}',
                                        ) ||
                                        a.patterns.findObserveGroups(
                                            t,
                                            '\\color',
                                            '\\',
                                            '',
                                            /^(?=\{)/,
                                            '{',
                                            '',
                                            '',
                                            '}',
                                        )
                                    );
                                },
                                '\\ce{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(t, '\\ce{', '', '', '}');
                                },
                                '\\pu{(...)}': function (t) {
                                    return a.patterns.findObserveGroups(t, '\\pu{', '', '', '}');
                                },
                                oxidation$: /^(?:[+-][IVX]+|\\pm\s*0|\$\\pm\$\s*0)$/,
                                'd-oxidation$': /^(?:[+-]?\s?[IVX]+|\\pm\s*0|\$\\pm\$\s*0)$/,
                                'roman numeral': /^[IVX]+/,
                                '1/2$': /^[+\-]?(?:[0-9]+|\$[a-z]\$|[a-z])\/[0-9]+(?:\$[a-z]\$|[a-z])?$/,
                                amount: function (t) {
                                    var e;
                                    if (
                                        (e = t.match(
                                            /^(?:(?:(?:\([+\-]?[0-9]+\/[0-9]+\)|[+\-]?(?:[0-9]+|\$[a-z]\$|[a-z])\/[0-9]+|[+\-]?[0-9]+[.,][0-9]+|[+\-]?\.[0-9]+|[+\-]?[0-9]+)(?:[a-z](?=\s*[A-Z]))?)|[+\-]?[a-z](?=\s*[A-Z])|\+(?!\s))/,
                                        ))
                                    )
                                        return { match_: e[0], remainder: t.substr(e[0].length) };
                                    var r = a.patterns.findObserveGroups(t, '', '$', '$', '');
                                    return r &&
                                        (e = r.match_.match(
                                            /^\$(?:\(?[+\-]?(?:[0-9]*[a-z]?[+\-])?[0-9]*[a-z](?:[+\-][0-9]*[a-z]?)?\)?|\+|-)\$$/,
                                        ))
                                        ? { match_: e[0], remainder: t.substr(e[0].length) }
                                        : null;
                                },
                                amount2: function (t) {
                                    return this.amount(t);
                                },
                                '(KV letters),': /^(?:[A-Z][a-z]{0,2}|i)(?=,)/,
                                formula$: function (t) {
                                    if (t.match(/^\([a-z]+\)$/)) return null;
                                    var e = t.match(
                                        /^(?:[a-z]|(?:[0-9\ \+\-\,\.\(\)]+[a-z])+[0-9\ \+\-\,\.\(\)]*|(?:[a-z][0-9\ \+\-\,\.\(\)]+)+[a-z]?)$/,
                                    );
                                    return e
                                        ? { match_: e[0], remainder: t.substr(e[0].length) }
                                        : null;
                                },
                                uprightEntities: /^(?:pH|pOH|pC|pK|iPr|iBu)(?=$|[^a-zA-Z])/,
                                '/': /^\s*(\/)\s*/,
                                '//': /^\s*(\/\/)\s*/,
                                '*': /^\s*[*.]\s*/,
                            },
                            findObserveGroups: function (t, e, r, n, a, o, i, s, l, c) {
                                var u = function (t, e) {
                                        if ('string' == typeof e)
                                            return 0 !== t.indexOf(e) ? null : e;
                                        var r = t.match(e);
                                        return r ? r[0] : null;
                                    },
                                    d = u(t, e);
                                if (null === d) return null;
                                if (((t = t.substr(d.length)), null === (d = u(t, r)))) return null;
                                var p = (function (t, e, r) {
                                    for (var n = 0; e < t.length; ) {
                                        var a = t.charAt(e),
                                            o = u(t.substr(e), r);
                                        if (null !== o && 0 === n)
                                            return { endMatchBegin: e, endMatchEnd: e + o.length };
                                        if ('{' === a) n++;
                                        else if ('}' === a) {
                                            if (0 === n)
                                                throw [
                                                    'ExtraCloseMissingOpen',
                                                    'Extra close brace or missing open brace',
                                                ];
                                            n--;
                                        }
                                        e++;
                                    }
                                    return null;
                                })(t, d.length, n || a);
                                if (null === p) return null;
                                var f = t.substring(0, n ? p.endMatchEnd : p.endMatchBegin);
                                if (o || i) {
                                    var m = this.findObserveGroups(
                                        t.substr(p.endMatchEnd),
                                        o,
                                        i,
                                        s,
                                        l,
                                    );
                                    if (null === m) return null;
                                    var h = [f, m.match_];
                                    return { match_: c ? h.join('') : h, remainder: m.remainder };
                                }
                                return { match_: f, remainder: t.substr(p.endMatchEnd) };
                            },
                            match_: function (t, e) {
                                var r = a.patterns.patterns[t];
                                if (void 0 === r)
                                    throw [
                                        'MhchemBugP',
                                        'mhchem bug P. Please report. (' + t + ')',
                                    ];
                                if ('function' == typeof r) return a.patterns.patterns[t](e);
                                var n = e.match(r);
                                return n
                                    ? n.length > 2
                                        ? { match_: n.slice(1), remainder: e.substr(n[0].length) }
                                        : { match_: n[1] || n[0], remainder: e.substr(n[0].length) }
                                    : null;
                            },
                        },
                        actions: {
                            'a=': function (t, e) {
                                t.a = (t.a || '') + e;
                            },
                            'b=': function (t, e) {
                                t.b = (t.b || '') + e;
                            },
                            'p=': function (t, e) {
                                t.p = (t.p || '') + e;
                            },
                            'o=': function (t, e) {
                                t.o = (t.o || '') + e;
                            },
                            'q=': function (t, e) {
                                t.q = (t.q || '') + e;
                            },
                            'd=': function (t, e) {
                                t.d = (t.d || '') + e;
                            },
                            'rm=': function (t, e) {
                                t.rm = (t.rm || '') + e;
                            },
                            'text=': function (t, e) {
                                t.text_ = (t.text_ || '') + e;
                            },
                            insert: function (t, e, r) {
                                return { type_: r };
                            },
                            'insert+p1': function (t, e, r) {
                                return { type_: r, p1: e };
                            },
                            'insert+p1+p2': function (t, e, r) {
                                return { type_: r, p1: e[0], p2: e[1] };
                            },
                            copy: function (t, e) {
                                return e;
                            },
                            write: function (t, e, r) {
                                return r;
                            },
                            rm: function (t, e) {
                                return { type_: 'rm', p1: e };
                            },
                            text: function (t, e) {
                                return a.go(e, 'text');
                            },
                            'tex-math': function (t, e) {
                                return a.go(e, 'tex-math');
                            },
                            'tex-math tight': function (t, e) {
                                return a.go(e, 'tex-math tight');
                            },
                            bond: function (t, e, r) {
                                return { type_: 'bond', kind_: r || e };
                            },
                            'color0-output': function (t, e) {
                                return { type_: 'color0', color: e };
                            },
                            ce: function (t, e) {
                                return a.go(e, 'ce');
                            },
                            pu: function (t, e) {
                                return a.go(e, 'pu');
                            },
                            '1/2': function (t, e) {
                                var r = [];
                                e.match(/^[+\-]/) && (r.push(e.substr(0, 1)), (e = e.substr(1)));
                                var n = e.match(
                                    /^([0-9]+|\$[a-z]\$|[a-z])\/([0-9]+)(\$[a-z]\$|[a-z])?$/,
                                );
                                return (
                                    (n[1] = n[1].replace(/\$/g, '')),
                                    r.push({ type_: 'frac', p1: n[1], p2: n[2] }),
                                    n[3] &&
                                        ((n[3] = n[3].replace(/\$/g, '')),
                                        r.push({ type_: 'tex-math', p1: n[3] })),
                                    r
                                );
                            },
                            '9,9': function (t, e) {
                                return a.go(e, '9,9');
                            },
                        },
                        stateMachines: {
                            tex: {
                                transitions: n({
                                    empty: { 0: { action_: 'copy' } },
                                    '\\ce{(...)}': {
                                        0: {
                                            action_: [
                                                { type_: 'write', option: '{' },
                                                'ce',
                                                { type_: 'write', option: '}' },
                                            ],
                                        },
                                    },
                                    '\\pu{(...)}': {
                                        0: {
                                            action_: [
                                                { type_: 'write', option: '{' },
                                                'pu',
                                                { type_: 'write', option: '}' },
                                            ],
                                        },
                                    },
                                    else: { 0: { action_: 'copy' } },
                                }),
                                actions: {},
                            },
                            ce: {
                                transitions: n({
                                    empty: { '*': { action_: 'output' } },
                                    else: {
                                        '0|1|2': {
                                            action_: 'beginsWithBond=false',
                                            revisit: !0,
                                            toContinue: !0,
                                        },
                                    },
                                    oxidation$: { 0: { action_: 'oxidation-output' } },
                                    CMT: {
                                        r: { action_: 'rdt=', nextState: 'rt' },
                                        rd: { action_: 'rqt=', nextState: 'rdt' },
                                    },
                                    arrowUpDown: {
                                        '0|1|2|as': {
                                            action_: ['sb=false', 'output', 'operator'],
                                            nextState: '1',
                                        },
                                    },
                                    uprightEntities: {
                                        '0|1|2': { action_: ['o=', 'output'], nextState: '1' },
                                    },
                                    orbital: { '0|1|2|3': { action_: 'o=', nextState: 'o' } },
                                    '->': {
                                        '0|1|2|3': { action_: 'r=', nextState: 'r' },
                                        'a|as': { action_: ['output', 'r='], nextState: 'r' },
                                        '*': { action_: ['output', 'r='], nextState: 'r' },
                                    },
                                    '+': {
                                        o: { action_: 'd= kv', nextState: 'd' },
                                        'd|D': { action_: 'd=', nextState: 'd' },
                                        q: { action_: 'd=', nextState: 'qd' },
                                        'qd|qD': { action_: 'd=', nextState: 'qd' },
                                        dq: { action_: ['output', 'd='], nextState: 'd' },
                                        3: {
                                            action_: ['sb=false', 'output', 'operator'],
                                            nextState: '0',
                                        },
                                    },
                                    amount: { '0|2': { action_: 'a=', nextState: 'a' } },
                                    'pm-operator': {
                                        '0|1|2|a|as': {
                                            action_: [
                                                'sb=false',
                                                'output',
                                                { type_: 'operator', option: '\\pm' },
                                            ],
                                            nextState: '0',
                                        },
                                    },
                                    operator: {
                                        '0|1|2|a|as': {
                                            action_: ['sb=false', 'output', 'operator'],
                                            nextState: '0',
                                        },
                                    },
                                    '-$': {
                                        'o|q': {
                                            action_: ['charge or bond', 'output'],
                                            nextState: 'qd',
                                        },
                                        d: { action_: 'd=', nextState: 'd' },
                                        D: {
                                            action_: ['output', { type_: 'bond', option: '-' }],
                                            nextState: '3',
                                        },
                                        q: { action_: 'd=', nextState: 'qd' },
                                        qd: { action_: 'd=', nextState: 'qd' },
                                        'qD|dq': {
                                            action_: ['output', { type_: 'bond', option: '-' }],
                                            nextState: '3',
                                        },
                                    },
                                    '-9': {
                                        '3|o': {
                                            action_: [
                                                'output',
                                                { type_: 'insert', option: 'hyphen' },
                                            ],
                                            nextState: '3',
                                        },
                                    },
                                    '- orbital overlap': {
                                        o: {
                                            action_: [
                                                'output',
                                                { type_: 'insert', option: 'hyphen' },
                                            ],
                                            nextState: '2',
                                        },
                                        d: {
                                            action_: [
                                                'output',
                                                { type_: 'insert', option: 'hyphen' },
                                            ],
                                            nextState: '2',
                                        },
                                    },
                                    '-': {
                                        '0|1|2': {
                                            action_: [
                                                { type_: 'output', option: 1 },
                                                'beginsWithBond=true',
                                                { type_: 'bond', option: '-' },
                                            ],
                                            nextState: '3',
                                        },
                                        3: { action_: { type_: 'bond', option: '-' } },
                                        a: {
                                            action_: [
                                                'output',
                                                { type_: 'insert', option: 'hyphen' },
                                            ],
                                            nextState: '2',
                                        },
                                        as: {
                                            action_: [
                                                { type_: 'output', option: 2 },
                                                { type_: 'bond', option: '-' },
                                            ],
                                            nextState: '3',
                                        },
                                        b: { action_: 'b=' },
                                        o: {
                                            action_: { type_: '- after o/d', option: !1 },
                                            nextState: '2',
                                        },
                                        q: {
                                            action_: { type_: '- after o/d', option: !1 },
                                            nextState: '2',
                                        },
                                        'd|qd|dq': {
                                            action_: { type_: '- after o/d', option: !0 },
                                            nextState: '2',
                                        },
                                        'D|qD|p': {
                                            action_: ['output', { type_: 'bond', option: '-' }],
                                            nextState: '3',
                                        },
                                    },
                                    amount2: { '1|3': { action_: 'a=', nextState: 'a' } },
                                    letters: {
                                        '0|1|2|3|a|as|b|p|bp|o': { action_: 'o=', nextState: 'o' },
                                        'q|dq': { action_: ['output', 'o='], nextState: 'o' },
                                        'd|D|qd|qD': { action_: 'o after d', nextState: 'o' },
                                    },
                                    digits: {
                                        o: { action_: 'q=', nextState: 'q' },
                                        'd|D': { action_: 'q=', nextState: 'dq' },
                                        q: { action_: ['output', 'o='], nextState: 'o' },
                                        a: { action_: 'o=', nextState: 'o' },
                                    },
                                    'space A': { 'b|p|bp': { action_: [] } },
                                    space: {
                                        a: { action_: [], nextState: 'as' },
                                        0: { action_: 'sb=false' },
                                        '1|2': { action_: 'sb=true' },
                                        'r|rt|rd|rdt|rdq': { action_: 'output', nextState: '0' },
                                        '*': { action_: ['output', 'sb=true'], nextState: '1' },
                                    },
                                    '1st-level escape': {
                                        '1|2': {
                                            action_: [
                                                'output',
                                                { type_: 'insert+p1', option: '1st-level escape' },
                                            ],
                                        },
                                        '*': {
                                            action_: [
                                                'output',
                                                { type_: 'insert+p1', option: '1st-level escape' },
                                            ],
                                            nextState: '0',
                                        },
                                    },
                                    '[(...)]': {
                                        'r|rt': { action_: 'rd=', nextState: 'rd' },
                                        'rd|rdt': { action_: 'rq=', nextState: 'rdq' },
                                    },
                                    '...': {
                                        'o|d|D|dq|qd|qD': {
                                            action_: ['output', { type_: 'bond', option: '...' }],
                                            nextState: '3',
                                        },
                                        '*': {
                                            action_: [
                                                { type_: 'output', option: 1 },
                                                { type_: 'insert', option: 'ellipsis' },
                                            ],
                                            nextState: '1',
                                        },
                                    },
                                    '. __* ': {
                                        '*': {
                                            action_: [
                                                'output',
                                                { type_: 'insert', option: 'addition compound' },
                                            ],
                                            nextState: '1',
                                        },
                                    },
                                    'state of aggregation $': {
                                        '*': {
                                            action_: ['output', 'state of aggregation'],
                                            nextState: '1',
                                        },
                                    },
                                    '{[(': {
                                        'a|as|o': {
                                            action_: ['o=', 'output', 'parenthesisLevel++'],
                                            nextState: '2',
                                        },
                                        '0|1|2|3': {
                                            action_: ['o=', 'output', 'parenthesisLevel++'],
                                            nextState: '2',
                                        },
                                        '*': {
                                            action_: [
                                                'output',
                                                'o=',
                                                'output',
                                                'parenthesisLevel++',
                                            ],
                                            nextState: '2',
                                        },
                                    },
                                    ')]}': {
                                        '0|1|2|3|b|p|bp|o': {
                                            action_: ['o=', 'parenthesisLevel--'],
                                            nextState: 'o',
                                        },
                                        'a|as|d|D|q|qd|qD|dq': {
                                            action_: ['output', 'o=', 'parenthesisLevel--'],
                                            nextState: 'o',
                                        },
                                    },
                                    ', ': { '*': { action_: ['output', 'comma'], nextState: '0' } },
                                    '^_': { '*': { action_: [] } },
                                    '^{(...)}|^($...$)': {
                                        '0|1|2|as': { action_: 'b=', nextState: 'b' },
                                        p: { action_: 'b=', nextState: 'bp' },
                                        '3|o': { action_: 'd= kv', nextState: 'D' },
                                        q: { action_: 'd=', nextState: 'qD' },
                                        'd|D|qd|qD|dq': {
                                            action_: ['output', 'd='],
                                            nextState: 'D',
                                        },
                                    },
                                    "^a|^\\x{}{}|^\\x{}|^\\x|'": {
                                        '0|1|2|as': { action_: 'b=', nextState: 'b' },
                                        p: { action_: 'b=', nextState: 'bp' },
                                        '3|o': { action_: 'd= kv', nextState: 'd' },
                                        q: { action_: 'd=', nextState: 'qd' },
                                        'd|qd|D|qD': { action_: 'd=' },
                                        dq: { action_: ['output', 'd='], nextState: 'd' },
                                    },
                                    '_{(state of aggregation)}$': {
                                        'd|D|q|qd|qD|dq': {
                                            action_: ['output', 'q='],
                                            nextState: 'q',
                                        },
                                    },
                                    '_{(...)}|_($...$)|_9|_\\x{}{}|_\\x{}|_\\x': {
                                        '0|1|2|as': { action_: 'p=', nextState: 'p' },
                                        b: { action_: 'p=', nextState: 'bp' },
                                        '3|o': { action_: 'q=', nextState: 'q' },
                                        'd|D': { action_: 'q=', nextState: 'dq' },
                                        'q|qd|qD|dq': { action_: ['output', 'q='], nextState: 'q' },
                                    },
                                    '=<>': {
                                        '0|1|2|3|a|as|o|q|d|D|qd|qD|dq': {
                                            action_: [{ type_: 'output', option: 2 }, 'bond'],
                                            nextState: '3',
                                        },
                                    },
                                    '#': {
                                        '0|1|2|3|a|as|o': {
                                            action_: [
                                                { type_: 'output', option: 2 },
                                                { type_: 'bond', option: '#' },
                                            ],
                                            nextState: '3',
                                        },
                                    },
                                    '{}^': {
                                        '*': {
                                            action_: [
                                                { type_: 'output', option: 1 },
                                                { type_: 'insert', option: 'tinySkip' },
                                            ],
                                            nextState: '1',
                                        },
                                    },
                                    '{}': {
                                        '*': {
                                            action_: { type_: 'output', option: 1 },
                                            nextState: '1',
                                        },
                                    },
                                    '{...}': {
                                        '0|1|2|3|a|as|b|p|bp': { action_: 'o=', nextState: 'o' },
                                        'o|d|D|q|qd|qD|dq': {
                                            action_: ['output', 'o='],
                                            nextState: 'o',
                                        },
                                    },
                                    '$...$': {
                                        a: { action_: 'a=' },
                                        '0|1|2|3|as|b|p|bp|o': { action_: 'o=', nextState: 'o' },
                                        'as|o': { action_: 'o=' },
                                        'q|d|D|qd|qD|dq': {
                                            action_: ['output', 'o='],
                                            nextState: 'o',
                                        },
                                    },
                                    '\\bond{(...)}': {
                                        '*': {
                                            action_: [{ type_: 'output', option: 2 }, 'bond'],
                                            nextState: '3',
                                        },
                                    },
                                    '\\frac{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'output', option: 1 },
                                                'frac-output',
                                            ],
                                            nextState: '3',
                                        },
                                    },
                                    '\\overset{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'output', option: 2 },
                                                'overset-output',
                                            ],
                                            nextState: '3',
                                        },
                                    },
                                    '\\underset{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'output', option: 2 },
                                                'underset-output',
                                            ],
                                            nextState: '3',
                                        },
                                    },
                                    '\\underbrace{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'output', option: 2 },
                                                'underbrace-output',
                                            ],
                                            nextState: '3',
                                        },
                                    },
                                    '\\color{(...)}{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'output', option: 2 },
                                                'color-output',
                                            ],
                                            nextState: '3',
                                        },
                                    },
                                    '\\color{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'output', option: 2 },
                                                'color0-output',
                                            ],
                                        },
                                    },
                                    '\\ce{(...)}': {
                                        '*': {
                                            action_: [{ type_: 'output', option: 2 }, 'ce'],
                                            nextState: '3',
                                        },
                                    },
                                    '\\,': {
                                        '*': {
                                            action_: [{ type_: 'output', option: 1 }, 'copy'],
                                            nextState: '1',
                                        },
                                    },
                                    '\\pu{(...)}': {
                                        '*': {
                                            action_: [
                                                'output',
                                                { type_: 'write', option: '{' },
                                                'pu',
                                                { type_: 'write', option: '}' },
                                            ],
                                            nextState: '3',
                                        },
                                    },
                                    '\\x{}{}|\\x{}|\\x': {
                                        '0|1|2|3|a|as|b|p|bp|o|c0': {
                                            action_: ['o=', 'output'],
                                            nextState: '3',
                                        },
                                        '*': {
                                            action_: ['output', 'o=', 'output'],
                                            nextState: '3',
                                        },
                                    },
                                    others: {
                                        '*': {
                                            action_: [{ type_: 'output', option: 1 }, 'copy'],
                                            nextState: '3',
                                        },
                                    },
                                    else2: {
                                        a: { action_: 'a to o', nextState: 'o', revisit: !0 },
                                        as: {
                                            action_: ['output', 'sb=true'],
                                            nextState: '1',
                                            revisit: !0,
                                        },
                                        'r|rt|rd|rdt|rdq': {
                                            action_: ['output'],
                                            nextState: '0',
                                            revisit: !0,
                                        },
                                        '*': { action_: ['output', 'copy'], nextState: '3' },
                                    },
                                }),
                                actions: {
                                    'o after d': function (t, e) {
                                        var r;
                                        if ((t.d || '').match(/^[1-9][0-9]*$/)) {
                                            var n = t.d;
                                            (t.d = void 0),
                                                (r = this.output(t)).push({ type_: 'tinySkip' }),
                                                (t.b = n);
                                        } else r = this.output(t);
                                        return a.actions['o='](t, e), r;
                                    },
                                    'd= kv': function (t, e) {
                                        (t.d = e), (t.dType = 'kv');
                                    },
                                    'charge or bond': function (t, e) {
                                        if (t.beginsWithBond) {
                                            var r = [];
                                            return (
                                                a.concatArray(r, this.output(t)),
                                                a.concatArray(r, a.actions.bond(t, e, '-')),
                                                r
                                            );
                                        }
                                        t.d = e;
                                    },
                                    '- after o/d': function (t, e, r) {
                                        var n = a.patterns.match_('orbital', t.o || ''),
                                            o = a.patterns.match_(
                                                'one lowercase greek letter $',
                                                t.o || '',
                                            ),
                                            i = a.patterns.match_(
                                                'one lowercase latin letter $',
                                                t.o || '',
                                            ),
                                            s = a.patterns.match_(
                                                '$one lowercase latin letter$ $',
                                                t.o || '',
                                            ),
                                            l =
                                                '-' === e &&
                                                ((n && '' === n.remainder) || o || i || s);
                                        !l ||
                                            t.a ||
                                            t.b ||
                                            t.p ||
                                            t.d ||
                                            t.q ||
                                            n ||
                                            !i ||
                                            (t.o = '$' + t.o + '$');
                                        var c = [];
                                        return (
                                            l
                                                ? (a.concatArray(c, this.output(t)),
                                                  c.push({ type_: 'hyphen' }))
                                                : ((n = a.patterns.match_('digits', t.d || '')),
                                                  r && n && '' === n.remainder
                                                      ? (a.concatArray(c, a.actions['d='](t, e)),
                                                        a.concatArray(c, this.output(t)))
                                                      : (a.concatArray(c, this.output(t)),
                                                        a.concatArray(
                                                            c,
                                                            a.actions.bond(t, e, '-'),
                                                        ))),
                                            c
                                        );
                                    },
                                    'a to o': function (t) {
                                        (t.o = t.a), (t.a = void 0);
                                    },
                                    'sb=true': function (t) {
                                        t.sb = !0;
                                    },
                                    'sb=false': function (t) {
                                        t.sb = !1;
                                    },
                                    'beginsWithBond=true': function (t) {
                                        t.beginsWithBond = !0;
                                    },
                                    'beginsWithBond=false': function (t) {
                                        t.beginsWithBond = !1;
                                    },
                                    'parenthesisLevel++': function (t) {
                                        t.parenthesisLevel++;
                                    },
                                    'parenthesisLevel--': function (t) {
                                        t.parenthesisLevel--;
                                    },
                                    'state of aggregation': function (t, e) {
                                        return { type_: 'state of aggregation', p1: a.go(e, 'o') };
                                    },
                                    comma: function (t, e) {
                                        var r = e.replace(/\s*$/, '');
                                        return r !== e && 0 === t.parenthesisLevel
                                            ? { type_: 'comma enumeration L', p1: r }
                                            : { type_: 'comma enumeration M', p1: r };
                                    },
                                    output: function (t, e, r) {
                                        var n;
                                        if (t.r) {
                                            var o = void 0;
                                            o =
                                                'M' === t.rdt
                                                    ? a.go(t.rd, 'tex-math')
                                                    : 'T' === t.rdt
                                                      ? [{ type_: 'text', p1: t.rd || '' }]
                                                      : a.go(t.rd, 'ce');
                                            var i = void 0;
                                            (i =
                                                'M' === t.rqt
                                                    ? a.go(t.rq, 'tex-math')
                                                    : 'T' === t.rqt
                                                      ? [{ type_: 'text', p1: t.rq || '' }]
                                                      : a.go(t.rq, 'ce')),
                                                (n = { type_: 'arrow', r: t.r, rd: o, rq: i });
                                        } else
                                            (n = []),
                                                (t.a || t.b || t.p || t.o || t.q || t.d || r) &&
                                                    (t.sb && n.push({ type_: 'entitySkip' }),
                                                    t.o || t.q || t.d || t.b || t.p || 2 === r
                                                        ? t.o || t.q || t.d || (!t.b && !t.p)
                                                            ? t.o &&
                                                              'kv' === t.dType &&
                                                              a.patterns.match_(
                                                                  'd-oxidation$',
                                                                  t.d || '',
                                                              )
                                                                ? (t.dType = 'oxidation')
                                                                : t.o &&
                                                                  'kv' === t.dType &&
                                                                  !t.q &&
                                                                  (t.dType = void 0)
                                                            : ((t.o = t.a),
                                                              (t.d = t.b),
                                                              (t.q = t.p),
                                                              (t.a = t.b = t.p = void 0))
                                                        : ((t.o = t.a), (t.a = void 0)),
                                                    n.push({
                                                        type_: 'chemfive',
                                                        a: a.go(t.a, 'a'),
                                                        b: a.go(t.b, 'bd'),
                                                        p: a.go(t.p, 'pq'),
                                                        o: a.go(t.o, 'o'),
                                                        q: a.go(t.q, 'pq'),
                                                        d: a.go(
                                                            t.d,
                                                            'oxidation' === t.dType
                                                                ? 'oxidation'
                                                                : 'bd',
                                                        ),
                                                        dType: t.dType,
                                                    }));
                                        for (var s in t)
                                            'parenthesisLevel' !== s &&
                                                'beginsWithBond' !== s &&
                                                delete t[s];
                                        return n;
                                    },
                                    'oxidation-output': function (t, e) {
                                        var r = ['{'];
                                        return (
                                            a.concatArray(r, a.go(e, 'oxidation')), r.push('}'), r
                                        );
                                    },
                                    'frac-output': function (t, e) {
                                        return {
                                            type_: 'frac-ce',
                                            p1: a.go(e[0], 'ce'),
                                            p2: a.go(e[1], 'ce'),
                                        };
                                    },
                                    'overset-output': function (t, e) {
                                        return {
                                            type_: 'overset',
                                            p1: a.go(e[0], 'ce'),
                                            p2: a.go(e[1], 'ce'),
                                        };
                                    },
                                    'underset-output': function (t, e) {
                                        return {
                                            type_: 'underset',
                                            p1: a.go(e[0], 'ce'),
                                            p2: a.go(e[1], 'ce'),
                                        };
                                    },
                                    'underbrace-output': function (t, e) {
                                        return {
                                            type_: 'underbrace',
                                            p1: a.go(e[0], 'ce'),
                                            p2: a.go(e[1], 'ce'),
                                        };
                                    },
                                    'color-output': function (t, e) {
                                        return {
                                            type_: 'color',
                                            color1: e[0],
                                            color2: a.go(e[1], 'ce'),
                                        };
                                    },
                                    'r=': function (t, e) {
                                        t.r = e;
                                    },
                                    'rdt=': function (t, e) {
                                        t.rdt = e;
                                    },
                                    'rd=': function (t, e) {
                                        t.rd = e;
                                    },
                                    'rqt=': function (t, e) {
                                        t.rqt = e;
                                    },
                                    'rq=': function (t, e) {
                                        t.rq = e;
                                    },
                                    operator: function (t, e, r) {
                                        return { type_: 'operator', kind_: r || e };
                                    },
                                },
                            },
                            a: {
                                transitions: n({
                                    empty: { '*': { action_: [] } },
                                    '1/2$': { 0: { action_: '1/2' } },
                                    else: { 0: { action_: [], nextState: '1', revisit: !0 } },
                                    '${(...)}$__$(...)$': {
                                        '*': { action_: 'tex-math tight', nextState: '1' },
                                    },
                                    ',': {
                                        '*': {
                                            action_: { type_: 'insert', option: 'commaDecimal' },
                                        },
                                    },
                                    else2: { '*': { action_: 'copy' } },
                                }),
                                actions: {},
                            },
                            o: {
                                transitions: n({
                                    empty: { '*': { action_: [] } },
                                    '1/2$': { 0: { action_: '1/2' } },
                                    else: { 0: { action_: [], nextState: '1', revisit: !0 } },
                                    letters: { '*': { action_: 'rm' } },
                                    '\\ca': {
                                        '*': { action_: { type_: 'insert', option: 'circa' } },
                                    },
                                    '\\pu{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'write', option: '{' },
                                                'pu',
                                                { type_: 'write', option: '}' },
                                            ],
                                        },
                                    },
                                    '\\x{}{}|\\x{}|\\x': { '*': { action_: 'copy' } },
                                    '${(...)}$__$(...)$': { '*': { action_: 'tex-math' } },
                                    '{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'write', option: '{' },
                                                'text',
                                                { type_: 'write', option: '}' },
                                            ],
                                        },
                                    },
                                    else2: { '*': { action_: 'copy' } },
                                }),
                                actions: {},
                            },
                            text: {
                                transitions: n({
                                    empty: { '*': { action_: 'output' } },
                                    '{...}': { '*': { action_: 'text=' } },
                                    '${(...)}$__$(...)$': { '*': { action_: 'tex-math' } },
                                    '\\greek': { '*': { action_: ['output', 'rm'] } },
                                    '\\pu{(...)}': {
                                        '*': {
                                            action_: [
                                                'output',
                                                { type_: 'write', option: '{' },
                                                'pu',
                                                { type_: 'write', option: '}' },
                                            ],
                                        },
                                    },
                                    '\\,|\\x{}{}|\\x{}|\\x': {
                                        '*': { action_: ['output', 'copy'] },
                                    },
                                    else: { '*': { action_: 'text=' } },
                                }),
                                actions: {
                                    output: function (t) {
                                        if (t.text_) {
                                            var e = { type_: 'text', p1: t.text_ };
                                            for (var r in t) delete t[r];
                                            return e;
                                        }
                                    },
                                },
                            },
                            pq: {
                                transitions: n({
                                    empty: { '*': { action_: [] } },
                                    'state of aggregation $': {
                                        '*': { action_: 'state of aggregation' },
                                    },
                                    i$: { 0: { action_: [], nextState: '!f', revisit: !0 } },
                                    '(KV letters),': { 0: { action_: 'rm', nextState: '0' } },
                                    formula$: { 0: { action_: [], nextState: 'f', revisit: !0 } },
                                    '1/2$': { 0: { action_: '1/2' } },
                                    else: { 0: { action_: [], nextState: '!f', revisit: !0 } },
                                    '${(...)}$__$(...)$': { '*': { action_: 'tex-math' } },
                                    '{(...)}': { '*': { action_: 'text' } },
                                    'a-z': { f: { action_: 'tex-math' } },
                                    letters: { '*': { action_: 'rm' } },
                                    '-9.,9': { '*': { action_: '9,9' } },
                                    ',': {
                                        '*': {
                                            action_: {
                                                type_: 'insert+p1',
                                                option: 'comma enumeration S',
                                            },
                                        },
                                    },
                                    '\\color{(...)}{(...)}': { '*': { action_: 'color-output' } },
                                    '\\color{(...)}': { '*': { action_: 'color0-output' } },
                                    '\\ce{(...)}': { '*': { action_: 'ce' } },
                                    '\\pu{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'write', option: '{' },
                                                'pu',
                                                { type_: 'write', option: '}' },
                                            ],
                                        },
                                    },
                                    '\\,|\\x{}{}|\\x{}|\\x': { '*': { action_: 'copy' } },
                                    else2: { '*': { action_: 'copy' } },
                                }),
                                actions: {
                                    'state of aggregation': function (t, e) {
                                        return {
                                            type_: 'state of aggregation subscript',
                                            p1: a.go(e, 'o'),
                                        };
                                    },
                                    'color-output': function (t, e) {
                                        return {
                                            type_: 'color',
                                            color1: e[0],
                                            color2: a.go(e[1], 'pq'),
                                        };
                                    },
                                },
                            },
                            bd: {
                                transitions: n({
                                    empty: { '*': { action_: [] } },
                                    x$: { 0: { action_: [], nextState: '!f', revisit: !0 } },
                                    formula$: { 0: { action_: [], nextState: 'f', revisit: !0 } },
                                    else: { 0: { action_: [], nextState: '!f', revisit: !0 } },
                                    '-9.,9 no missing 0': { '*': { action_: '9,9' } },
                                    '.': {
                                        '*': {
                                            action_: { type_: 'insert', option: 'electron dot' },
                                        },
                                    },
                                    'a-z': { f: { action_: 'tex-math' } },
                                    x: { '*': { action_: { type_: 'insert', option: 'KV x' } } },
                                    letters: { '*': { action_: 'rm' } },
                                    "'": { '*': { action_: { type_: 'insert', option: 'prime' } } },
                                    '${(...)}$__$(...)$': { '*': { action_: 'tex-math' } },
                                    '{(...)}': { '*': { action_: 'text' } },
                                    '\\color{(...)}{(...)}': { '*': { action_: 'color-output' } },
                                    '\\color{(...)}': { '*': { action_: 'color0-output' } },
                                    '\\ce{(...)}': { '*': { action_: 'ce' } },
                                    '\\pu{(...)}': {
                                        '*': {
                                            action_: [
                                                { type_: 'write', option: '{' },
                                                'pu',
                                                { type_: 'write', option: '}' },
                                            ],
                                        },
                                    },
                                    '\\,|\\x{}{}|\\x{}|\\x': { '*': { action_: 'copy' } },
                                    else2: { '*': { action_: 'copy' } },
                                }),
                                actions: {
                                    'color-output': function (t, e) {
                                        return {
                                            type_: 'color',
                                            color1: e[0],
                                            color2: a.go(e[1], 'bd'),
                                        };
                                    },
                                },
                            },
                            oxidation: {
                                transitions: n({
                                    empty: { '*': { action_: [] } },
                                    'roman numeral': { '*': { action_: 'roman-numeral' } },
                                    '${(...)}$__$(...)$': { '*': { action_: 'tex-math' } },
                                    else: { '*': { action_: 'copy' } },
                                }),
                                actions: {
                                    'roman-numeral': function (t, e) {
                                        return { type_: 'roman numeral', p1: e };
                                    },
                                },
                            },
                            'tex-math': {
                                transitions: n({
                                    empty: { '*': { action_: 'output' } },
                                    '\\ce{(...)}': { '*': { action_: ['output', 'ce'] } },
                                    '\\pu{(...)}': {
                                        '*': {
                                            action_: [
                                                'output',
                                                { type_: 'write', option: '{' },
                                                'pu',
                                                { type_: 'write', option: '}' },
                                            ],
                                        },
                                    },
                                    '{...}|\\,|\\x{}{}|\\x{}|\\x': { '*': { action_: 'o=' } },
                                    else: { '*': { action_: 'o=' } },
                                }),
                                actions: {
                                    output: function (t) {
                                        if (t.o) {
                                            var e = { type_: 'tex-math', p1: t.o };
                                            for (var r in t) delete t[r];
                                            return e;
                                        }
                                    },
                                },
                            },
                            'tex-math tight': {
                                transitions: n({
                                    empty: { '*': { action_: 'output' } },
                                    '\\ce{(...)}': { '*': { action_: ['output', 'ce'] } },
                                    '\\pu{(...)}': {
                                        '*': {
                                            action_: [
                                                'output',
                                                { type_: 'write', option: '{' },
                                                'pu',
                                                { type_: 'write', option: '}' },
                                            ],
                                        },
                                    },
                                    '{...}|\\,|\\x{}{}|\\x{}|\\x': { '*': { action_: 'o=' } },
                                    '-|+': { '*': { action_: 'tight operator' } },
                                    else: { '*': { action_: 'o=' } },
                                }),
                                actions: {
                                    'tight operator': function (t, e) {
                                        t.o = (t.o || '') + '{' + e + '}';
                                    },
                                    output: function (t) {
                                        if (t.o) {
                                            var e = { type_: 'tex-math', p1: t.o };
                                            for (var r in t) delete t[r];
                                            return e;
                                        }
                                    },
                                },
                            },
                            '9,9': {
                                transitions: n({
                                    empty: { '*': { action_: [] } },
                                    ',': { '*': { action_: 'comma' } },
                                    else: { '*': { action_: 'copy' } },
                                }),
                                actions: {
                                    comma: function () {
                                        return { type_: 'commaDecimal' };
                                    },
                                },
                            },
                            pu: {
                                transitions: n({
                                    empty: { '*': { action_: 'output' } },
                                    space$: { '*': { action_: ['output', 'space'] } },
                                    '{[(|)]}': { '0|a': { action_: 'copy' } },
                                    '(-)(9)^(-9)': { 0: { action_: 'number^', nextState: 'a' } },
                                    '(-)(9.,9)(e)(99)': {
                                        0: { action_: 'enumber', nextState: 'a' },
                                    },
                                    space: { '0|a': { action_: [] } },
                                    'pm-operator': {
                                        '0|a': {
                                            action_: { type_: 'operator', option: '\\pm' },
                                            nextState: '0',
                                        },
                                    },
                                    operator: { '0|a': { action_: 'copy', nextState: '0' } },
                                    '//': { d: { action_: 'o=', nextState: '/' } },
                                    '/': { d: { action_: 'o=', nextState: '/' } },
                                    '{...}|else': {
                                        '0|d': { action_: 'd=', nextState: 'd' },
                                        a: { action_: ['space', 'd='], nextState: 'd' },
                                        '/|q': { action_: 'q=', nextState: 'q' },
                                    },
                                }),
                                actions: {
                                    enumber: function (t, e) {
                                        var r = [];
                                        return (
                                            '+-' === e[0] || '+/-' === e[0]
                                                ? r.push('\\pm ')
                                                : e[0] && r.push(e[0]),
                                            e[1] &&
                                                (a.concatArray(r, a.go(e[1], 'pu-9,9')),
                                                e[2] &&
                                                    (e[2].match(/[,.]/)
                                                        ? a.concatArray(r, a.go(e[2], 'pu-9,9'))
                                                        : r.push(e[2])),
                                                (e[3] || e[4]) &&
                                                    ('e' === e[3] || '*' === e[4]
                                                        ? r.push({ type_: 'cdot' })
                                                        : r.push({ type_: 'times' }))),
                                            e[5] && r.push('10^{' + e[5] + '}'),
                                            r
                                        );
                                    },
                                    'number^': function (t, e) {
                                        var r = [];
                                        return (
                                            '+-' === e[0] || '+/-' === e[0]
                                                ? r.push('\\pm ')
                                                : e[0] && r.push(e[0]),
                                            a.concatArray(r, a.go(e[1], 'pu-9,9')),
                                            r.push('^{' + e[2] + '}'),
                                            r
                                        );
                                    },
                                    operator: function (t, e, r) {
                                        return { type_: 'operator', kind_: r || e };
                                    },
                                    space: function () {
                                        return { type_: 'pu-space-1' };
                                    },
                                    output: function (t) {
                                        var e,
                                            r = a.patterns.match_('{(...)}', t.d || '');
                                        r && '' === r.remainder && (t.d = r.match_);
                                        var n = a.patterns.match_('{(...)}', t.q || '');
                                        if (
                                            (n && '' === n.remainder && (t.q = n.match_),
                                            t.d &&
                                                ((t.d = t.d.replace(
                                                    /\u00B0C|\^oC|\^{o}C/g,
                                                    '{}^{\\circ}C',
                                                )),
                                                (t.d = t.d.replace(
                                                    /\u00B0F|\^oF|\^{o}F/g,
                                                    '{}^{\\circ}F',
                                                ))),
                                            t.q)
                                        ) {
                                            (t.q = t.q.replace(
                                                /\u00B0C|\^oC|\^{o}C/g,
                                                '{}^{\\circ}C',
                                            )),
                                                (t.q = t.q.replace(
                                                    /\u00B0F|\^oF|\^{o}F/g,
                                                    '{}^{\\circ}F',
                                                ));
                                            var o = { d: a.go(t.d, 'pu'), q: a.go(t.q, 'pu') };
                                            '//' === t.o
                                                ? (e = { type_: 'pu-frac', p1: o.d, p2: o.q })
                                                : ((e = o.d),
                                                  o.d.length > 1 || o.q.length > 1
                                                      ? e.push({ type_: ' / ' })
                                                      : e.push({ type_: '/' }),
                                                  a.concatArray(e, o.q));
                                        } else e = a.go(t.d, 'pu-2');
                                        for (var i in t) delete t[i];
                                        return e;
                                    },
                                },
                            },
                            'pu-2': {
                                transitions: n({
                                    empty: { '*': { action_: 'output' } },
                                    '*': { '*': { action_: ['output', 'cdot'], nextState: '0' } },
                                    '\\x': { '*': { action_: 'rm=' } },
                                    space: {
                                        '*': { action_: ['output', 'space'], nextState: '0' },
                                    },
                                    '^{(...)}|^(-1)': { 1: { action_: '^(-1)' } },
                                    '-9.,9': {
                                        0: { action_: 'rm=', nextState: '0' },
                                        1: { action_: '^(-1)', nextState: '0' },
                                    },
                                    '{...}|else': { '*': { action_: 'rm=', nextState: '1' } },
                                }),
                                actions: {
                                    cdot: function () {
                                        return { type_: 'tight cdot' };
                                    },
                                    '^(-1)': function (t, e) {
                                        t.rm += '^{' + e + '}';
                                    },
                                    space: function () {
                                        return { type_: 'pu-space-2' };
                                    },
                                    output: function (t) {
                                        var e = [];
                                        if (t.rm) {
                                            var r = a.patterns.match_('{(...)}', t.rm || '');
                                            e =
                                                r && '' === r.remainder
                                                    ? a.go(r.match_, 'pu')
                                                    : { type_: 'rm', p1: t.rm };
                                        }
                                        for (var n in t) delete t[n];
                                        return e;
                                    },
                                },
                            },
                            'pu-9,9': {
                                transitions: n({
                                    empty: {
                                        0: { action_: 'output-0' },
                                        o: { action_: 'output-o' },
                                    },
                                    ',': { 0: { action_: ['output-0', 'comma'], nextState: 'o' } },
                                    '.': { 0: { action_: ['output-0', 'copy'], nextState: 'o' } },
                                    else: { '*': { action_: 'text=' } },
                                }),
                                actions: {
                                    comma: function () {
                                        return { type_: 'commaDecimal' };
                                    },
                                    'output-0': function (t) {
                                        var e = [];
                                        if (((t.text_ = t.text_ || ''), t.text_.length > 4)) {
                                            var r = t.text_.length % 3;
                                            0 === r && (r = 3);
                                            for (var n = t.text_.length - 3; n > 0; n -= 3)
                                                e.push(t.text_.substr(n, 3)),
                                                    e.push({ type_: '1000 separator' });
                                            e.push(t.text_.substr(0, r)), e.reverse();
                                        } else e.push(t.text_);
                                        for (var a in t) delete t[a];
                                        return e;
                                    },
                                    'output-o': function (t) {
                                        var e = [];
                                        if (((t.text_ = t.text_ || ''), t.text_.length > 4)) {
                                            var r = t.text_.length - 3,
                                                n = void 0;
                                            for (n = 0; n < r; n += 3)
                                                e.push(t.text_.substr(n, 3)),
                                                    e.push({ type_: '1000 separator' });
                                            e.push(t.text_.substr(n));
                                        } else e.push(t.text_);
                                        for (var a in t) delete t[a];
                                        return e;
                                    },
                                },
                            },
                        },
                    },
                    o = {
                        go: function (t, e) {
                            if (!t) return '';
                            for (var r = '', n = !1, a = 0; a < t.length; a++) {
                                var i = t[a];
                                'string' == typeof i
                                    ? (r += i)
                                    : ((r += o._go2(i)),
                                      '1st-level escape' === i.type_ && (n = !0));
                            }
                            return e && !n && r && (r = '{' + r + '}'), r;
                        },
                        _goInner: function (t) {
                            return o.go(t, !1);
                        },
                        _go2: function (t) {
                            var e;
                            switch (t.type_) {
                                case 'chemfive':
                                    e = '';
                                    var r = {
                                        a: o._goInner(t.a),
                                        b: o._goInner(t.b),
                                        p: o._goInner(t.p),
                                        o: o._goInner(t.o),
                                        q: o._goInner(t.q),
                                        d: o._goInner(t.d),
                                    };
                                    r.a &&
                                        (r.a.match(/^[+\-]/) && (r.a = '{' + r.a + '}'),
                                        (e += r.a + '\\,')),
                                        (r.b || r.p) &&
                                            ((e += '{\\vphantom{A}}'),
                                            (e +=
                                                '^{\\hphantom{' +
                                                (r.b || '') +
                                                '}}_{\\hphantom{' +
                                                (r.p || '') +
                                                '}}'),
                                            (e += '\\mkern-1.5mu'),
                                            (e += '{\\vphantom{A}}'),
                                            (e +=
                                                '^{\\smash[t]{\\vphantom{2}}\\llap{' +
                                                (r.b || '') +
                                                '}}'),
                                            (e +=
                                                '_{\\vphantom{2}\\llap{\\smash[t]{' +
                                                (r.p || '') +
                                                '}}}')),
                                        r.o &&
                                            (r.o.match(/^[+\-]/) && (r.o = '{' + r.o + '}'),
                                            (e += r.o)),
                                        'kv' === t.dType
                                            ? ((r.d || r.q) && (e += '{\\vphantom{A}}'),
                                              r.d && (e += '^{' + r.d + '}'),
                                              r.q && (e += '_{\\smash[t]{' + r.q + '}}'))
                                            : 'oxidation' === t.dType
                                              ? (r.d &&
                                                    ((e += '{\\vphantom{A}}'),
                                                    (e += '^{' + r.d + '}')),
                                                r.q &&
                                                    ((e += '{\\vphantom{A}}'),
                                                    (e += '_{\\smash[t]{' + r.q + '}}')))
                                              : (r.q &&
                                                    ((e += '{\\vphantom{A}}'),
                                                    (e += '_{\\smash[t]{' + r.q + '}}')),
                                                r.d &&
                                                    ((e += '{\\vphantom{A}}'),
                                                    (e += '^{' + r.d + '}')));
                                    break;
                                case 'rm':
                                case 'roman numeral':
                                    e = '\\mathrm{' + t.p1 + '}';
                                    break;
                                case 'text':
                                    t.p1.match(/[\^_]/)
                                        ? ((t.p1 = t.p1
                                              .replace(' ', '~')
                                              .replace('-', '\\text{-}')),
                                          (e = '\\mathrm{' + t.p1 + '}'))
                                        : (e = '\\text{' + t.p1 + '}');
                                    break;
                                case 'state of aggregation':
                                    e = '\\mskip2mu ' + o._goInner(t.p1);
                                    break;
                                case 'state of aggregation subscript':
                                    e = '\\mskip1mu ' + o._goInner(t.p1);
                                    break;
                                case 'bond':
                                    if (!(e = o._getBond(t.kind_)))
                                        throw [
                                            'MhchemErrorBond',
                                            'mhchem Error. Unknown bond type (' + t.kind_ + ')',
                                        ];
                                    break;
                                case 'frac':
                                    var n = '\\frac{' + t.p1 + '}{' + t.p2 + '}';
                                    e =
                                        '\\mathchoice{\\textstyle' +
                                        n +
                                        '}{' +
                                        n +
                                        '}{' +
                                        n +
                                        '}{' +
                                        n +
                                        '}';
                                    break;
                                case 'pu-frac':
                                    var a =
                                        '\\frac{' +
                                        o._goInner(t.p1) +
                                        '}{' +
                                        o._goInner(t.p2) +
                                        '}';
                                    e =
                                        '\\mathchoice{\\textstyle' +
                                        a +
                                        '}{' +
                                        a +
                                        '}{' +
                                        a +
                                        '}{' +
                                        a +
                                        '}';
                                    break;
                                case 'tex-math':
                                case '1st-level escape':
                                    e = t.p1 + ' ';
                                    break;
                                case 'frac-ce':
                                    e =
                                        '\\frac{' +
                                        o._goInner(t.p1) +
                                        '}{' +
                                        o._goInner(t.p2) +
                                        '}';
                                    break;
                                case 'overset':
                                    e =
                                        '\\overset{' +
                                        o._goInner(t.p1) +
                                        '}{' +
                                        o._goInner(t.p2) +
                                        '}';
                                    break;
                                case 'underset':
                                    e =
                                        '\\underset{' +
                                        o._goInner(t.p1) +
                                        '}{' +
                                        o._goInner(t.p2) +
                                        '}';
                                    break;
                                case 'underbrace':
                                    e =
                                        '\\underbrace{' +
                                        o._goInner(t.p1) +
                                        '}_{' +
                                        o._goInner(t.p2) +
                                        '}';
                                    break;
                                case 'color':
                                    e = '{\\color{' + t.color1 + '}{' + o._goInner(t.color2) + '}}';
                                    break;
                                case 'color0':
                                    e = '\\color{' + t.color + '}';
                                    break;
                                case 'arrow':
                                    var i = { rd: o._goInner(t.rd), rq: o._goInner(t.rq) },
                                        s = o._getArrow(t.r);
                                    i.rd || i.rq
                                        ? '<=>' === t.r ||
                                          '<=>>' === t.r ||
                                          '<<=>' === t.r ||
                                          '<--\x3e' === t.r
                                            ? ((s = '\\long' + s),
                                              i.rd && (s = '\\overset{' + i.rd + '}{' + s + '}'),
                                              i.rq &&
                                                  (s =
                                                      '<--\x3e' === t.r
                                                          ? '\\underset{\\lower2mu{' +
                                                            i.rq +
                                                            '}}{' +
                                                            s +
                                                            '}'
                                                          : '\\underset{\\lower6mu{' +
                                                            i.rq +
                                                            '}}{' +
                                                            s +
                                                            '}'),
                                              (s = ' {}\\mathrel{' + s + '}{} '))
                                            : (i.rq && (s += '[{' + i.rq + '}]'),
                                              (s =
                                                  ' {}\\mathrel{\\x' +
                                                  (s += '{' + i.rd + '}') +
                                                  '}{} '))
                                        : (s = ' {}\\mathrel{\\long' + s + '}{} '),
                                        (e = s);
                                    break;
                                case 'operator':
                                    e = o._getOperator(t.kind_);
                                    break;
                                case 'space':
                                    e = ' ';
                                    break;
                                case 'tinySkip':
                                    e = '\\mkern2mu';
                                    break;
                                case 'entitySkip':
                                case 'pu-space-1':
                                    e = '~';
                                    break;
                                case 'pu-space-2':
                                    e = '\\mkern3mu ';
                                    break;
                                case '1000 separator':
                                    e = '\\mkern2mu ';
                                    break;
                                case 'commaDecimal':
                                    e = '{,}';
                                    break;
                                case 'comma enumeration L':
                                    e = '{' + t.p1 + '}\\mkern6mu ';
                                    break;
                                case 'comma enumeration M':
                                    e = '{' + t.p1 + '}\\mkern3mu ';
                                    break;
                                case 'comma enumeration S':
                                    e = '{' + t.p1 + '}\\mkern1mu ';
                                    break;
                                case 'hyphen':
                                    e = '\\text{-}';
                                    break;
                                case 'addition compound':
                                    e = '\\,{\\cdot}\\,';
                                    break;
                                case 'electron dot':
                                    e = '\\mkern1mu \\bullet\\mkern1mu ';
                                    break;
                                case 'KV x':
                                    e = '{\\times}';
                                    break;
                                case 'prime':
                                    e = '\\prime ';
                                    break;
                                case 'cdot':
                                    e = '\\cdot ';
                                    break;
                                case 'tight cdot':
                                    e = '\\mkern1mu{\\cdot}\\mkern1mu ';
                                    break;
                                case 'times':
                                    e = '\\times ';
                                    break;
                                case 'circa':
                                    e = '{\\sim}';
                                    break;
                                case '^':
                                    e = 'uparrow';
                                    break;
                                case 'v':
                                    e = 'downarrow';
                                    break;
                                case 'ellipsis':
                                    e = '\\ldots ';
                                    break;
                                case '/':
                                    e = '/';
                                    break;
                                case ' / ':
                                    e = '\\,/\\,';
                                    break;
                                default:
                                    throw ['MhchemBugT', 'mhchem bug T. Please report.'];
                            }
                            return e;
                        },
                        _getArrow: function (t) {
                            switch (t) {
                                case '->':
                                case '\u2192':
                                case '\u27f6':
                                    return 'rightarrow';
                                case '<-':
                                    return 'leftarrow';
                                case '<->':
                                    return 'leftrightarrow';
                                case '<--\x3e':
                                    return 'leftrightarrows';
                                case '<=>':
                                case '\u21cc':
                                    return 'rightleftharpoons';
                                case '<=>>':
                                    return 'Rightleftharpoons';
                                case '<<=>':
                                    return 'Leftrightharpoons';
                                default:
                                    throw ['MhchemBugT', 'mhchem bug T. Please report.'];
                            }
                        },
                        _getBond: function (t) {
                            switch (t) {
                                case '-':
                                case '1':
                                    return '{-}';
                                case '=':
                                case '2':
                                    return '{=}';
                                case '#':
                                case '3':
                                    return '{\\equiv}';
                                case '~':
                                    return '{\\tripledash}';
                                case '~-':
                                    return '{\\rlap{\\lower.1em{-}}\\raise.1em{\\tripledash}}';
                                case '~=':
                                case '~--':
                                    return '{\\rlap{\\lower.2em{-}}\\rlap{\\raise.2em{\\tripledash}}-}';
                                case '-~-':
                                    return '{\\rlap{\\lower.2em{-}}\\rlap{\\raise.2em{-}}\\tripledash}';
                                case '...':
                                    return '{{\\cdot}{\\cdot}{\\cdot}}';
                                case '....':
                                    return '{{\\cdot}{\\cdot}{\\cdot}{\\cdot}}';
                                case '->':
                                    return '{\\rightarrow}';
                                case '<-':
                                    return '{\\leftarrow}';
                                case '<':
                                    return '{<}';
                                case '>':
                                    return '{>}';
                                default:
                                    throw ['MhchemBugT', 'mhchem bug T. Please report.'];
                            }
                        },
                        _getOperator: function (t) {
                            switch (t) {
                                case '+':
                                    return ' {}+{} ';
                                case '-':
                                    return ' {}-{} ';
                                case '=':
                                    return ' {}={} ';
                                case '<':
                                    return ' {}<{} ';
                                case '>':
                                    return ' {}>{} ';
                                case '<<':
                                    return ' {}\\ll{} ';
                                case '>>':
                                    return ' {}\\gg{} ';
                                case '\\pm':
                                    return ' {}\\pm{} ';
                                case '\\approx':
                                case '$\\approx$':
                                    return ' {}\\approx{} ';
                                case 'v':
                                case '(v)':
                                    return ' \\downarrow{} ';
                                case '^':
                                case '(^)':
                                    return ' \\uparrow{} ';
                                default:
                                    throw ['MhchemBugT', 'mhchem bug T. Please report.'];
                            }
                        },
                    };
            },
        },
        e = {};
    function r(n) {
        var a = e[n];
        if (void 0 !== a) return a.exports;
        var o = (e[n] = { exports: {} });
        return t[n].call(o.exports, o, o.exports, r), o.exports;
    }
    !(function () {
        var t = r(8955),
            e = r(8667),
            n = r(7375),
            a = r(5275),
            o = r(2778);
        MathJax.loader && MathJax.loader.checkVersion('[tex]/all-packages', e.q, 'tex-extension'),
            (0, t.combineWithMathJax)({
                _: {
                    input: {
                        tex: {
                            AllPackages: n,
                            autoload: { AutoloadConfiguration: a },
                            require: { RequireConfiguration: o },
                        },
                    },
                },
            });
        var i,
            s = r(5074);
        function l(t, e) {
            (null == e || e > t.length) && (e = t.length);
            for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
            return n;
        }
        MathJax.loader && MathJax.loader.preLoad('[tex]/autoload', '[tex]/require'),
            (function () {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [],
                    e = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
                if (MathJax.startup) {
                    e &&
                        (MathJax.startup.registerConstructor('tex', MathJax._.input.tex_ts.TeX),
                        MathJax.startup.useInput('tex')),
                        MathJax.config.tex || (MathJax.config.tex = {});
                    var r = MathJax.config.tex.packages;
                    (MathJax.config.tex.packages = t),
                        r && (0, s.insert)(MathJax.config.tex, { packages: r });
                }
            })(
                ['require'].concat(
                    (function (t) {
                        if (Array.isArray(t)) return l(t);
                    })((i = n.AllPackages)) ||
                        (function (t) {
                            if (
                                ('undefined' != typeof Symbol && null != t[Symbol.iterator]) ||
                                null != t['@@iterator']
                            )
                                return Array.from(t);
                        })(i) ||
                        (function (t, e) {
                            if (t) {
                                if ('string' == typeof t) return l(t, e);
                                var r = Object.prototype.toString.call(t).slice(8, -1);
                                return (
                                    'Object' === r && t.constructor && (r = t.constructor.name),
                                    'Map' === r || 'Set' === r
                                        ? Array.from(t)
                                        : 'Arguments' === r ||
                                            /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
                                          ? l(t, e)
                                          : void 0
                                );
                            }
                        })(i) ||
                        (function () {
                            throw new TypeError(
                                'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.',
                            );
                        })(),
                ),
                !1,
            );
    })();
})();
