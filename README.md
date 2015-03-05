iojs_tls_bug
============

This repo shows a memory leak with certain implementations of HTTPS.

It runs a simple simulation of concurrent requests in both HTTP and HTTPS modes,
and measures memory before/after. It also use global.gc() before measurements
to measure actual leaks.

Instructions
------------

- If necessary, fix vagrant path issue
```bash
sudo chown -R vagrant ~
sudo chgrp -R vagrant ~
```
- Install
```bash
nvm install 0.10 # or "0.12", or "iojs"
rm -rf ./node_modules
npm install
```
- Test
```bash
npm test
```

Findings
---------
As of this writing:
- 0.10 - both work
- 0.12 - both work
- iojs - http works, HTTPS BROKEN

Errors
-------
Here's what it looks like when iojs+HTTPS breaks. Notice the TLS stuff.

```
$ npm test

> iojs_tls_bug@0.0.1 test /vagrant
> mocha --expose-gc --reporter spec -- test.js

NODE VERSION: v1.4.3


  iojs http/https investigation
    ✓ run simulation with http (18560ms)
memwatch diff: {
  "before": {
    "nodes": 71087,
    "size_bytes": 8639856,
    "size": "8.24 mb"
  },
  "after": {
    "nodes": 94791,
    "size_bytes": 10666320,
    "size": "10.17 mb"
  },
  "change": {
    "size_bytes": 2026464,
    "size": "1.93 mb",
    "freed_nodes": 1129,
    "allocated_nodes": 24833,
    "details": [
      {
        "what": "Array",
        "size_bytes": 735040,
        "size": "717.81 kb",
        "+": 6214,
        "-": 522
      },
      {
        "what": "Closure",
        "size_bytes": 285912,
        "size": "279.21 kb",
        "+": 4159,
        "-": 188
      },
      {
        "what": "system / Context",
        "size_bytes": 197144,
        "size": "192.52 kb",
        "+": 3381,
        "-": 121
      },
      {
        "what": "Object",
        "size_bytes": 112472,
        "size": "109.84 kb",
        "+": 2256,
        "-": 40
      },
      {
        "what": "String",
        "size_bytes": 69392,
        "size": "67.77 kb",
        "+": 1847,
        "-": 23
      },
      {
        "what": "Code",
        "size_bytes": 324464,
        "size": "316.86 kb",
        "+": 1318,
        "-": 111
      },
      {
        "what": "WriteWrap",
        "size_bytes": 17920,
        "size": "17.5 kb",
        "+": 564,
        "-": 4
      },
      {
        "what": "ReadableState",
        "size_bytes": 50232,
        "size": "49.05 kb",
        "+": 273,
        "-": 0
      },
      {
        "what": "SecureContext",
        "size_bytes": 8256,
        "size": "8.06 kb",
        "+": 258,
        "-": 0
      },
      {
        "what": "IncomingMessage",
        "size_bytes": 34560,
        "size": "33.75 kb",
        "+": 144,
        "-": 0
      },
      {
        "what": "TCP",
        "size_bytes": 4128,
        "size": "4.03 kb",
        "+": 129,
        "-": 0
      },
      {
        "what": "TLSSocket",
        "size_bytes": 25800,
        "size": "25.2 kb",
        "+": 129,
        "-": 0
      },
      {
        "what": "TLSWrap",
        "size_bytes": 4128,
        "size": "4.03 kb",
        "+": 129,
        "-": 0
      },
      {
        "what": "WritableState",
        "size_bytes": 24768,
        "size": "24.19 kb",
        "+": 129,
        "-": 0
      },
      {
        "what": "ClientRequest",
        "size_bytes": 13416,
        "size": "13.1 kb",
        "+": 129,
        "-": 0
      },
      {
        "what": "Agent",
        "size_bytes": 13416,
        "size": "13.1 kb",
        "+": 129,
        "-": 0
      }
    ]
  }
}
mem_deltas: { rss: 81788928, heapTotal: 17554944, heapUsed: 1539968 }
    1) run simulation with https


  1 passing (40s)
  1 failing

  1) iojs http/https investigation run simulation with https:
     Uncaught AssertionError: diff > 0
      at Object.exports.memory_leak_end (/vagrant/memory_tests.js:45:5)
      at null._onTimeout (/vagrant/test.js:36:20)
      at Timer.listOnTimeout (timers.js:88:15)



npm ERR! Test failed.  See above for more details.
```
