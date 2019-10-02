const crypto = require('crypto');
const nonce = require('nonce');

const querystring = require('querystring');
const https = require('https');

const version = require('./package.json').version;
const name = require('./package.json').name;

const USER_AGENT = `${name}@${version}`;

const joinCurrencies = (currencyA, currencyB) => {
  // If only one arg, then return the first
  if (typeof currencyB !== 'string') {
    return currencyA;
  }

  return currencyA + '_' + currencyB;
}

class Poloniex {
  constructor(config) {
    this.ua = USER_AGENT;
    this.timeout = 60 * 1000;
    this.noncer = nonce();

    if(!config) {
      return;
    }

    if(config.key && config.secret) {
      this.key = config.key;
      this.secret = config.secret;
    }

    if(config.timeout) {
      this.timeout = config.timeout;
    }

    if(config.userAgent) {
      this.ua += ' | ' + config.userAgent;
    }
  }

  _getPrivateHeaders(parameters) {
    var paramString, signature;

    if (!this.key || !this.secret) {
      throw new Error('Poloniex: Error. API key and secret required');
    }

    paramString = querystring.stringify(parameters);

    signature = crypto.createHmac('sha512', this.secret).update(paramString).digest('hex');

    return {
      Key: this.key,
      Sign: signature
    };
  }

  _request({url, qs, method, data, headers = {}}, callback) {

    const path = url + '?' + querystring.stringify(qs);

    const options = {
      host: 'poloniex.com',
      path,
      method,
      headers: {
        'User-Agent': this.ua,
        ...headers
      }
    };

    const rawData = querystring.stringify(data);

    if(method === 'POST') {
      options.headers['Content-Length'] = rawData.length;
      options.headers['content-type'] = 'application/x-www-form-urlencoded';
    }

    const req = https.request(options, res => {
      res.setEncoding('utf8');
      let buffer = '';
      res.on('data', function(data) {
        buffer += data;
      });
      res.on('end', function() {
        if (res.statusCode !== 200) {
          let message;

          try {
            message = JSON.parse(buffer);
          } catch(e) {
            message = {
              error: buffer
            }
          }

          return callback(new Error(`[Poloniex] ${res.statusCode} ${message.error}`));
        }

        let json;
        try {
          json = JSON.parse(buffer);
        } catch (err) {
          return callback(err);
        }
        callback(null, json);
      });
    });

    req.on('error', err => {
      callback(err);
    });

    req.on('socket', socket => {
      socket.setTimeout(this.timeout);
      socket.on('timeout', function() {
        req.abort();
      });
    });

    req.end(rawData);
  }

  // Make a public API request
  _public(command, parameters, callback) {
    if (typeof parameters === 'function') {
      callback = parameters;
      parameters = {};
    }

    if(!parameters) {
      parameters = {};
    }

    parameters.command = command;

    return this._request({
      url: '/public',
      qs: parameters,
      command,
      method: 'GET'
    }, callback);
  }


  // Make a private API request
  _private(command, parameters, callback) {
    var options;

    if (typeof parameters === 'function') {
      callback = parameters;
      parameters = {};
    }

    parameters.command = command;
    parameters.nonce = this.noncer();

    return this._request({
      method: 'POST',
      url: '/tradingApi',
      headers: this._getPrivateHeaders(parameters),
      data: parameters
    }, callback);
  }

  returnTicker(callback) {
    return this._public('returnTicker', callback);
  }

  return24hVolume(callback) {
    return this._public('return24hVolume', callback);
  }

  returnOrderBook(currencyA, currencyB, callback) {
    var currencyPair;

    if (typeof currencyB === 'function') {
      currencyPair = currencyA;
      callback = currencyB;
      currencyB = null;
    }

    else {
      currencyPair = joinCurrencies(currencyA, currencyB);
    }

    var parameters = {
      currencyPair: currencyPair
    };

    return this._public('returnOrderBook', parameters, callback);
  }

  returnChartData(currencyA, currencyB, period, start, end, callback) {
    var parameters = {
      currencyPair: joinCurrencies(currencyA, currencyB),
      period: period,
      start: start,
      end: end
    };

    return this._public('returnChartData', parameters, callback);
  }

  returnCurrencies(callback) {
    return this._public('returnCurrencies', callback);
  }

  returnLoanOrders(currency, callback) {
    return this._public('returnLoanOrders', {currency: currency}, callback);
  }

  /////
  // PRIVATE METHODS

  returnBalances(callback) {
    return this._private('returnBalances', {}, callback);
  }

  returnCompleteBalances(account, callback) {
    var parameters = {};

    if (typeof account === 'function') {
      callback = account;
    }

    else if (typeof account === 'string' && !!account) {
      parameters.account = account;
    }
    
    return this._private('returnCompleteBalances', parameters, callback);
  }

  returnDepositAddresses(callback) {
    return this._private('returnDepositAddresses', {}, callback);
  }

  generateNewAddress(currency, callback) {
    return this._private('generateNewAddress', {currency: currency}, callback);
  }

  returnDepositsWithdrawals(start, end, callback) {
    return this._private('returnDepositsWithdrawals', {start: start, end: end}, callback);
  }

  // can be called with `returnOpenOrders('all', callback)`
  returnOpenOrders(currencyA, currencyB, callback) {
    var currencyPair;

    if (typeof currencyB === 'function') {
      currencyPair = currencyA;
      callback = currencyB;
      currencyB = null;
    }

    else {
      currencyPair = joinCurrencies(currencyA, currencyB);
    }

    var parameters = {
      currencyPair: currencyPair
    };

    return this._private('returnOpenOrders', parameters, callback);
  }

