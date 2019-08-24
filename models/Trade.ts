import * as utils from "@ekliptor/apputils";
import {AssetAction} from "./base/AssetAction";
import {CurrencyPair, Exchange} from "./base/Currency";
import {Candle} from "./Candle";

export const COLLECTION_NAME = 'trades'
export const NUMBER_ATTRIBUTES = ["amount", "rate", "total", "tradeID"]
export const DELETE_ATTRIBUTES = ["globalTradeID", "price", "tid"] // from other exhange imports

/* save a few bytes
export type TradeType =
    "buy"
    | "sell";
*/
export enum TradeType {
    BUY = 1, // for orders: ask
    SELL = 2, // for orders: bid
    CLOSE = 3, // can be buy or sell (depending on if we are long or short) // not present for external trades (trade history and live trades)
    PENDING = 4 // for open market orders
}

export function getTradeTypeName(type: TradeType) {
    switch (type) {
        case TradeType.BUY:
            return "buy";
        case TradeType.SELL:
            return "sell";
        case TradeType.CLOSE:
            return "close";
        case TradeType.PENDING:
            return "pending";
        default:
            utils.test.assertUnreachableCode(type);
    }
}

export type MarginPositionType = "" | "long" | "short";

export interface SimpleTrade {
    rate: number;
    amount: number;
    date: Date;
}

export class TradeAggregateMap extends Map<string, Trade[]> { // (currency pair, trades)
    constructor() {
        super();
    }
    public addTrade(currencyPairStr: string, trade: Trade) {
        let existing = this.get(currencyPairStr);
        if (existing === undefined) {
            existing = [];
            this.set(currencyPairStr, existing);
        }
        existing.push(trade);
    }
}

export class Trade extends AssetAction {
    public tradeID: number;
    //public globalTradeID: number; // available on poloniex, not really needed
    public total: number; // amount*rate in base currency, BTC
    public fee: number; // as decimal fraction (usually paid in BTC), 0.25% == 0.0025

    constructor() {
        super()
    }

    public static verifyNewTrade(trade: Trade, currencyPair: CurrencyPair, exchange: Exchange, fee: number) {
        //if (trade.date.getFullYear() > 3000)
            //trade.date = new Date(json[4]); // from ms
        if (!trade.type)
            trade.type = trade.amount < 0 ? TradeType.SELL : TradeType.BUY;
        trade.amount = Math.abs(trade.amount);

        trade.currencyPair = currencyPair;
        trade.exchange = exchange;
        trade.fee = fee;
        if (!trade.total)
            trade.total = trade.amount * trade.rate;
        NUMBER_ATTRIBUTES.forEach((attr) => {
            trade[attr] = parseFloat(trade[attr]);
            if (trade[attr] === Number.NaN)
                trade[attr] = 0;
        })
        trade.init(trade.tradeID);
        return trade;
    }

