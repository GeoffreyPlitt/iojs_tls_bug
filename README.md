iojs_tls_bug
============

This repo shows a memory leak with certain implementations of HTTPS.

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
- iojs -