  returnTradeHistory(currencyA, currencyB, start, end, callback) {
    if(arguments.length < 5){
      callback = start;
      start = Date.now() / 1000 - 60 * 60;
      end = Date.now() / 1000 + 60 * 60; // Some buffer in case of client/server time out of sync.
    }

    var parameters = {
      currencyPair: joinCurrencies(currencyA, currencyB),
      start: start,
      end: end
    };

    return this._private('returnTradeHistory', parameters, callback);
  }

  returnOrderTrades(orderNumber, callback) {
    var parameters = {
      orderNumber: orderNumber
    };

    return this._private('returnOrderTrades', parameters, callback);
  }

  buy(currencyA, currencyB, rate, amount, callback) {
    var parameters = {
      currencyPair: joinCurrencies(currencyA, currencyB),
      rate: rate,
      amount: amount
    };

    return this._private('buy', parameters, callback);
  }

  sell(currencyA, currencyB, rate, amount, callback) {
    var parameters = {
      currencyPair: joinCurrencies(currencyA, currencyB),
      rate: rate,
      amount: amount
    };

    return this._private('sell', parameters, callback);
  }

  cancelOrder(currencyA, currencyB, orderNumber, callback) {
    var parameters = {
      currencyPair: joinCurrencies(currencyA, currencyB),
      orderNumber: orderNumber
    };

    return this._private('cancelOrder', parameters, callback);
  }

  moveOrder(orderNumber, rate, amount, callback) {
    var parameters = {
      orderNumber: orderNumber,
      rate: rate,
      amount: amount ? amount : null
    };

    return this._private('moveOrder', parameters, callback);
  }

  withdraw(currency, amount, address, callback) {
    var parameters = {
      currency: currency,
      amount: amount,
      address: address
    };

    return this._private('withdraw', parameters, callback);
  }

  returnFeeInfo(callback) {
    return this._private('returnFeeInfo', {}, callback);
  }

  returnAvailableAccountBalances(account, callback) {
    var parameters = {};

    if (typeof account === 'function') {
      callback = account;
    }

    else if (typeof account === 'string' && !!account) {
      parameters.account = account;
    }
    
    return this._private('returnAvailableAccountBalances', parameters, callback);
  }

  returnTradableBalances(callback) {
    return this._private('returnTradableBalances', {}, callback);
  }

  transferBalance(currency, amount, fromAccount, toAccount, callback) {
    var parameters = {
      currency: currency,
      amount: amount,
      fromAccount: fromAccount,
      toAccount: toAccount
    };

    return this._private('transferBalance', parameters, callback);
  }

  returnMarginAccountSummary(callback) {
    return this._private('returnMarginAccountSummary', {}, callback);
  }

  marginBuy(currencyA, currencyB, rate, amount, lendingRate, callback) {
    var parameters = {
      currencyPair: joinCurrencies(currencyA, currencyB),
      rate: rate,
      amount: amount,
      lendingRate: lendingRate ? lendingRate : null
    };

    return this._private('marginBuy', parameters, callback);
  }

  marginSell(currencyA, currencyB, rate, amount, lendingRate, callback) {
    var parameters = {
      currencyPair: joinCurrencies(currencyA, currencyB),
      rate: rate,
      amount: amount,
      lendingRate: lendingRate ? lendingRate : null
    };

    return this._private('marginSell', parameters, callback);
  }

  getMarginPosition(currencyA, currencyB, callback) {
    var parameters = {
      currencyPair: joinCurrencies(currencyA, currencyB)
    };

    return this._private('getMarginPosition', parameters, callback);
  }

  closeMarginPosition(currencyA, currencyB, callback) {
    var parameters = {
      currencyPair: joinCurrencies(currencyA, currencyB)
    };

    return this._private('closeMarginPosition', parameters, callback);
  }

  createLoanOffer(currency, amount, duration, autoRenew, lendingRate, callback) {
    var parameters = {
      currency: currency,
      amount: amount,
      duration: duration,
      autoRenew: autoRenew,
      lendingRate: lendingRate
    };

    return this._private('createLoanOffer', parameters, callback);
  }

  cancelLoanOffer(orderNumber, callback) {
    var parameters = {
      orderNumber: orderNumber
    };

    return this._private('cancelLoanOffer', parameters, callback);
  }

  returnOpenLoanOffers(callback) {
    return this._private('returnOpenLoanOffers', {}, callback);
  }

  returnActiveLoans(callback) {
    return this._private('returnActiveLoans', {}, callback);
  }

  returnLendingHistory(start, end, limit, callback) {
    var parameters = {
      start: start,
      end: end,
      limit: limit
    };

    return this._private('returnLendingHistory', parameters, callback);
  }

  toggleAutoRenew(orderNumber, callback) {
    return this._private('toggleAutoRenew', {orderNumber: orderNumber}, callback);
  }

};

// Backwards Compatibility
Poloniex.prototype.getTicker = Poloniex.prototype.returnTicker;
Poloniex.prototype.get24hVolume = Poloniex.prototype.return24hVolume;
Poloniex.prototype.getOrderBook = Poloniex.prototype.returnOrderBook;
Poloniex.prototype.getTradeHistory = Poloniex.prototype.returnChartData;
Poloniex.prototype.myBalances = Poloniex.prototype.returnBalances;
Poloniex.prototype.myOpenOrders = Poloniex.prototype.returnOpenOrders;
Poloniex.prototype.myTradeHistory = Poloniex.prototype.returnTradeHistory;

module.exports = Poloniex;