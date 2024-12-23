!(function () {
    'use strict';
    var t,
        e,
        r,
        a,
        o,
        i = {
            306: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            236: function (t, e, r) {
                var a,
                    o =
                        (this && this.__extends) ||
                        ((a = function (t, e) {
                            return (
                                (a =
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
                                a(t, e)
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
                            a(t, e),
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
                            var a,
                                o,
                                i = r.call(t),
                                n = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(a = i.next()).done; )
                                    n.push(a.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    a && !a.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return n;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MathML = void 0);
                var n = r(309),
                    s = r(77),
                    l = r(898),
                    c = r(794),
                    h = r(332),
                    p = (function (t) {
                        function e(e) {
                            void 0 === e && (e = {});
                            var r = this,
                                a = i(
                                    (0, s.separateOptions)(
                                        e,
                                        c.FindMathML.OPTIONS,
                                        h.MathMLCompile.OPTIONS,
                                    ),
                                    3,
                                ),
                                o = a[0],
                                n = a[1],
                                p = a[2];
                            return (
                                ((r = t.call(this, o) || this).findMathML =
                                    r.options.FindMathML || new c.FindMathML(n)),
                                (r.mathml = r.options.MathMLCompile || new h.MathMLCompile(p)),
                                (r.mmlFilters = new l.FunctionList()),
                                r
                            );
                        }
                        return (
                            o(e, t),
                            (e.prototype.setAdaptor = function (e) {
                                t.prototype.setAdaptor.call(this, e),
                                    (this.findMathML.adaptor = e),
                                    (this.mathml.adaptor = e);
                            }),
                            (e.prototype.setMmlFactory = function (e) {
                                t.prototype.setMmlFactory.call(this, e),
                                    this.mathml.setMmlFactory(e);
                            }),
                            Object.defineProperty(e.prototype, 'processStrings', {
                                get: function () {
                                    return !1;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.compile = function (t, e) {
                                var r = t.start.node;
                                if (
                                    !r ||
                                    !t.end.node ||
                                    this.options.forceReparse ||
                                    '#text' === this.adaptor.kind(r)
                                ) {
                                    var a = this.executeFilters(
                                            this.preFilters,
                                            t,
                                            e,
                                            (t.math || '<math></math>').trim(),
                                        ),
                                        o = this.checkForErrors(
                                            this.adaptor.parse(a, 'text/' + this.options.parseAs),
                                        ),
                                        i = this.adaptor.body(o);
                                    1 !== this.adaptor.childNodes(i).length &&
                                        this.error('MathML must consist of a single element'),
                                        (r = this.adaptor.remove(this.adaptor.firstChild(i))),
                                        'math' !== this.adaptor.kind(r).replace(/^[a-z]+:/, '') &&
                                            this.error(
                                                'MathML must be formed by a <math> element, not <' +
                                                    this.adaptor.kind(r) +
                                                    '>',
                                            );
                                }
                                return (
                                    (r = this.executeFilters(this.mmlFilters, t, e, r)),
                                    this.executeFilters(
                                        this.postFilters,
                                        t,
                                        e,
                                        this.mathml.compile(r),
                                    )
                                );
                            }),
                            (e.prototype.checkForErrors = function (t) {
                                var e = this.adaptor.tags(this.adaptor.body(t), 'parsererror')[0];
                                return (
                                    e &&
                                        ('' === this.adaptor.textContent(e) &&
                                            this.error('Error processing MathML'),
                                        this.options.parseError.call(this, e)),
                                    t
                                );
                            }),
                            (e.prototype.error = function (t) {
                                throw new Error(t);
                            }),
                            (e.prototype.findMath = function (t) {
                                return this.findMathML.findMath(t);
                            }),
                            (e.NAME = 'MathML'),
                            (e.OPTIONS = (0, s.defaultOptions)(
                                {
                                    parseAs: 'html',
                                    forceReparse: !1,
                                    FindMathML: null,
                                    MathMLCompile: null,
                                    parseError: function (t) {
                                        this.error(
                                            this.adaptor.textContent(t).replace(/\n.*/g, ''),
                                        );
                                    },
                                },
                                n.AbstractInputJax.OPTIONS,
                            )),
                            e
                        );
                    })(n.AbstractInputJax);
                e.MathML = p;
            },
            794: function (t, e, r) {
                var a,
                    o =
                        (this && this.__extends) ||
                        ((a = function (t, e) {
                            return (
                                (a =
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
                                a(t, e)
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
                            a(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                a = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && a >= t.length && (t = void 0),
                                            { value: t && t[a++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.FindMathML = void 0);
                var n = r(649),
                    s = 'http://www.w3.org/1998/Math/MathML',
                    l = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            (e.prototype.findMath = function (t) {
                                var e = new Set();
                                this.findMathNodes(t, e), this.findMathPrefixed(t, e);
                                var r = this.adaptor.root(this.adaptor.document);
                                return (
                                    'html' === this.adaptor.kind(r) &&
                                        0 === e.size &&
                                        this.findMathNS(t, e),
                                    this.processMath(e)
                                );
                            }),
                            (e.prototype.findMathNodes = function (t, e) {
                                var r, a;
                                try {
                                    for (
                                        var o = i(this.adaptor.tags(t, 'math')), n = o.next();
                                        !n.done;
                                        n = o.next()
                                    ) {
                                        var s = n.value;
                                        e.add(s);
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        n && !n.done && (a = o.return) && a.call(o);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                            }),
                            (e.prototype.findMathPrefixed = function (t, e) {
                                var r,
                                    a,
                                    o,
                                    n,
                                    l = this.adaptor.root(this.adaptor.document);
                                try {
                                    for (
                                        var c = i(this.adaptor.allAttributes(l)), h = c.next();
                                        !h.done;
                                        h = c.next()
                                    ) {
                                        var p = h.value;
                                        if ('xmlns:' === p.name.substr(0, 6) && p.value === s) {
                                            var u = p.name.substr(6);
                                            try {
                                                for (
                                                    var d =
                                                            ((o = void 0),
                                                            i(this.adaptor.tags(t, u + ':math'))),
                                                        f = d.next();
                                                    !f.done;
                                                    f = d.next()
                                                ) {
                                                    var M = f.value;
                                                    e.add(M);
                                                }
                                            } catch (t) {
                                                o = { error: t };
                                            } finally {
                                                try {
                                                    f && !f.done && (n = d.return) && n.call(d);
                                                } finally {
                                                    if (o) throw o.error;
                                                }
                                            }
                                        }
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        h && !h.done && (a = c.return) && a.call(c);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                            }),
                            (e.prototype.findMathNS = function (t, e) {
                                var r, a;
                                try {
                                    for (
                                        var o = i(this.adaptor.tags(t, 'math', s)), n = o.next();
                                        !n.done;
                                        n = o.next()
                                    ) {
                                        var l = n.value;
                                        e.add(l);
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        n && !n.done && (a = o.return) && a.call(o);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                            }),
                            (e.prototype.processMath = function (t) {
                                var e,
                                    r,
                                    a = [];
                                try {
                                    for (
                                        var o = i(Array.from(t)), n = o.next();
                                        !n.done;
                                        n = o.next()
                                    ) {
                                        var s = n.value,
                                            l =
                                                'block' ===
                                                    this.adaptor.getAttribute(s, 'display') ||
                                                'display' === this.adaptor.getAttribute(s, 'mode'),
                                            c = { node: s, n: 0, delim: '' },
                                            h = { node: s, n: 0, delim: '' };
                                        a.push({
                                            math: this.adaptor.outerHTML(s),
                                            start: c,
                                            end: h,
                                            display: l,
                                        });
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        n && !n.done && (r = o.return) && r.call(o);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                                return a;
                            }),
                            (e.OPTIONS = {}),
                            e
                        );
                    })(n.AbstractFindMath);
                e.FindMathML = l;
            },
            332: function (t, e, r) {
                var a =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (a =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, r = 1, a = arguments.length; r < a; r++)
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                a.apply(this, arguments)
                            );
                        },
                    o =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, r, a) {
                                  void 0 === a && (a = r);
                                  var o = Object.getOwnPropertyDescriptor(e, r);
                                  (o &&
                                      !('get' in o
                                          ? !e.__esModule
                                          : o.writable || o.configurable)) ||
                                      (o = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[r];
                                          },
                                      }),
                                      Object.defineProperty(t, a, o);
                              }
                            : function (t, e, r, a) {
                                  void 0 === a && (a = r), (t[a] = e[r]);
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
                    n =
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
                    s =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                a = 0;
                            if (r) return r.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && a >= t.length && (t = void 0),
                                            { value: t && t[a++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MathMLCompile = void 0);
                var l = r(921),
                    c = r(77),
                    h = n(r(29)),
                    p = (function () {
                        function t(t) {
                            void 0 === t && (t = {});
                            var e = this.constructor;
                            this.options = (0, c.userOptions)(
                                (0, c.defaultOptions)({}, e.OPTIONS),
                                t,
                            );
                        }
                        return (
                            (t.prototype.setMmlFactory = function (t) {
                                this.factory = t;
                            }),
                            (t.prototype.compile = function (t) {
                                var e = this.makeNode(t);
                                return (
                                    e.verifyTree(this.options.verify),
                                    e.setInheritedAttributes({}, !1, 0, !1),
                                    e.walkTree(this.markMrows),
                                    e
                                );
                            }),
                            (t.prototype.makeNode = function (t) {
                                var e,
                                    r,
                                    a = this.adaptor,
                                    o = !1,
                                    i = a.kind(t).replace(/^.*:/, ''),
                                    n = a.getAttribute(t, 'data-mjx-texclass') || '';
                                n && (n = this.filterAttribute('data-mjx-texclass', n) || '');
                                var c = n && 'mrow' === i ? 'TeXAtom' : i;
                                try {
                                    for (
                                        var h = s(this.filterClassList(a.allClasses(t))),
                                            p = h.next();
                                        !p.done;
                                        p = h.next()
                                    ) {
                                        var u = p.value;
                                        u.match(/^MJX-TeXAtom-/) && 'mrow' === i
                                            ? ((n = u.substr(12)), (c = 'TeXAtom'))
                                            : 'MJX-fixedlimits' === u && (o = !0);
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        p && !p.done && (r = h.return) && r.call(h);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                                this.factory.getNodeClass(c) ||
                                    this.error('Unknown node type "' + c + '"');
                                var d = this.factory.create(c);
                                return (
                                    'TeXAtom' !== c ||
                                        'OP' !== n ||
                                        o ||
                                        (d.setProperty('movesupsub', !0),
                                        d.attributes.setInherited('movablelimits', !0)),
                                    n &&
                                        ((d.texClass = l.TEXCLASS[n]),
                                        d.setProperty('texClass', d.texClass)),
                                    this.addAttributes(d, t),
                                    this.checkClass(d, t),
                                    this.addChildren(d, t),
                                    d
                                );
                            }),
                            (t.prototype.addAttributes = function (t, e) {
                                var r,
                                    a,
                                    o = !1;
                                try {
                                    for (
                                        var i = s(this.adaptor.allAttributes(e)), n = i.next();
                                        !n.done;
                                        n = i.next()
                                    ) {
                                        var l = n.value,
                                            c = l.name,
                                            h = this.filterAttribute(c, l.value);
                                        if (null !== h && 'xmlns' !== c)
                                            if ('data-mjx-' === c.substr(0, 9))
                                                switch (c.substr(9)) {
                                                    case 'alternate':
                                                        t.setProperty('variantForm', !0);
                                                        break;
                                                    case 'variant':
                                                        t.attributes.set('mathvariant', h),
                                                            (o = !0);
                                                        break;
                                                    case 'smallmatrix':
                                                        t.setProperty('scriptlevel', 1),
                                                            t.setProperty('useHeight', !1);
                                                        break;
                                                    case 'accent':
                                                        t.setProperty('mathaccent', 'true' === h);
                                                        break;
                                                    case 'auto-op':
                                                        t.setProperty('autoOP', 'true' === h);
                                                        break;
                                                    case 'script-align':
                                                        t.setProperty('scriptalign', h);
                                                }
                                            else if ('class' !== c) {
                                                var p = h.toLowerCase();
                                                'true' === p || 'false' === p
                                                    ? t.attributes.set(c, 'true' === p)
                                                    : (o && 'mathvariant' === c) ||
                                                      t.attributes.set(c, h);
                                            }
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        n && !n.done && (a = i.return) && a.call(i);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                            }),
                            (t.prototype.filterAttribute = function (t, e) {
                                return e;
                            }),
                            (t.prototype.filterClassList = function (t) {
                                return t;
                            }),
                            (t.prototype.addChildren = function (t, e) {
                                var r, a;
                                if (0 !== t.arity) {
                                    var o = this.adaptor;
                                    try {
                                        for (
                                            var i = s(o.childNodes(e)), n = i.next();
                                            !n.done;
                                            n = i.next()
                                        ) {
                                            var l = n.value,
                                                c = o.kind(l);
                                            if ('#comment' !== c)
                                                if ('#text' === c) this.addText(t, l);
                                                else if (t.isKind('annotation-xml'))
                                                    t.appendChild(
                                                        this.factory.create('XML').setXML(l, o),
                                                    );
                                                else {
                                                    var h = t.appendChild(this.makeNode(l));
                                                    0 === h.arity &&
                                                        o.childNodes(l).length &&
                                                        (this.options.fixMisplacedChildren
                                                            ? this.addChildren(t, l)
                                                            : h.mError(
                                                                  'There should not be children for ' +
                                                                      h.kind +
                                                                      ' nodes',
                                                                  this.options.verify,
                                                                  !0,
                                                              ));
                                                }
                                        }
                                    } catch (t) {
                                        r = { error: t };
                                    } finally {
                                        try {
                                            n && !n.done && (a = i.return) && a.call(i);
                                        } finally {
                                            if (r) throw r.error;
                                        }
                                    }
                                }
                            }),
                            (t.prototype.addText = function (t, e) {
                                var r = this.adaptor.value(e);
                                (t.isToken || t.getProperty('isChars')) && t.arity
                                    ? (t.isToken && ((r = h.translate(r)), (r = this.trimSpace(r))),
                                      t.appendChild(this.factory.create('text').setText(r)))
                                    : r.match(/\S/) &&
                                      this.error('Unexpected text node "' + r + '"');
                            }),
                            (t.prototype.checkClass = function (t, e) {
                                var r,
                                    a,
                                    o = [];
                                try {
                                    for (
                                        var i = s(this.filterClassList(this.adaptor.allClasses(e))),
                                            n = i.next();
                                        !n.done;
                                        n = i.next()
                                    ) {
                                        var l = n.value;
                                        'MJX-' === l.substr(0, 4)
                                            ? 'MJX-variant' === l
                                                ? t.setProperty('variantForm', !0)
                                                : 'MJX-TeXAtom' !== l.substr(0, 11) &&
                                                  t.attributes.set(
                                                      'mathvariant',
                                                      this.fixCalligraphic(l.substr(3)),
                                                  )
                                            : o.push(l);
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        n && !n.done && (a = i.return) && a.call(i);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                                o.length && t.attributes.set('class', o.join(' '));
                            }),
                            (t.prototype.fixCalligraphic = function (t) {
                                return t.replace(/caligraphic/, 'calligraphic');
                            }),
                            (t.prototype.markMrows = function (t) {
                                if (t.isKind('mrow') && !t.isInferred && t.childNodes.length >= 2) {
                                    var e = t.childNodes[0],
                                        r = t.childNodes[t.childNodes.length - 1];
                                    e.isKind('mo') &&
                                        e.attributes.get('fence') &&
                                        e.attributes.get('stretchy') &&
                                        r.isKind('mo') &&
                                        r.attributes.get('fence') &&
                                        r.attributes.get('stretchy') &&
                                        (e.childNodes.length && t.setProperty('open', e.getText()),
                                        r.childNodes.length && t.setProperty('close', r.getText()));
                                }
                            }),
                            (t.prototype.trimSpace = function (t) {
                                return t
                                    .replace(/[\t\n\r]/g, ' ')
                                    .replace(/^ +/, '')
                                    .replace(/ +$/, '')
                                    .replace(/  +/g, ' ');
                            }),
                            (t.prototype.error = function (t) {
                                throw new Error(t);
                            }),
                            (t.OPTIONS = {
                                MmlFactory: null,
                                fixMisplacedChildren: !0,
                                verify: a({}, l.AbstractMmlNode.verifyDefaults),
                                translateEntities: !0,
                            }),
                            t
                        );
                    })();
                e.MathMLCompile = p;
            },
            723: function (t, e) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (e.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            649: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractFindMath = MathJax._.core.FindMath.AbstractFindMath);
            },
            309: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractInputJax = MathJax._.core.InputJax.AbstractInputJax);
            },
            921: function (t, e) {
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
            29: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.options = MathJax._.util.Entities.options),
                    (e.entities = MathJax._.util.Entities.entities),
                    (e.add = MathJax._.util.Entities.add),
                    (e.remove = MathJax._.util.Entities.remove),
                    (e.translate = MathJax._.util.Entities.translate),
                    (e.numeric = MathJax._.util.Entities.numeric);
            },
            898: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.FunctionList = MathJax._.util.FunctionList.FunctionList);
            },
            77: function (t, e) {
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
        },
        n = {};
    function s(t) {
        var e = n[t];
        if (void 0 !== e) return e.exports;
        var r = (n[t] = { exports: {} });
        return i[t].call(r.exports, r, r.exports, s), r.exports;
    }
    (t = s(723)),
        (e = s(306)),
        (r = s(236)),
        (a = s(794)),
        (o = s(332)),
        MathJax.loader && MathJax.loader.checkVersion('input/mml', e.q, 'input'),
        (0, t.r8)({ _: { input: { mathml_ts: r, mathml: { FindMathML: a, MathMLCompile: o } } } }),
        MathJax.startup &&
            (MathJax.startup.registerConstructor('mml', r.MathML), MathJax.startup.useInput('mml')),
        MathJax.loader &&
            MathJax.loader.pathFilters.add(function (t) {
                return (
                    (t.name = t.name.replace(
                        /\/util\/entities\/.*?\.js/,
                        '/input/mml/entities.js',
                    )),
                    !0
                );
            });
})();
