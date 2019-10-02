var Therocktrading = require('./therocktrading.js');

var publicTherocktrading = new Therocktrading();

publicTherocktrading.ticker('btceur', console.log);
//publicTherocktrading.order_book('BTCEUR', 3, console.log);
publicTherocktrading.trades('BTCEUR', {after: '2019-03-17T00:49:49.000Z'}, console.log);

// nodejs-test mtbtceur
var key = 'INSERTKEYHERE';
var secret = 'INSERTSECRETHERE';
var timeout = 10000;
var host = 'api.therocktrading.com'
var privateTherocktrading = new Therocktrading(key, secret, timeout, host);

//    commented out for your protection
var amount = 0.0005;
var price = 3000;
var limit_price = 3000;

privateTherocktrading.balance('EUR', console.log);
//privateTherocktrading.buy('BTCEUR', amount, price, console.log);

//privateTherocktrading.cancel_order('BTCEUR', order_id, console.log);
//privateTherocktrading.open_orders('BTCEUR', console.log);
//privateTherocktrading.order_status('BTCEUR', 401349871, console.log);


// privateTherocktrading.user_transactions('btceur', {limit: 10, offset: 5, sort: 'asc'}, console.log);
// 
// privateTherocktrading.cancel_all_orders(console.log)
// privateTherocktrading.withdrawal_requests(console.log);
// privateTherocktrading.bitcoin_withdrawal(amount, address, console.log);
// privateTherocktrading.bitcoin_deposit_address(console.log);
// privateTherocktrading.unconfirmed_btc(console.log);
// privateTherocktrading.ripple_withdrawal(amount, address, currency);
// privateTherocktrading.ripple_address(console.log);
// privateTherocktrading.transfer_to_main(amount, currency, subAccount, console.log);
// privateTherocktrading.transfer_from_main(amount, currency, subAccount, console.log);
