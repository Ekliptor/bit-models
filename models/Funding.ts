import {DatabaseObject} from "./base/DatabaseObject";
import {Currency, Exchange} from "./base/Currency";
import * as crypto from "crypto";

// objects in here use only 1 currency instead of a currency pair, so we don't implement them as subclasses of AssetAction

export const NUMBER_ATTRIBUTES = ["amount", "rate", "days"/* "total",*/]

export enum FundingType {
    OFFER = 1, // = SELL
    REQUEST = 2 // = BUY
}

export abstract class FundingAction extends DatabaseObject {
    public ID: string | number; // the id from the exchange. might not be set for public orders. mandatory for own trades/orders
    public currency: Currency;
    public exchange: Exchange;
    public date: Date;
    public uniqueID: string;

    public amount: number; // amount in the specific coin (e.g. 100 ETH)
    public rate: number; // price
    public type: FundingType;
    public days: number; // the number of days of the loan
    //public autoRenew: boolean = false; // only applicable to own loans - here we don't distinguish

    constructor() {
        super()
    }

    public static verify(action: FundingAction, currency: Currency, exchange: Exchange) {
        if (!action.type)
            action.type = action.amount < 0 ? FundingType.OFFER : FundingType.REQUEST;
        action.amount = Math.abs(action.amount);
        if (!action.days)
            action.days = 0;

        action.currency = currency;
        action.exchange = exchange;
        //trade.fee = fee; // TODO there actually are fees, although user taking the loan pays them
        //if (!trade.total)
            //trade.total = trade.amount * trade.rate;
        NUMBER_ATTRIBUTES.forEach((attr) => {
            action[attr] = parseFloat(action[attr]);
            if (action[attr] === Number.NaN)
                action[attr] = 0;
        })
        action.init();
        return action;
    }

    protected init(tradeID: string | number = "") {
        const uniqueKey = this.exchange.toString() + this.currency + this.amount + this.rate + this.type + tradeID;
        this.uniqueID = crypto.createHash('sha512').update(uniqueKey, 'utf8').digest('base64')
    }
}

export class FundingTrade extends FundingAction {
    constructor() {
        super()
    }
}

export class FundingOrder extends FundingAction {
    public marked: boolean = false; // marked for removal. used in OrderBook class to delete outdated entries

    constructor() {
        super()
    }
}