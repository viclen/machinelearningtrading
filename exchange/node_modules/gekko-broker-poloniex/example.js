const Poloniex = require('./poloniex');

const p = new Poloniex();

p.returnTicker(console.log);


// fil in keys and uncommetn
// const p2 = new Poloniex({
//   key: 'x',
//   secret: 'y'
// });
// p2.returnOpenOrders('BTC', 'USDT', console.log)