    public static fromJson(json, currencyPair: CurrencyPair, exchange: Exchange, fee: number, dateTimezoneSuffix = "") {
        if (Array.isArray(json) === true) {
            let trade = new Trade();
            if (json.length === 6) { // kraken
                // [ '2543.50000', '0.20000000', 1501036984.8807, 's', 'l', '' ]
                trade.rate = json[0];
                trade.amount = json[1];
                trade.date = new Date(json[2] * 1000);
                trade.type = json[3] === "s" ? TradeType.SELL : TradeType.BUY;
                // m/l == market/limit order
                // misc
                trade.tradeID = Math.floor(trade.rate * json[2] / trade.amount); // pseudo ID
            }
            else {
                // new poloniex api (and OKEX)
                // [ '25969600', 0, '0.09718515', '0.53288249', 1496175981 ]
                trade.tradeID = json[0];
                trade.type = json[1] == 1 ? TradeType.BUY : TradeType.SELL;
                trade.rate = json[2];
                trade.amount = json[3];
                trade.date = new Date(json[4] * 1000);
            }
            if (trade.date.getFullYear() > 3000)
                trade.date = new Date(json[4]); // from ms

            trade.currencyPair = currencyPair;
            trade.exchange = exchange;
            trade.fee = fee;
            NUMBER_ATTRIBUTES.forEach((attr) => {
                trade[attr] = parseFloat(trade[attr]);
                if (trade[attr] === Number.NaN)
                    trade[attr] = 0;
            })
            trade.total = trade.amount * trade.rate;
            trade.init(trade.tradeID);
            return trade;
        }

        let trade = Object.assign(new Trade(), json);
        if (typeof trade.date === "string") {
            if (dateTimezoneSuffix)
                trade.date = new Date(trade.date + dateTimezoneSuffix);
            else
                trade.date = new Date(trade.date);
        }
        else if (typeof trade.date === "number") {
            let date = trade.date;
            trade.date = new Date(trade.date * 1000); // from sec
            if (trade.date.getFullYear() > 3000)
                trade.date = new Date(date); // from ms
        }
        if (trade.type === "buy")
            trade.type = TradeType.BUY;
        else if (trade.type === "sell")
            trade.type = TradeType.SELL;
        trade.currencyPair = currencyPair;
        trade.exchange = exchange;
        trade.fee = fee;

        // OKEX
        if (!trade.tradeID && json.tid)
            trade.tradeID = json.tid;
        if (!trade.rate && json.price)
            trade.rate = json.price;
        if (!trade.total)
            trade.total = trade.amount * trade.rate;

        /** from poloniex
         * amount: '0.01285917',
         rate: '0.01730000',
         total: '0.00022246',
         tradeID: '5751976',
         */
        NUMBER_ATTRIBUTES.forEach((attr) => {
            trade[attr] = parseFloat(trade[attr]);
            if (trade[attr] === Number.NaN)
                trade[attr] = 0;
        })
        /* // TODO this doesn't work because all our properties on emptryTrade are unitialized
        let emptyTrade = new Trade();
        for (let prop in trade) // remove unknown properties we copied from this exchange
        {
            if (emptyTrade[prop] === undefined)
                delete trade[prop]
        }
        */
        DELETE_ATTRIBUTES.forEach((attr) => {
            if (trade[attr] !== undefined)
                delete trade[attr]
        })
        trade.init(trade.tradeID);
        return trade;
    }

    public static fromCandle(candle: Candle) {
        let trade = new Trade();
        trade.tradeID = 0;
        trade.fee = 0;

        trade.currencyPair = candle.currencyPair;
        trade.exchange = candle.exchange;
        // we use the candle.close, so use the end of the candle as time
        trade.date = new Date(candle.start.getTime() + candle.interval*60*1000);

        trade.amount = candle.volume;
        //if (trade.amount === 0) // happens with cached empty candles. a trade can't have 0 amount
            //trade.amount = 0.01; // we just don't emit those trades. we don't need a trade every 1min
        trade.rate = candle.close;
        trade.type = candle.trend === "up" ? TradeType.BUY : TradeType.SELL; // TODO good enough?
        trade.total = trade.amount * trade.rate;
        trade.init();
        return trade;
    }
}

export function init(trade): Trade {
    trade = Object.assign(new Trade(), trade)
    return trade
}

export function initMany(trades: any[]): Trade[] {
    for (let i = 0; i < trades.length; i++)
        trades[i] = init(trades[i])
    return trades
}

/**
 * Adds trades to the database for backtesting.
 * Make sure to call TradeHistory.addToHistory() after importing a date-range of trades.
 * @param db
 * @param trades
 * @param cb
 */
export function storeTrades(db, trades: Trade[], cb) {
    if (!trades || trades.length === 0)
        return cb && cb();
    let storeTrades = [];
    for (let i = 0; i < trades.length; i++)
    {
        let trade = Object.assign({}, trades[i]);
        trade.currencyPair = trade.currencyPair.toNr();
        storeTrades.push(trade)
    }
    let collection = db.collection(COLLECTION_NAME)
    // we have to use ordered == false to continue inserting on duplicate key. so we should sort by tradeID when fetching docs
    collection.insertMany(storeTrades, {ordered: false}, (err, result) => {
        if (err) {
            if (err.code !== 11000) // ignore duplicate key errors
                return cb && cb(err);
        }
        cb && cb()
    })
}

export function getInitFunctions(db) {
    return [
        (callback) => {
            db.createCollection(COLLECTION_NAME, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                uniqueID: 1 // asc
            }, {
                name: COLLECTION_NAME + 'UniqueIdIndex',
                unique: true
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                date: 1 // asc
            }, {
                name: COLLECTION_NAME + 'DateIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                currencyPair: 1 // asc
            }, {
                name: COLLECTION_NAME + 'CurrencyPairIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                exchange: 1 // asc
            }, {
                name: COLLECTION_NAME + 'ExchangeIndex'
            }, callback);
        }
    ];
}
