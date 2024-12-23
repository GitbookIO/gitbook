!(function () {
    'use strict';
    var t,
        o,
        n,
        a = {
            667: function (t, o) {
                (o.q = void 0), (o.q = '3.2.2');
            },
            941: function (t, o, n) {
                var a,
                    r =
                        (this && this.__extends) ||
                        ((a = function (t, o) {
                            return (
                                (a =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, o) {
                                            t.__proto__ = o;
                                        }) ||
                                    function (t, o) {
                                        for (var n in o)
                                            Object.prototype.hasOwnProperty.call(o, n) &&
                                                (t[n] = o[n]);
                                    }),
                                a(t, o)
                            );
                        }),
                        function (t, o) {
                            if ('function' != typeof o && null !== o)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(o) +
                                        ' is not a constructor or null',
                                );
                            function n() {
                                this.constructor = t;
                            }
                            a(t, o),
                                (t.prototype =
                                    null === o
                                        ? Object.create(o)
                                        : ((n.prototype = o.prototype), new n()));
                        });
                Object.defineProperty(o, '__esModule', { value: !0 }),
                    (o.TagFormatConfiguration = o.tagformatConfig = void 0);
                var e = n(251),
                    i = n(680),
                    s = 0;
                function u(t, o) {
                    var n = o.parseOptions.options.tags;
                    'base' !== n && t.tags.hasOwnProperty(n) && i.TagsFactory.add(n, t.tags[n]);
                    var a = (function (t) {
                            function n() {
                                return (null !== t && t.apply(this, arguments)) || this;
                            }
                            return (
                                r(n, t),
                                (n.prototype.formatNumber = function (t) {
                                    return o.parseOptions.options.tagformat.number(t);
                                }),
                                (n.prototype.formatTag = function (t) {
                                    return o.parseOptions.options.tagformat.tag(t);
                                }),
                                (n.prototype.formatId = function (t) {
                                    return o.parseOptions.options.tagformat.id(t);
                                }),
                                (n.prototype.formatUrl = function (t, n) {
                                    return o.parseOptions.options.tagformat.url(t, n);
                                }),
                                n
                            );
                        })(i.TagsFactory.create(o.parseOptions.options.tags).constructor),
                        e = 'configTags-' + ++s;
                    i.TagsFactory.add(e, a), (o.parseOptions.options.tags = e);
                }
                (o.tagformatConfig = u),
                    (o.TagFormatConfiguration = e.Configuration.create('tagformat', {
                        config: [u, 10],
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
                                url: function (t, o) {
                                    return o + '#' + encodeURIComponent(t);
                                },
                            },
                        },
                    }));
            },
            955: function (t, o) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (o.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            251: function (t, o) {
                Object.defineProperty(o, '__esModule', { value: !0 }),
                    (o.Configuration = MathJax._.input.tex.Configuration.Configuration),
                    (o.ConfigurationHandler =
                        MathJax._.input.tex.Configuration.ConfigurationHandler),
                    (o.ParserConfiguration = MathJax._.input.tex.Configuration.ParserConfiguration);
            },
            680: function (t, o) {
                Object.defineProperty(o, '__esModule', { value: !0 }),
                    (o.Label = MathJax._.input.tex.Tags.Label),
                    (o.TagInfo = MathJax._.input.tex.Tags.TagInfo),
                    (o.AbstractTags = MathJax._.input.tex.Tags.AbstractTags),
                    (o.NoTags = MathJax._.input.tex.Tags.NoTags),
                    (o.AllTags = MathJax._.input.tex.Tags.AllTags),
                    (o.TagsFactory = MathJax._.input.tex.Tags.TagsFactory);
            },
        },
        r = {};
    function e(t) {
        var o = r[t];
        if (void 0 !== o) return o.exports;
        var n = (r[t] = { exports: {} });
        return a[t].call(n.exports, n, n.exports, e), n.exports;
    }
    (t = e(955)),
        (o = e(667)),
        (n = e(941)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/tagformat', o.q, 'tex-extension'),
        (0, t.r8)({ _: { input: { tex: { tagformat: { TagFormatConfiguration: n } } } } });
})();
