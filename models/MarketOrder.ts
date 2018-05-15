import {AssetAction} from "./base/AssetAction";
import {TradeType, MarginPositionType} from "./Trade";
import {CurrencyPair, Exchange} from "./base/Currency";

export const COLLECTION_NAME = 'orders'
export const NUMBER_ATTRIBUTES = ["amount", "rate"];

/**
 * A class representing an open market order.
 * For orders that have been submitted by our bot see Order class.
 */
export class MarketOrder extends AssetAction {
    //public orderNumber: number;
    // we can't get this for history on poloniex. only the order book up to a specified depth (number of asks/bids)
    // maybe we will use it later for live trading?
    //public date: Date;
    //public depth: number;

    public marked: boolean = false; // marked for removal. used in OrderBook class to delete outdated entries

    constructor() {
        super()
    }

    public static getOrder(currencyPair: CurrencyPair, exchange: Exchange, amount: number | string, rate: number | string/*, marketRate: number*/) {
        let order = new MarketOrder();
        //order.orderID = orderID;
        order.currencyPair = currencyPair;
        order.exchange = exchange;
        if (typeof amount === "string")
            order.amount = parseFloat(amount);
        else
            order.amount = amount;
        if (typeof rate === "string")
            order.rate = parseFloat(rate);
        else
            order.rate = rate;
        // sanity checks
        if (order.amount < 0)
            order.amount *= -1;
        if (order.rate < 0)
            order.rate *= -1;
        //order.type = order.rate <= marketRate ? TradeType.BUY : TradeType.SELL; // if marketRate == order.rate it could be both
        order.type = TradeType.PENDING;
        order.date = new Date(); // orders are submitted in live mode
        /*
        NUMBER_ATTRIBUTES.forEach((attr) => {
            order[attr] = parseFloat(order[attr]);
            if (order[attr] === Number.NaN)
                order[attr] = 0;
        })
        */
        // most exchanges don't give order IDs, so we can't create global uniqueIDs neither. Live filtering is done by sequence number
        //order.init(orderID);
        return order;
    }
}

export function init(order): MarketOrder {
    order = Object.assign(new MarketOrder(), order)
    return order
}

export function initMany(orders: any[]): MarketOrder[] {
    for (let i = 0; i < orders.length; i++)
        orders[i] = init(orders[i])
    return orders
}