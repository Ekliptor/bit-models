import {DatabaseObject} from "./DatabaseObject";
import {Currency, Exchange, CurrencyPair} from "./Currency";
import {TradeType} from "../Trade";
import * as crypto from "crypto";

export class AssetAction extends DatabaseObject {
    // on which market we are trading on is implicitly defined by the "from" currency
    //public from: Currency;
    //public to: Currency;
    public currencyPair: CurrencyPair;
    public exchange: Exchange;
    public date: Date;
    public uniqueID: string;

    public amount: number; // amount in the specific coin (e.g. 100 ETH)
    public rate: number; // price
    public type: TradeType;

    constructor() {
        super()
    }

    protected init(tradeID: string | number = "") {
        const uniqueKey = this.exchange.toString() + this.currencyPair + this.amount + this.rate + this.type + tradeID;
        this.uniqueID = crypto.createHash('sha512').update(uniqueKey, 'utf8').digest('base64')
    }
}