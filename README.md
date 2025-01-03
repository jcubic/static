# static

Static Assets:

usage example:

* https://cdn.statically.io/gh/jcubic/static/master/js/lzjb.js
* https://cdn.jsdelivr.net/gh/jcubic/static@master/js/lzjb.js

## Create a Bundle

For bunlding whole library you can use

```bash
npm install <module>
./build <module> [<name>]
```

Name is optional for when a module have dashes. It will create a file `<module>.min.js` in /js directory.

If bundling doesn't work you can create a file named index.js

```javascript
import { configureSingle, fs } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';

export { configureSingle, fs, IndexedDB };
```

and use esbuild to creae IIFE for the browser.

```bash
npx esbuild index.js --bundle --minify --format=iife --global-name=ZenFS --outfile=js/zenfs.min.js
```
