import {AssetAction} from "./base/AssetAction";
import {TradeType, MarginPositionType} from "./Trade";
import {CurrencyPair, Exchange} from "./base/Currency";

export const COLLECTION_NAME = 'orders'

/**
 * A class representing orders that have been submitted by our bot.
 * For open market orders see MarketOrder.
 */
export class Order extends AssetAction {
    //public orderNumber: number;
    // we can't get this for history on poloniex. only the order book up to a specified depth (number of asks/bids)
    // maybe we will use it later for live trading?
    //public date: Date;
    //public depth: number;
    public orderID: string;
    public marginOrder = false;
    public leverage: number = 0; // for margin orders
    public marginPosition: MarginPositionType = ""; // for open long/short positions
    public closePosition: MarginPositionType = ""; // indicates if this position got closed with a buy or a sell

    constructor() {
        super()
    }

    public static getOrder(currencyPair: CurrencyPair, exchange: Exchange, amount: number, rate: number, type: TradeType, orderID = "", marginOrder = false) {
        let order = new Order();
        order.orderID = orderID;
        order.currencyPair = currencyPair;
        order.exchange = exchange;
        order.amount = amount;

        // see getRate():
        // -1: limit order at the last price
        // -2: market order (if supported by exchange), otherwise identical to -1
        order.rate = rate; // rate can be 0 if we close a margin position
        if (order.rate < -2 || /*order.rate === Number.MAX_VALUE*/ order.rate > 5000000000000)
            throw new Error("Order has invalid rate: " + order.rate);

        order.type = type;
        order.marginOrder = marginOrder;
        order.date = new Date(); // orders are submitted in live mode
        order.init(orderID);
        return order;
    }
}

export function init(order): Order {
    order = Object.assign(new Order(), order)
    return order
}

export function initMany(orders: any[]): Order[] {
    for (let i = 0; i < orders.length; i++)
        orders[i] = init(orders[i])
    return orders
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
                date: 1 // asc // field not yet present
            }, {
                name: COLLECTION_NAME + 'DateIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                amount: 1 // asc
            }, {
                name: COLLECTION_NAME + 'AmountIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                rate: 1 // asc
            }, {
                name: COLLECTION_NAME + 'RateIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                type: 1 // asc
            }, {
                name: COLLECTION_NAME + 'TypeIndex'
            }, callback);
        }
    ];
}
