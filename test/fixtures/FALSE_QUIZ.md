# Learn Node.js by Example


## Requirements

- [x] A computer with internet access
- [ ] Time: 30h (e.g. 2 months 30 mins per day or **1 week intensive**)


## What is Node.js ?

Node.js lets you *easily* build networked software (websites, applications "apps",
using JavaScript).

Its not "*point-and-click*" like WordPress, SquareSpace or Salesforce;
you will need to write some "code". But as I will demonstrate, that's
a *lot* easier than it sounds and gives you more power/flexibility
and puts you in full control.

## Node.js is not "Version 1.0" yet can I used it in Production?

Yes! Some of the biggest organisations/companies in the world
are using Node.js in Production systems:

[Alibaba](https://github.com/alibaba/node-hbase-client),
[Ajax.org](Ajax.org),
[Box.com](http://tech.blog.box.com/2014/06/node-js-high-availability-at-box/), British Sky Broadcasting (Sky/Now TV),
CNN,
[Cloudup](https://cloudup.com/),
Conde Nast,
[DirectTV](http://strongloop.com/strongblog/node-summit-media-companies-embrace-node-js-for-rapidly-developing-responsive-apps/),
[Dow Jones](http://nodejs.org/industry),
eBay,
[FeedHenry](http://www.feedhenry.com/),
[GitHub](https://twitter.com/github/status/16979699217465344),
[Google](http://venturebeat.com/2012/01/24/node-at-google-mozilla-yahoo/),
[Groupon](http://nodeup.com/fiftyeight),
HBO,
Help.com,
[HP](https://github.com/joyent/node/wiki/Projects,-Applications,-and-Companies-Using-Node),
iTV,
[Joyent](https://www.joyent.com/) (duh!),
[Klout](https://klout.com),
LinkedIn,
McDonalds,
[Medium](https://medium.com/the-story),
Mozilla,
NetFlix,
[OpenTable](http://hapijs.com/community),
PayPal,
Pearson,
~~Q~~,
[Revolt](http://revolt.tv/),
[Square](https://modulus.io/companies-using-node),
Tesco,
ThomasCook,
Trello,
Uber,
Voxer,
Walmart,
Wikimedia (in progress of moving to SOA with node!)
Yahoo,
Yammer,
[Yandex](https://www.youtube.com/watch?v=zdCxgdH4wZo),
[Zendesk](http://radar.zendesk.com/)

Want more? See: http://nodejs.org/industry/ and <br />
https://github.com/joyent/node/wiki/Projects,-Applications,-and-Companies-Using-Node


# Try it!

## Download & Install

> http://nodejs.org/download/


## Node.js (Core) API

The node.js ("core") has many useful modules.

Bookmark: [http://nodejs.org/api](http://nodejs.org/api/) (you will come back to it)



## Stability (Can we use it?)

> *Which node.js* ***core*** *package(s) can/should I use?*

Every core module has a
["***Stability Index***"](http://nodejs.org/api/documentation.html#documentation_stability_index)
rating on the node.js API.

**General rule**: If you are being *paid* to write code
that runs in node.js, <br /> pick core modules/methods
with stability **Stable**, **API Frozen** and **Locked**.

![Node.js Stability Index](http://i.imgur.com/xIroFrS.png)


### Examples

- [**cluster**](http://nodejs.org/api/cluster.html) is ***Experimental*** - don't use
- [**domain**](http://nodejs.org/api/domain.html) is ***Unstable*** - don't use
- [**path**](http://nodejs.org/api/path.html) is ***Stable*** - use
- [**events**](http://nodejs.org/api/events.html) is ***Frozen*** - use
- [**assert**](http://nodejs.org/api/assert.html) is ***Locked*** - use

Core Modules to Learn

- path
- os



Community Modules to Learn:

- [jscs](https://www.npmjs.org/package/jscs) - code style checker
- [q](https://www.npmjs.org/package/q) - promises library
- [nd](https://www.npmjs.org/package/nd) - view documentation for a module
