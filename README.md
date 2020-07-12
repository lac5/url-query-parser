# url-query-parser

A simple script for parsing and manipulating application/x-www-form-urlencoded data (such as the query strings in URLs). Works in both browsers and node.js.

### Usage

```js
import Query from 'url-query-parser';

let query = new Query('foo=bar&biz=baz');

console.log(query.get('foo')); // <= 'bar'
```

There's a bunch of things it can do. Check out [src/query.spec.ts](src/query.spec.ts) for details.

If instead you just want simple `string->object` and `object->string` functions, you can use `url-query-parser/simple`.

```js
const Query = require('url-query-parser/simple');

let query = Query.parse('foo=bar&biz=baz');
console.log(query); // <= { foo: 'bar', biz: 'baz' }
console.log(Query.stringify(query)); // <= 'foo=bar&biz=baz'
```
