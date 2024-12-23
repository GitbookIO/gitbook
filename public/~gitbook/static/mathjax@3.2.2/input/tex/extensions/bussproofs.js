!(function () {
    'use strict';
    var e,
        t,
        r,
        o,
        n,
        a,
        i = {
            667: function (e, t) {
                (t.q = void 0), (t.q = '3.2.2');
            },
            333: function (e, t, r) {
                var o;
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.BussproofsConfiguration = void 0);
                var n = r(251),
                    a = r(854),
                    i = r(378);
                r(116),
                    (t.BussproofsConfiguration = n.Configuration.create('bussproofs', {
                        handler: {
                            macro: ['Bussproofs-macros'],
                            environment: ['Bussproofs-environments'],
                        },
                        items: ((o = {}), (o[a.ProofTreeItem.prototype.kind] = a.ProofTreeItem), o),
                        preprocessors: [[i.saveDocument, 1]],
                        postprocessors: [
                            [i.clearDocument, 3],
                            [i.makeBsprAttributes, 2],
                            [i.balanceRules, 1],
                        ],
                    }));
            },
            854: function (e, t, r) {
                var o,
                    n =
                        (this && this.__extends) ||
                        ((o = function (e, t) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (e, t) {
                                            e.__proto__ = t;
                                        }) ||
                                    function (e, t) {
                                        for (var r in t)
                                            Object.prototype.hasOwnProperty.call(t, r) &&
                                                (e[r] = t[r]);
                                    }),
                                o(e, t)
                            );
                        }),
                        function (e, t) {
                            if ('function' != typeof t && null !== t)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(t) +
                                        ' is not a constructor or null',
                                );
                            function r() {
                                this.constructor = e;
                            }
                            o(e, t),
                                (e.prototype =
                                    null === t
                                        ? Object.create(t)
                                        : ((r.prototype = t.prototype), new r()));
                        }),
                    a =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (e, t, r, o) {
                                  void 0 === o && (o = r);
                                  var n = Object.getOwnPropertyDescriptor(t, r);
                                  (n &&
                                      !('get' in n
                                          ? !t.__esModule
                                          : n.writable || n.configurable)) ||
                                      (n = {
                                          enumerable: !0,
                                          get: function () {
                                              return t[r];
                                          },
                                      }),
                                      Object.defineProperty(e, o, n);
                              }
                            : function (e, t, r, o) {
                                  void 0 === o && (o = r), (e[o] = t[r]);
                              }),
                    i =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (e, t) {
                                  Object.defineProperty(e, 'default', { enumerable: !0, value: t });
                              }
                            : function (e, t) {
                                  e.default = t;
                              }),
                    l =
                        (this && this.__importStar) ||
                        function (e) {
                            if (e && e.__esModule) return e;
                            var t = {};
                            if (null != e)
                                for (var r in e)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(e, r) &&
                                        a(t, e, r);
                            return i(t, e), t;
                        },
                    u =
                        (this && this.__importDefault) ||
                        function (e) {
                            return e && e.__esModule ? e : { default: e };
                        };
                Object.defineProperty(t, '__esModule', { value: !0 }), (t.ProofTreeItem = void 0);
                var f = u(r(402)),
                    s = r(76),
                    d = u(r(935)),
                    c = l(r(378)),
                    p = (function (e) {
                        function t() {
                            var t = (null !== e && e.apply(this, arguments)) || this;
                            return (
                                (t.leftLabel = null),
                                (t.rigthLabel = null),
                                (t.innerStack = new d.default(t.factory, {}, !0)),
                                t
                            );
                        }
                        return (
                            n(t, e),
                            Object.defineProperty(t.prototype, 'kind', {
                                get: function () {
                                    return 'proofTree';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (t.prototype.checkItem = function (e) {
                                if (e.isKind('end') && 'prooftree' === e.getName()) {
                                    var t = this.toMml();
                                    return (
                                        c.setProperty(t, 'proof', !0),
                                        [[this.factory.create('mml', t), e], !0]
                                    );
                                }
                                if (e.isKind('stop'))
                                    throw new f.default(
                                        'EnvMissingEnd',
                                        'Missing \\end{%1}',
                                        this.getName(),
                                    );
                                return this.innerStack.Push(e), s.BaseItem.fail;
                            }),
                            (t.prototype.toMml = function () {
                                var t = e.prototype.toMml.call(this),
                                    r = this.innerStack.Top();
                                if (r.isKind('start') && !r.Size()) return t;
                                this.innerStack.Push(this.factory.create('stop'));
                                var o = this.innerStack.Top().toMml();
                                return this.create('node', 'mrow', [o, t], {});
                            }),
                            t
                        );
                    })(s.BaseItem);
                t.ProofTreeItem = p;
            },
            116: function (e, t, r) {
                var o =
                    (this && this.__importDefault) ||
                    function (e) {
                        return e && e.__esModule ? e : { default: e };
                    };
                Object.defineProperty(t, '__esModule', { value: !0 });
                var n = o(r(827)),
                    a = o(r(945)),
                    i = r(871);
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
                    n.default,
                ),
                    new i.EnvironmentMap(
                        'Bussproofs-environments',
                        a.default.environment,
                        { prooftree: ['Prooftree', null, !1] },
                        n.default,
                    );
            },
            827: function (e, t, r) {
                var o =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (e, t, r, o) {
                                  void 0 === o && (o = r);
                                  var n = Object.getOwnPropertyDescriptor(t, r);
                                  (n &&
                                      !('get' in n
                                          ? !t.__esModule
                                          : n.writable || n.configurable)) ||
                                      (n = {
                                          enumerable: !0,
                                          get: function () {
                                              return t[r];
                                          },
                                      }),
                                      Object.defineProperty(e, o, n);
                              }
                            : function (e, t, r, o) {
                                  void 0 === o && (o = r), (e[o] = t[r]);
                              }),
                    n =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (e, t) {
                                  Object.defineProperty(e, 'default', { enumerable: !0, value: t });
                              }
                            : function (e, t) {
                                  e.default = t;
                              }),
                    a =
                        (this && this.__importStar) ||
                        function (e) {
                            if (e && e.__esModule) return e;
                            var t = {};
                            if (null != e)
                                for (var r in e)
                                    'default' !== r &&
                                        Object.prototype.hasOwnProperty.call(e, r) &&
                                        o(t, e, r);
                            return n(t, e), t;
                        },
                    i =
                        (this && this.__read) ||
                        function (e, t) {
                            var r = 'function' == typeof Symbol && e[Symbol.iterator];
                            if (!r) return e;
                            var o,
                                n,
                                a = r.call(e),
                                i = [];
                            try {
                                for (; (void 0 === t || t-- > 0) && !(o = a.next()).done; )
                                    i.push(o.value);
                            } catch (e) {
                                n = { error: e };
                            } finally {
                                try {
                                    o && !o.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return i;
                        },
                    l =
                        (this && this.__spreadArray) ||
                        function (e, t, r) {
                            if (r || 2 === arguments.length)
                                for (var o, n = 0, a = t.length; n < a; n++)
                                    (!o && n in t) ||
                                        (o || (o = Array.prototype.slice.call(t, 0, n)),
                                        (o[n] = t[n]));
                            return e.concat(o || Array.prototype.slice.call(t));
                        },
                    u =
                        (this && this.__importDefault) ||
                        function (e) {
                            return e && e.__esModule ? e : { default: e };
                        };
                Object.defineProperty(t, '__esModule', { value: !0 });
                var f = u(r(402)),
                    s = u(r(193)),
                    d = u(r(398)),
                    c = a(r(378)),
                    p = {
                        Prooftree: function (e, t) {
                            return (
                                e.Push(t),
                                e.itemFactory.create('proofTree').setProperties({
                                    name: t.getName(),
                                    line: 'solid',
                                    currentLine: 'solid',
                                    rootAtTop: !1,
                                })
                            );
                        },
                        Axiom: function (e, t) {
                            var r = e.stack.Top();
                            if ('proofTree' !== r.kind)
                                throw new f.default(
                                    'IllegalProofCommand',
                                    'Proof commands only allowed in prooftree environment.',
                                );
                            var o = m(e, e.GetArgument(t));
                            c.setProperty(o, 'axiom', !0), r.Push(o);
                        },
                    },
                    m = function (e, t) {
                        var r = d.default.internalMath(e, d.default.trimSpaces(t), 0);
                        if (!r[0].childNodes[0].childNodes.length)
                            return e.create('node', 'mrow', []);
                        var o = e.create('node', 'mspace', [], { width: '.5ex' }),
                            n = e.create('node', 'mspace', [], { width: '.5ex' });
                        return e.create('node', 'mrow', l(l([o], i(r), !1), [n], !1));
                    };
                function h(e, t, r, o, n, a, i) {
                    var l,
                        u,
                        f,
                        s,
                        d = e.create('node', 'mtr', [e.create('node', 'mtd', [t], {})], {}),
                        p = e.create('node', 'mtr', [e.create('node', 'mtd', r, {})], {}),
                        m = e.create('node', 'mtable', i ? [p, d] : [d, p], {
                            align: 'top 2',
                            rowlines: a,
                            framespacing: '0 0',
                        });
                    if (
                        (c.setProperty(m, 'inferenceRule', i ? 'up' : 'down'),
                        o &&
                            ((l = e.create('node', 'mpadded', [o], {
                                height: '+.5em',
                                width: '+.5em',
                                voffset: '-.15em',
                            })),
                            c.setProperty(l, 'prooflabel', 'left')),
                        n &&
                            ((u = e.create('node', 'mpadded', [n], {
                                height: '+.5em',
                                width: '+.5em',
                                voffset: '-.15em',
                            })),
                            c.setProperty(u, 'prooflabel', 'right')),
                        o && n)
                    )
                        (f = [l, m, u]), (s = 'both');
                    else if (o) (f = [l, m]), (s = 'left');
                    else {
                        if (!n) return m;
                        (f = [m, u]), (s = 'right');
                    }
                    return (
                        (m = e.create('node', 'mrow', f)), c.setProperty(m, 'labelledRule', s), m
                    );
                }
                function y(e, t) {
                    if ('$' !== e.GetNext())
                        throw new f.default(
                            'IllegalUseOfCommand',
                            "Use of %1 does not match it's definition.",
                            t,
                        );
                    e.i++;
                    var r = e.GetUpTo(t, '$');
                    if (-1 === r.indexOf('\\fCenter'))
                        throw new f.default('IllegalUseOfCommand', 'Missing \\fCenter in %1.', t);
                    var o = i(r.split('\\fCenter'), 2),
                        n = o[0],
                        a = o[1],
                        l = new s.default(n, e.stack.env, e.configuration).mml(),
                        u = new s.default(a, e.stack.env, e.configuration).mml(),
                        d = new s.default('\\fCenter', e.stack.env, e.configuration).mml(),
                        p = e.create('node', 'mtd', [l], {}),
                        m = e.create('node', 'mtd', [d], {}),
                        h = e.create('node', 'mtd', [u], {}),
                        y = e.create('node', 'mtr', [p, m, h], {}),
                        v = e.create('node', 'mtable', [y], {
                            columnspacing: '.5ex',
                            columnalign: 'center 2',
                        });
                    return (
                        c.setProperty(v, 'sequent', !0), e.configuration.addNode('sequent', y), v
                    );
                }
                (p.Inference = function (e, t, r) {
                    var o = e.stack.Top();
                    if ('proofTree' !== o.kind)
                        throw new f.default(
                            'IllegalProofCommand',
                            'Proof commands only allowed in prooftree environment.',
                        );
                    if (o.Size() < r)
                        throw new f.default('BadProofTree', 'Proof tree badly specified.');
                    var n = o.getProperty('rootAtTop'),
                        a = 1 !== r || o.Peek()[0].childNodes.length ? r : 0,
                        i = [];
                    do {
                        i.length && i.unshift(e.create('node', 'mtd', [], {})),
                            i.unshift(
                                e.create('node', 'mtd', [o.Pop()], {
                                    rowalign: n ? 'top' : 'bottom',
                                }),
                            ),
                            r--;
                    } while (r > 0);
                    var l = e.create('node', 'mtr', i, {}),
                        u = e.create('node', 'mtable', [l], { framespacing: '0 0' }),
                        s = m(e, e.GetArgument(t)),
                        d = o.getProperty('currentLine');
                    d !== o.getProperty('line') &&
                        o.setProperty('currentLine', o.getProperty('line'));
                    var p = h(e, u, [s], o.getProperty('left'), o.getProperty('right'), d, n);
                    o.setProperty('left', null),
                        o.setProperty('right', null),
                        c.setProperty(p, 'inference', a),
                        e.configuration.addNode('inference', p),
                        o.Push(p);
                }),
                    (p.Label = function (e, t, r) {
                        var o = e.stack.Top();
                        if ('proofTree' !== o.kind)
                            throw new f.default(
                                'IllegalProofCommand',
                                'Proof commands only allowed in prooftree environment.',
                            );
                        var n = d.default.internalMath(e, e.GetArgument(t), 0),
                            a = n.length > 1 ? e.create('node', 'mrow', n, {}) : n[0];
                        o.setProperty(r, a);
                    }),
                    (p.SetLine = function (e, t, r, o) {
                        var n = e.stack.Top();
                        if ('proofTree' !== n.kind)
                            throw new f.default(
                                'IllegalProofCommand',
                                'Proof commands only allowed in prooftree environment.',
                            );
                        n.setProperty('currentLine', r), o && n.setProperty('line', r);
                    }),
                    (p.RootAtTop = function (e, t, r) {
                        var o = e.stack.Top();
                        if ('proofTree' !== o.kind)
                            throw new f.default(
                                'IllegalProofCommand',
                                'Proof commands only allowed in prooftree environment.',
                            );
                        o.setProperty('rootAtTop', r);
                    }),
                    (p.AxiomF = function (e, t) {
                        var r = e.stack.Top();
                        if ('proofTree' !== r.kind)
                            throw new f.default(
                                'IllegalProofCommand',
                                'Proof commands only allowed in prooftree environment.',
                            );
                        var o = y(e, t);
                        c.setProperty(o, 'axiom', !0), r.Push(o);
                    }),
                    (p.FCenter = function (e, t) {}),
                    (p.InferenceF = function (e, t, r) {
                        var o = e.stack.Top();
                        if ('proofTree' !== o.kind)
                            throw new f.default(
                                'IllegalProofCommand',
                                'Proof commands only allowed in prooftree environment.',
                            );
                        if (o.Size() < r)
                            throw new f.default('BadProofTree', 'Proof tree badly specified.');
                        var n = o.getProperty('rootAtTop'),
                            a = 1 !== r || o.Peek()[0].childNodes.length ? r : 0,
                            i = [];
                        do {
                            i.length && i.unshift(e.create('node', 'mtd', [], {})),
                                i.unshift(
                                    e.create('node', 'mtd', [o.Pop()], {
                                        rowalign: n ? 'top' : 'bottom',
                                    }),
                                ),
                                r--;
                        } while (r > 0);
                        var l = e.create('node', 'mtr', i, {}),
                            u = e.create('node', 'mtable', [l], { framespacing: '0 0' }),
                            s = y(e, t),
                            d = o.getProperty('currentLine');
                        d !== o.getProperty('line') &&
                            o.setProperty('currentLine', o.getProperty('line'));
                        var p = h(e, u, [s], o.getProperty('left'), o.getProperty('right'), d, n);
                        o.setProperty('left', null),
                            o.setProperty('right', null),
                            c.setProperty(p, 'inference', a),
                            e.configuration.addNode('inference', p),
                            o.Push(p);
                    }),
                    (t.default = p);
            },
            378: function (e, t, r) {
                var o,
                    n =
                        (this && this.__read) ||
                        function (e, t) {
                            var r = 'function' == typeof Symbol && e[Symbol.iterator];
                            if (!r) return e;
                            var o,
                                n,
                                a = r.call(e),
                                i = [];
                            try {
                                for (; (void 0 === t || t-- > 0) && !(o = a.next()).done; )
                                    i.push(o.value);
                            } catch (e) {
                                n = { error: e };
                            } finally {
                                try {
                                    o && !o.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return i;
                        },
                    a =
                        (this && this.__values) ||
                        function (e) {
                            var t = 'function' == typeof Symbol && Symbol.iterator,
                                r = t && e[t],
                                o = 0;
                            if (r) return r.call(e);
                            if (e && 'number' == typeof e.length)
                                return {
                                    next: function () {
                                        return (
                                            e && o >= e.length && (e = void 0),
                                            { value: e && e[o++], done: !e }
                                        );
                                    },
                                };
                            throw new TypeError(
                                t ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (e) {
                            return e && e.__esModule ? e : { default: e };
                        };
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.clearDocument =
                        t.saveDocument =
                        t.makeBsprAttributes =
                        t.removeProperty =
                        t.getProperty =
                        t.setProperty =
                        t.balanceRules =
                            void 0);
                var l = i(r(748)),
                    u = i(r(398)),
                    f = null,
                    s = null,
                    d = function (e) {
                        return (s.root = e), f.outputJax.getBBox(s, f).w;
                    },
                    c = function (e) {
                        for (var t = 0; e && !l.default.isType(e, 'mtable'); ) {
                            if (l.default.isType(e, 'text')) return null;
                            l.default.isType(e, 'mrow')
                                ? ((e = e.childNodes[0]), (t = 0))
                                : ((e = e.parent.childNodes[t]), t++);
                        }
                        return e;
                    },
                    p = function (e, t) {
                        return e.childNodes['up' === t ? 1 : 0].childNodes[0].childNodes[0]
                            .childNodes[0].childNodes[0];
                    },
                    m = function (e, t) {
                        return e.childNodes[t].childNodes[0].childNodes[0];
                    },
                    h = function (e) {
                        return m(e, 0);
                    },
                    y = function (e) {
                        return m(e, e.childNodes.length - 1);
                    },
                    v = function (e, t) {
                        return e.childNodes['up' === t ? 0 : 1].childNodes[0].childNodes[0]
                            .childNodes[0];
                    },
                    P = function (e) {
                        for (; e && !l.default.isType(e, 'mtd'); ) e = e.parent;
                        return e;
                    },
                    g = function (e) {
                        return e.parent.childNodes[e.parent.childNodes.indexOf(e) + 1];
                    },
                    b = function (e) {
                        for (; e && null == (0, t.getProperty)(e, 'inference'); ) e = e.parent;
                        return e;
                    },
                    _ = function (e, t, r) {
                        void 0 === r && (r = !1);
                        var o = 0;
                        if (e === t) return o;
                        if (e !== t.parent) {
                            var n = e.childNodes,
                                a = r ? n.length - 1 : 0;
                            l.default.isType(n[a], 'mspace') && (o += d(n[a])), (e = t.parent);
                        }
                        if (e === t) return o;
                        var i = e.childNodes,
                            u = r ? i.length - 1 : 0;
                        return i[u] !== t && (o += d(i[u])), o;
                    },
                    x = function (e, r) {
                        void 0 === r && (r = !1);
                        var o = c(e),
                            n = v(o, (0, t.getProperty)(o, 'inferenceRule'));
                        return _(e, o, r) + (d(o) - d(n)) / 2;
                    },
                    M = function (e, r, o, n) {
                        if (
                            (void 0 === n && (n = !1),
                            (0, t.getProperty)(r, 'inferenceRule') ||
                                (0, t.getProperty)(r, 'labelledRule'))
                        ) {
                            var a = e.nodeFactory.create('node', 'mrow');
                            r.parent.replaceChild(a, r), a.setChildren([r]), w(r, a), (r = a);
                        }
                        var i = n ? r.childNodes.length - 1 : 0,
                            f = r.childNodes[i];
                        l.default.isType(f, 'mspace')
                            ? l.default.setAttribute(
                                  f,
                                  'width',
                                  u.default.Em(
                                      u.default.dimen2em(l.default.getAttribute(f, 'width')) + o,
                                  ),
                              )
                            : ((f = e.nodeFactory.create('node', 'mspace', [], {
                                  width: u.default.Em(o),
                              })),
                              n ? r.appendChild(f) : ((f.parent = r), r.childNodes.unshift(f)));
                    },
                    w = function (e, r) {
                        ['inference', 'proof', 'maxAdjust', 'labelledRule'].forEach(function (o) {
                            var n = (0, t.getProperty)(e, o);
                            null != n && ((0, t.setProperty)(r, o, n), (0, t.removeProperty)(e, o));
                        });
                    },
                    C = function (e, r, o, n, a) {
                        var i = e.nodeFactory.create('node', 'mspace', [], {
                            width: u.default.Em(a),
                        });
                        if ('left' === n) {
                            var l = r.childNodes[o].childNodes[0];
                            (i.parent = l), l.childNodes.unshift(i);
                        } else r.childNodes[o].appendChild(i);
                        (0, t.setProperty)(r.parent, 'sequentAdjust_' + n, a);
                    },
                    T = function (e, r) {
                        for (var o = r.pop(); r.length; ) {
                            var a = r.pop(),
                                i = n(I(o, a), 2),
                                l = i[0],
                                u = i[1];
                            (0, t.getProperty)(o.parent, 'axiom') &&
                                (C(e, l < 0 ? o : a, 0, 'left', Math.abs(l)),
                                C(e, u < 0 ? o : a, 2, 'right', Math.abs(u))),
                                (o = a);
                        }
                    },
                    I = function (e, t) {
                        var r = d(e.childNodes[2]),
                            o = d(t.childNodes[2]);
                        return [d(e.childNodes[0]) - d(t.childNodes[0]), r - o];
                    };
                t.balanceRules = function (e) {
                    var r, o;
                    s = new e.document.options.MathItem('', null, e.math.display);
                    var n = e.data;
                    !(function (e) {
                        var r = e.nodeLists.sequent;
                        if (r)
                            for (var o = r.length - 1, n = void 0; (n = r[o]); o--)
                                if ((0, t.getProperty)(n, 'sequentProcessed'))
                                    (0, t.removeProperty)(n, 'sequentProcessed');
                                else {
                                    var a = [],
                                        i = b(n);
                                    if (1 === (0, t.getProperty)(i, 'inference')) {
                                        for (
                                            a.push(n);
                                            1 === (0, t.getProperty)(i, 'inference');

                                        ) {
                                            i = c(i);
                                            var l = h(p(i, (0, t.getProperty)(i, 'inferenceRule'))),
                                                u = (0, t.getProperty)(l, 'inferenceRule')
                                                    ? v(l, (0, t.getProperty)(l, 'inferenceRule'))
                                                    : l;
                                            (0, t.getProperty)(u, 'sequent') &&
                                                ((n = u.childNodes[0]),
                                                a.push(n),
                                                (0, t.setProperty)(n, 'sequentProcessed', !0)),
                                                (i = l);
                                        }
                                        T(e, a);
                                    }
                                }
                    })(n);
                    var i = n.nodeLists.inference || [];
                    try {
                        for (var l = a(i), u = l.next(); !u.done; u = l.next()) {
                            var f = u.value,
                                d = (0, t.getProperty)(f, 'proof'),
                                m = c(f),
                                w = p(m, (0, t.getProperty)(m, 'inferenceRule')),
                                C = h(w);
                            if ((0, t.getProperty)(C, 'inference')) {
                                var I = x(C);
                                if (I) {
                                    M(n, C, -I);
                                    var A = _(f, m, !1);
                                    M(n, f, I - A);
                                }
                            }
                            var S = y(w);
                            if (null != (0, t.getProperty)(S, 'inference')) {
                                var N = x(S, !0);
                                M(n, S, -N, !0);
                                var j = _(f, m, !0),
                                    O = (0, t.getProperty)(f, 'maxAdjust');
                                null != O && (N = Math.max(N, O));
                                var L = void 0;
                                if (!d && (L = P(f))) {
                                    var k = g(L);
                                    if (k) {
                                        var B = n.nodeFactory.create('node', 'mspace', [], {
                                            width: N - j + 'em',
                                        });
                                        k.appendChild(B), f.removeProperty('maxAdjust');
                                    } else {
                                        var J = b(L);
                                        J &&
                                            ((N = (0, t.getProperty)(J, 'maxAdjust')
                                                ? Math.max((0, t.getProperty)(J, 'maxAdjust'), N)
                                                : N),
                                            (0, t.setProperty)(J, 'maxAdjust', N));
                                    }
                                } else
                                    M(n, (0, t.getProperty)(f, 'proof') ? f : f.parent, N - j, !0);
                            }
                        }
                    } catch (e) {
                        r = { error: e };
                    } finally {
                        try {
                            u && !u.done && (o = l.return) && o.call(l);
                        } finally {
                            if (r) throw r.error;
                        }
                    }
                };
                var A = 'bspr_',
                    S = (((o = {}).bspr_maxAdjust = !0), o);
                t.setProperty = function (e, t, r) {
                    l.default.setProperty(e, A + t, r);
                };
                t.getProperty = function (e, t) {
                    return l.default.getProperty(e, A + t);
                };
                t.removeProperty = function (e, t) {
                    e.removeProperty(A + t);
                };
                t.makeBsprAttributes = function (e) {
                    e.data.root.walkTree(function (e, t) {
                        var r = [];
                        e.getPropertyNames().forEach(function (t) {
                            !S[t] &&
                                t.match(RegExp('^bspr_')) &&
                                r.push(t + ':' + e.getProperty(t));
                        }),
                            r.length && l.default.setAttribute(e, 'semantics', r.join(';'));
                    });
                };
                t.saveDocument = function (e) {
                    if (!('getBBox' in (f = e.document).outputJax))
                        throw Error(
                            'The bussproofs extension requires an output jax with a getBBox() method',
                        );
                };
                t.clearDocument = function (e) {
                    f = null;
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
            748: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.default = MathJax._.input.tex.NodeUtil.default);
            },
            945: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.default = MathJax._.input.tex.ParseMethods.default);
            },
            398: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.default = MathJax._.input.tex.ParseUtil.default);
            },
            935: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.default = MathJax._.input.tex.Stack.default);
            },
            76: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.MmlStack = MathJax._.input.tex.StackItem.MmlStack),
                    (t.BaseItem = MathJax._.input.tex.StackItem.BaseItem);
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
        },
        l = {};
    function u(e) {
        var t = l[e];
        if (void 0 !== t) return t.exports;
        var r = (l[e] = { exports: {} });
        return i[e].call(r.exports, r, r.exports, u), r.exports;
    }
    (e = u(955)),
        (t = u(667)),
        (r = u(333)),
        (o = u(854)),
        (n = u(827)),
        (a = u(378)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/bussproofs', t.q, 'tex-extension'),
        (0, e.r8)({
            _: {
                input: {
                    tex: {
                        bussproofs: {
                            BussproofsConfiguration: r,
                            BussproofsItems: o,
                            BussproofsMethods: n,
                            BussproofsUtil: a,
                        },
                    },
                },
            },
        });
})();
