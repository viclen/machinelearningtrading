# The Rock Trading 

    npm install therocktrading 

A very very very basic API wrapper for the [The Rock Trading REST API](https://api.therocktrading.com/). Please refer to [the documentation](https://api.therocktrading.com/doc/) for all calls explained. Check out `example.js` for a list of all possible calls and their parameters.

```javascript
var Therocktrading = require('therocktrading');
var therocktrading = new Therocktrading();

therocktrading.transactions('btceur', function(err, trades) {
  console.log(trades);
});
```
## 0.9 - February 2019

First release

# License

The MIT License (MIT)

Copyright (c) 2019 Davide Barbieri paci@therocktrading.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
