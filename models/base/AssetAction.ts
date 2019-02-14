import * as utils from "@ekliptor/apputils";
import {DatabaseObject} from "./DatabaseObject";
import {CurrencyPair, Exchange} from "./Currency";
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

    public toString() {
        // TODO display TadeType as string (can't be imported from parent file)
        return utils.sprintf("amount %s, rate %s, type %s, date %s", this.amount, this.rate, this.type, utils.test.getPassedTime(this.date.getTime()));
    }

    protected init(tradeID: string | number = "") {
        const uniqueKey = this.exchange.toString() + this.currencyPair + this.amount + this.rate + this.type + tradeID;
        this.uniqueID = crypto.createHash('sha512').update(uniqueKey, 'utf8').digest('base64')
    }
}