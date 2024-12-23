!(function () {
    'use strict';
    var t,
        e,
        o,
        i,
        r,
        n,
        l = {
            589: function (t, e, o) {
                var i,
                    r =
                        (this && this.__extends) ||
                        ((i = function (t, e) {
                            return (
                                (i =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var o in e)
                                            Object.prototype.hasOwnProperty.call(e, o) &&
                                                (t[o] = e[o]);
                                    }),
                                i(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            i(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        }),
                    n =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (n =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, o = 1, i = arguments.length; o < i; o++)
                                            for (var r in (e = arguments[o]))
                                                Object.prototype.hasOwnProperty.call(e, r) &&
                                                    (t[r] = e[r]);
                                        return t;
                                    }),
                                n.apply(this, arguments)
                            );
                        },
                    l =
                        (this && this.__read) ||
                        function (t, e) {
                            var o = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!o) return t;
                            var i,
                                r,
                                n = o.call(t),
                                l = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(i = n.next()).done; )
                                    l.push(i.value);
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    i && !i.done && (o = n.return) && o.call(n);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                            return l;
                        },
                    s =
                        (this && this.__spreadArray) ||
                        function (t, e, o) {
                            if (o || 2 === arguments.length)
                                for (var i, r = 0, n = e.length; r < n; r++)
                                    (!i && r in e) ||
                                        (i || (i = Array.prototype.slice.call(e, 0, r)),
                                        (i[r] = e[r]));
                            return t.concat(i || Array.prototype.slice.call(e));
                        },
                    a =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                o = e && t[e],
                                i = 0;
                            if (o) return o.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && i >= t.length && (t = void 0),
                                            { value: t && t[i++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.ComplexityHandler =
                        e.ComplexityMathDocumentMixin =
                        e.ComplexityMathItemMixin =
                            void 0);
                var p = o(769),
                    c = o(511),
                    u = o(175),
                    h = o(77);
                function y(t, e) {
                    return (function (t) {
                        function o() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            r(o, t),
                            (o.prototype.complexity = function (t, o) {
                                void 0 === o && (o = !1),
                                    this.state() >= p.STATE.COMPLEXITY ||
                                        (this.isEscaped ||
                                            (!t.options.enableComplexity && !o) ||
                                            (this.enrich(t, !0), e(this.root)),
                                        this.state(p.STATE.COMPLEXITY));
                            }),
                            o
                        );
                    })(t);
                }
                function d(t) {
                    var e;
                    return (
                        (e = (function (t) {
                            function e() {
                                for (var e = [], o = 0; o < arguments.length; o++)
                                    e[o] = arguments[o];
                                var i = t.apply(this, s([], l(e), !1)) || this,
                                    r = i.constructor.ProcessBits;
                                r.has('complexity') || r.allocate('complexity');
                                var n = (0, h.selectOptionsFromKeys)(
                                    i.options,
                                    i.options.ComplexityVisitor.OPTIONS,
                                );
                                i.complexityVisitor = new i.options.ComplexityVisitor(
                                    i.mmlFactory,
                                    n,
                                );
                                var a = function (t) {
                                    return i.complexityVisitor.visitTree(t);
                                };
                                return (i.options.MathItem = y(i.options.MathItem, a)), i;
                            }
                            return (
                                r(e, t),
                                (e.prototype.complexity = function () {
                                    var t, e;
                                    if (!this.processed.isSet('complexity')) {
                                        if (this.options.enableComplexity)
                                            try {
                                                for (
                                                    var o = a(this.math), i = o.next();
                                                    !i.done;
                                                    i = o.next()
                                                ) {
                                                    i.value.complexity(this);
                                                }
                                            } catch (e) {
                                                t = { error: e };
                                            } finally {
                                                try {
                                                    i && !i.done && (e = o.return) && e.call(o);
                                                } finally {
                                                    if (t) throw t.error;
                                                }
                                            }
                                        this.processed.set('complexity');
                                    }
                                    return this;
                                }),
                                (e.prototype.state = function (e, o) {
                                    return (
                                        void 0 === o && (o = !1),
                                        t.prototype.state.call(this, e, o),
                                        e < p.STATE.COMPLEXITY &&
                                            this.processed.clear('complexity'),
                                        this
                                    );
                                }),
                                e
                            );
                        })(t)),
                        (e.OPTIONS = n(n(n({}, t.OPTIONS), u.ComplexityVisitor.OPTIONS), {
                            enableComplexity: !0,
                            ComplexityVisitor: u.ComplexityVisitor,
                            renderActions: (0, h.expandable)(
                                n(n({}, t.OPTIONS.renderActions), {
                                    complexity: [p.STATE.COMPLEXITY],
                                }),
                            ),
                        })),
                        e
                    );
                }
                (0, p.newState)('COMPLEXITY', 40),
                    (e.ComplexityMathItemMixin = y),
                    (e.ComplexityMathDocumentMixin = d),
                    (e.ComplexityHandler = function (t, e) {
                        return (
                            void 0 === e && (e = null),
                            !t.documentClass.prototype.enrich &&
                                e &&
                                (t = (0, c.EnrichHandler)(t, e)),
                            (t.documentClass = d(t.documentClass)),
                            t
                        );
                    });
            },
            850: function (t, e) {
                var o =
                    (this && this.__values) ||
                    function (t) {
                        var e = 'function' == typeof Symbol && Symbol.iterator,
                            o = e && t[e],
                            i = 0;
                        if (o) return o.call(t);
                        if (t && 'number' == typeof t.length)
                            return {
                                next: function () {
                                    return (
                                        t && i >= t.length && (t = void 0),
                                        { value: t && t[i++], done: !t }
                                    );
                                },
                            };
                        throw new TypeError(
                            e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                        );
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.Collapse = void 0);
                var i = (function () {
                    function t(e) {
                        var o = this;
                        (this.cutoff = {
                            identifier: 3,
                            number: 3,
                            text: 10,
                            infixop: 15,
                            relseq: 15,
                            multirel: 15,
                            fenced: 18,
                            bigop: 20,
                            integral: 20,
                            fraction: 12,
                            sqrt: 9,
                            root: 12,
                            vector: 15,
                            matrix: 15,
                            cases: 15,
                            superscript: 9,
                            subscript: 9,
                            subsup: 9,
                            punctuated: {
                                endpunct: t.NOCOLLAPSE,
                                startpunct: t.NOCOLLAPSE,
                                value: 12,
                            },
                        }),
                            (this.marker = {
                                identifier: 'x',
                                number: '#',
                                text: '...',
                                appl: { 'limit function': 'lim', value: 'f()' },
                                fraction: '/',
                                sqrt: '\u221a',
                                root: '\u221a',
                                superscript: '\u25fd\u02d9',
                                subscript: '\u25fd.',
                                subsup: '\u25fd:',
                                vector: {
                                    binomial: '(:)',
                                    determinant: '|:|',
                                    value: '\u27e8:\u27e9',
                                },
                                matrix: {
                                    squarematrix: '[::]',
                                    rowvector: '\u27e8\u22ef\u27e9',
                                    columnvector: '\u27e8\u22ee\u27e9',
                                    determinant: '|::|',
                                    value: '(::)',
                                },
                                cases: '{:',
                                infixop: {
                                    addition: '+',
                                    subtraction: '\u2212',
                                    multiplication: '\u22c5',
                                    implicit: '\u22c5',
                                    value: '+',
                                },
                                punctuated: { text: '...', value: ',' },
                            }),
                            (this.collapse = new Map([
                                [
                                    'fenced',
                                    function (t, e) {
                                        return (
                                            (e = o.uncollapseChild(e, t, 1)) > o.cutoff.fenced &&
                                                'leftright' ===
                                                    t.attributes.get('data-semantic-role') &&
                                                (e = o.recordCollapse(
                                                    t,
                                                    e,
                                                    o.getText(t.childNodes[0]) +
                                                        o.getText(
                                                            t.childNodes[t.childNodes.length - 1],
                                                        ),
                                                )),
                                            e
                                        );
                                    },
                                ],
                                [
                                    'appl',
                                    function (t, e) {
                                        if (o.canUncollapse(t, 2, 2)) {
                                            e = o.complexity.visitNode(t, !1);
                                            var i = o.marker.appl,
                                                r =
                                                    i[t.attributes.get('data-semantic-role')] ||
                                                    i.value;
                                            e = o.recordCollapse(t, e, r);
                                        }
                                        return e;
                                    },
                                ],
                                [
                                    'sqrt',
                                    function (t, e) {
                                        return (
                                            (e = o.uncollapseChild(e, t, 0)) > o.cutoff.sqrt &&
                                                (e = o.recordCollapse(t, e, o.marker.sqrt)),
                                            e
                                        );
                                    },
                                ],
                                [
                                    'root',
                                    function (t, e) {
                                        return (
                                            (e = o.uncollapseChild(e, t, 0, 2)) > o.cutoff.sqrt &&
                                                (e = o.recordCollapse(t, e, o.marker.sqrt)),
                                            e
                                        );
                                    },
                                ],
                                [
                                    'enclose',
                                    function (t, e) {
                                        if (1 === o.splitAttribute(t, 'children').length) {
                                            var i = o.canUncollapse(t, 1);
                                            if (i) {
                                                var r = i.getProperty('collapse-marker');
                                                o.unrecordCollapse(i),
                                                    (e = o.recordCollapse(
                                                        t,
                                                        o.complexity.visitNode(t, !1),
                                                        r,
                                                    ));
                                            }
                                        }
                                        return e;
                                    },
                                ],
                                [
                                    'bigop',
                                    function (t, e) {
                                        if (e > o.cutoff.bigop || !t.isKind('mo')) {
                                            var i = o.splitAttribute(t, 'content').pop(),
                                                r = o.findChildText(t, i);
                                            e = o.recordCollapse(t, e, r);
                                        }
                                        return e;
                                    },
                                ],
                                [
                                    'integral',
                                    function (t, e) {
                                        if (e > o.cutoff.integral || !t.isKind('mo')) {
                                            var i = o.splitAttribute(t, 'content').pop(),
                                                r = o.findChildText(t, i);
                                            e = o.recordCollapse(t, e, r);
                                        }
                                        return e;
                                    },
                                ],
                                [
                                    'relseq',
                                    function (t, e) {
                                        if (e > o.cutoff.relseq) {
                                            var i = o.splitAttribute(t, 'content')[0],
                                                r = o.findChildText(t, i);
                                            e = o.recordCollapse(t, e, r);
                                        }
                                        return e;
                                    },
                                ],
                                [
                                    'multirel',
                                    function (t, e) {
                                        if (e > o.cutoff.relseq) {
                                            var i = o.splitAttribute(t, 'content')[0],
                                                r = o.findChildText(t, i) + '\u22ef';
                                            e = o.recordCollapse(t, e, r);
                                        }
                                        return e;
                                    },
                                ],
                                [
                                    'superscript',
                                    function (t, e) {
                                        return (
                                            (e = o.uncollapseChild(e, t, 0, 2)) >
                                                o.cutoff.superscript &&
                                                (e = o.recordCollapse(t, e, o.marker.superscript)),
                                            e
                                        );
                                    },
                                ],
                                [
                                    'subscript',
                                    function (t, e) {
                                        return (
                                            (e = o.uncollapseChild(e, t, 0, 2)) >
                                                o.cutoff.subscript &&
                                                (e = o.recordCollapse(t, e, o.marker.subscript)),
                                            e
                                        );
                                    },
                                ],
                                [
                                    'subsup',
                                    function (t, e) {
                                        return (
                                            (e = o.uncollapseChild(e, t, 0, 3)) > o.cutoff.subsup &&
                                                (e = o.recordCollapse(t, e, o.marker.subsup)),
                                            e
                                        );
                                    },
                                ],
                            ])),
                            (this.idCount = 0),
                            (this.complexity = e);
                    }
                    return (
                        (t.prototype.check = function (t, e) {
                            var o = t.attributes.get('data-semantic-type');
                            return this.collapse.has(o)
                                ? this.collapse.get(o).call(this, t, e)
                                : this.cutoff.hasOwnProperty(o)
                                  ? this.defaultCheck(t, e, o)
                                  : e;
                        }),
                        (t.prototype.defaultCheck = function (t, e, o) {
                            var i = t.attributes.get('data-semantic-role'),
                                r = this.cutoff[o];
                            if (e > ('number' == typeof r ? r : r[i] || r.value)) {
                                var n = this.marker[o] || '??',
                                    l = 'string' == typeof n ? n : n[i] || n.value;
                                e = this.recordCollapse(t, e, l);
                            }
                            return e;
                        }),
                        (t.prototype.recordCollapse = function (t, e, o) {
                            return (
                                (o = '\u25c2' + o + '\u25b8'),
                                t.setProperty('collapse-marker', o),
                                t.setProperty('collapse-complexity', e),
                                o.length * this.complexity.complexity.text
                            );
                        }),
                        (t.prototype.unrecordCollapse = function (t) {
                            var e = t.getProperty('collapse-complexity');
                            null != e &&
                                (t.attributes.set('data-semantic-complexity', e),
                                t.removeProperty('collapse-complexity'),
                                t.removeProperty('collapse-marker'));
                        }),
                        (t.prototype.canUncollapse = function (t, e, o) {
                            if (
                                (void 0 === o && (o = 1),
                                this.splitAttribute(t, 'children').length === o)
                            ) {
                                var i =
                                    1 === t.childNodes.length && t.childNodes[0].isInferred
                                        ? t.childNodes[0]
                                        : t;
                                if (i && i.childNodes[e]) {
                                    var r = i.childNodes[e];
                                    if (r.getProperty('collapse-marker')) return r;
                                }
                            }
                            return null;
                        }),
                        (t.prototype.uncollapseChild = function (t, e, o, i) {
                            void 0 === i && (i = 1);
                            var r = this.canUncollapse(e, o, i);
                            return (
                                r &&
                                    (this.unrecordCollapse(r),
                                    r.parent !== e &&
                                        r.parent.attributes.set('data-semantic-complexity', void 0),
                                    (t = this.complexity.visitNode(e, !1))),
                                t
                            );
                        }),
                        (t.prototype.splitAttribute = function (t, e) {
                            return (t.attributes.get('data-semantic-' + e) || '').split(/,/);
                        }),
                        (t.prototype.getText = function (t) {
                            var e = this;
                            return t.isToken
                                ? t.getText()
                                : t.childNodes
                                      .map(function (t) {
                                          return e.getText(t);
                                      })
                                      .join('');
                        }),
                        (t.prototype.findChildText = function (t, e) {
                            var o = this.findChild(t, e);
                            return this.getText(o.coreMO() || o);
                        }),
                        (t.prototype.findChild = function (t, e) {
                            var i, r;
                            if (!t || t.attributes.get('data-semantic-id') === e) return t;
                            if (!t.isToken)
                                try {
                                    for (
                                        var n = o(t.childNodes), l = n.next();
                                        !l.done;
                                        l = n.next()
                                    ) {
                                        var s = l.value,
                                            a = this.findChild(s, e);
                                        if (a) return a;
                                    }
                                } catch (t) {
                                    i = { error: t };
                                } finally {
                                    try {
                                        l && !l.done && (r = n.return) && r.call(n);
                                    } finally {
                                        if (i) throw i.error;
                                    }
                                }
                            return null;
                        }),
                        (t.prototype.makeCollapse = function (t) {
                            var e = [];
                            t.walkTree(function (t) {
                                t.getProperty('collapse-marker') && e.push(t);
                            }),
                                this.makeActions(e);
                        }),
                        (t.prototype.makeActions = function (t) {
                            var e, i;
                            try {
                                for (var r = o(t), n = r.next(); !n.done; n = r.next()) {
                                    var l = n.value;
                                    this.makeAction(l);
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (i = r.return) && i.call(r);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                        }),
                        (t.prototype.makeId = function () {
                            return 'mjx-collapse-' + this.idCount++;
                        }),
                        (t.prototype.makeAction = function (t) {
                            t.isKind('math') && (t = this.addMrow(t));
                            var e = this.complexity.factory,
                                o = t.getProperty('collapse-marker'),
                                i = t.parent,
                                r = e.create(
                                    'maction',
                                    {
                                        actiontype: 'toggle',
                                        selection: 2,
                                        'data-collapsible': !0,
                                        id: this.makeId(),
                                        'data-semantic-complexity': t.attributes.get(
                                            'data-semantic-complexity',
                                        ),
                                    },
                                    [
                                        e.create('mtext', { mathcolor: 'blue' }, [
                                            e.create('text').setText(o),
                                        ]),
                                    ],
                                );
                            r.inheritAttributesFrom(t),
                                t.attributes.set(
                                    'data-semantic-complexity',
                                    t.getProperty('collapse-complexity'),
                                ),
                                t.removeProperty('collapse-marker'),
                                t.removeProperty('collapse-complexity'),
                                i.replaceChild(r, t),
                                r.appendChild(t);
                        }),
                        (t.prototype.addMrow = function (t) {
                            var e,
                                i,
                                r = this.complexity.factory.create(
                                    'mrow',
                                    null,
                                    t.childNodes[0].childNodes,
                                );
                            t.childNodes[0].setChildren([r]);
                            var n = t.attributes.getAllAttributes();
                            try {
                                for (
                                    var l = o(Object.keys(n)), s = l.next();
                                    !s.done;
                                    s = l.next()
                                ) {
                                    var a = s.value;
                                    'data-semantic-' === a.substr(0, 14) &&
                                        (r.attributes.set(a, n[a]), delete n[a]);
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    s && !s.done && (i = l.return) && i.call(l);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                            return (
                                r.setProperty('collapse-marker', t.getProperty('collapse-marker')),
                                r.setProperty(
                                    'collapse-complexity',
                                    t.getProperty('collapse-complexity'),
                                ),
                                t.removeProperty('collapse-marker'),
                                t.removeProperty('collapse-complexity'),
                                r
                            );
                        }),
                        (t.NOCOLLAPSE = 1e7),
                        t
                    );
                })();
                e.Collapse = i;
            },
            175: function (t, e, o) {
                var i,
                    r =
                        (this && this.__extends) ||
                        ((i = function (t, e) {
                            return (
                                (i =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var o in e)
                                            Object.prototype.hasOwnProperty.call(e, o) &&
                                                (t[o] = e[o]);
                                    }),
                                i(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            i(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        }),
                    n =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                o = e && t[e],
                                i = 0;
                            if (o) return o.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && i >= t.length && (t = void 0),
                                            { value: t && t[i++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.ComplexityVisitor = void 0);
                var l = o(176),
                    s = o(850),
                    a = o(77),
                    p = (function (t) {
                        function e(e, o) {
                            var i = t.call(this, e) || this;
                            i.complexity = {
                                text: 0.5,
                                token: 0.5,
                                child: 1,
                                script: 0.8,
                                sqrt: 2,
                                subsup: 2,
                                underover: 2,
                                fraction: 2,
                                enclose: 2,
                                action: 2,
                                phantom: 0,
                                xml: 2,
                                glyph: 2,
                            };
                            var r = i.constructor;
                            return (
                                (i.options = (0, a.userOptions)(
                                    (0, a.defaultOptions)({}, r.OPTIONS),
                                    o,
                                )),
                                (i.collapse = new i.options.Collapse(i)),
                                (i.factory = e),
                                i
                            );
                        }
                        return (
                            r(e, t),
                            (e.prototype.visitTree = function (e) {
                                t.prototype.visitTree.call(this, e, !0),
                                    this.options.makeCollapsible && this.collapse.makeCollapse(e);
                            }),
                            (e.prototype.visitNode = function (e, o) {
                                if (!e.attributes.get('data-semantic-complexity'))
                                    return t.prototype.visitNode.call(this, e, o);
                            }),
                            (e.prototype.visitDefault = function (t, e) {
                                var o;
                                if (t.isToken) {
                                    var i = t.getText();
                                    o = this.complexity.text * i.length + this.complexity.token;
                                } else o = this.childrenComplexity(t);
                                return this.setComplexity(t, o, e);
                            }),
                            (e.prototype.visitMfracNode = function (t, e) {
                                var o =
                                    this.childrenComplexity(t) * this.complexity.script +
                                    this.complexity.fraction;
                                return this.setComplexity(t, o, e);
                            }),
                            (e.prototype.visitMsqrtNode = function (t, e) {
                                var o = this.childrenComplexity(t) + this.complexity.sqrt;
                                return this.setComplexity(t, o, e);
                            }),
                            (e.prototype.visitMrootNode = function (t, e) {
                                var o =
                                    this.childrenComplexity(t) +
                                    this.complexity.sqrt -
                                    (1 - this.complexity.script) *
                                        this.getComplexity(t.childNodes[1]);
                                return this.setComplexity(t, o, e);
                            }),
                            (e.prototype.visitMphantomNode = function (t, e) {
                                return this.setComplexity(t, this.complexity.phantom, e);
                            }),
                            (e.prototype.visitMsNode = function (t, e) {
                                var o =
                                    (
                                        t.attributes.get('lquote') +
                                        t.getText() +
                                        t.attributes.get('rquote')
                                    ).length * this.complexity.text;
                                return this.setComplexity(t, o, e);
                            }),
                            (e.prototype.visitMsubsupNode = function (e, o) {
                                t.prototype.visitDefault.call(this, e, !0);
                                var i = e.childNodes[e.sub],
                                    r = e.childNodes[e.sup],
                                    n = e.childNodes[e.base],
                                    l =
                                        Math.max(
                                            i ? this.getComplexity(i) : 0,
                                            r ? this.getComplexity(r) : 0,
                                        ) * this.complexity.script;
                                return (
                                    (l += this.complexity.child * ((i ? 1 : 0) + (r ? 1 : 0))),
                                    (l += n ? this.getComplexity(n) + this.complexity.child : 0),
                                    (l += this.complexity.subsup),
                                    this.setComplexity(e, l, o)
                                );
                            }),
                            (e.prototype.visitMsubNode = function (t, e) {
                                return this.visitMsubsupNode(t, e);
                            }),
                            (e.prototype.visitMsupNode = function (t, e) {
                                return this.visitMsubsupNode(t, e);
                            }),
                            (e.prototype.visitMunderoverNode = function (e, o) {
                                t.prototype.visitDefault.call(this, e, !0);
                                var i = e.childNodes[e.under],
                                    r = e.childNodes[e.over],
                                    n = e.childNodes[e.base],
                                    l =
                                        Math.max(
                                            i ? this.getComplexity(i) : 0,
                                            r ? this.getComplexity(r) : 0,
                                        ) * this.complexity.script;
                                return (
                                    n && (l = Math.max(this.getComplexity(n), l)),
                                    (l +=
                                        this.complexity.child *
                                        ((i ? 1 : 0) + (r ? 1 : 0) + (n ? 1 : 0))),
                                    (l += this.complexity.underover),
                                    this.setComplexity(e, l, o)
                                );
                            }),
                            (e.prototype.visitMunderNode = function (t, e) {
                                return this.visitMunderoverNode(t, e);
                            }),
                            (e.prototype.visitMoverNode = function (t, e) {
                                return this.visitMunderoverNode(t, e);
                            }),
                            (e.prototype.visitMencloseNode = function (t, e) {
                                var o = this.childrenComplexity(t) + this.complexity.enclose;
                                return this.setComplexity(t, o, e);
                            }),
                            (e.prototype.visitMactionNode = function (t, e) {
                                this.childrenComplexity(t);
                                var o = this.getComplexity(t.selected);
                                return this.setComplexity(t, o, e);
                            }),
                            (e.prototype.visitMsemanticsNode = function (t, e) {
                                var o = t.childNodes[0],
                                    i = 0;
                                return (
                                    o && (this.visitNode(o, !0), (i = this.getComplexity(o))),
                                    this.setComplexity(t, i, e)
                                );
                            }),
                            (e.prototype.visitAnnotationNode = function (t, e) {
                                return this.setComplexity(t, this.complexity.xml, e);
                            }),
                            (e.prototype.visitAnnotation_xmlNode = function (t, e) {
                                return this.setComplexity(t, this.complexity.xml, e);
                            }),
                            (e.prototype.visitMglyphNode = function (t, e) {
                                return this.setComplexity(t, this.complexity.glyph, e);
                            }),
                            (e.prototype.getComplexity = function (t) {
                                var e = t.getProperty('collapsedComplexity');
                                return null != e ? e : t.attributes.get('data-semantic-complexity');
                            }),
                            (e.prototype.setComplexity = function (t, e, o) {
                                return (
                                    o &&
                                        (this.options.identifyCollapsible &&
                                            (e = this.collapse.check(t, e)),
                                        t.attributes.set('data-semantic-complexity', e)),
                                    e
                                );
                            }),
                            (e.prototype.childrenComplexity = function (e) {
                                var o, i;
                                t.prototype.visitDefault.call(this, e, !0);
                                var r = 0;
                                try {
                                    for (
                                        var l = n(e.childNodes), s = l.next();
                                        !s.done;
                                        s = l.next()
                                    ) {
                                        var a = s.value;
                                        r += this.getComplexity(a);
                                    }
                                } catch (t) {
                                    o = { error: t };
                                } finally {
                                    try {
                                        s && !s.done && (i = l.return) && i.call(l);
                                    } finally {
                                        if (o) throw o.error;
                                    }
                                }
                                return (
                                    e.childNodes.length > 1 &&
                                        (r += e.childNodes.length * this.complexity.child),
                                    r
                                );
                            }),
                            (e.OPTIONS = {
                                identifyCollapsible: !0,
                                makeCollapsible: !0,
                                Collapse: s.Collapse,
                            }),
                            e
                        );
                    })(l.MmlVisitor);
                e.ComplexityVisitor = p;
            },
            306: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            511: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.EnrichedMathItemMixin =
                        MathJax._.a11y['semantic-enrich'].EnrichedMathItemMixin),
                    (e.EnrichedMathDocumentMixin =
                        MathJax._.a11y['semantic-enrich'].EnrichedMathDocumentMixin),
                    (e.EnrichHandler = MathJax._.a11y['semantic-enrich'].EnrichHandler);
            },
            723: function (t, e) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    (e.PV = MathJax._.components.global.combineDefaults),
                    (e.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            769: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.protoItem = MathJax._.core.MathItem.protoItem),
                    (e.AbstractMathItem = MathJax._.core.MathItem.AbstractMathItem),
                    (e.STATE = MathJax._.core.MathItem.STATE),
                    (e.newState = MathJax._.core.MathItem.newState);
            },
            176: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlVisitor = MathJax._.core.MmlTree.MmlVisitor.MmlVisitor);
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
        s = {};
    function a(t) {
        var e = s[t];
        if (void 0 !== e) return e.exports;
        var o = (s[t] = { exports: {} });
        return l[t].call(o.exports, o, o.exports, a), o.exports;
    }
    (t = a(723)),
        (e = a(306)),
        (o = a(589)),
        (i = a(850)),
        (r = a(175)),
        (n = a(511)),
        MathJax.loader && MathJax.loader.checkVersion('a11y/complexity', e.q, 'a11y'),
        (0, t.r8)({
            _: {
                a11y: {
                    complexity_ts: o,
                    complexity: { collapse: i, visitor: r },
                    'semantic-enrich': n,
                },
            },
        }),
        MathJax.startup &&
            (MathJax.startup.extendHandler(function (t) {
                return (0, o.ComplexityHandler)(t);
            }),
            (0, t.PV)(MathJax.config, 'options', MathJax.config['a11y/complexity'] || {}));
})();
