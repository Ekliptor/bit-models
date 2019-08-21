import * as utils from "@ekliptor/apputils";
const nconf = utils.nconf
    , logger = utils.logger;
import {CurrencyPair, Exchange} from "./base/Currency";


//export const COLLECTION_NAME = 'fundingRates' // not stored

export class FundingRate {
    public fundingIntervalH: number = 8;
    public fundingRate: number = 0; // per interval
    public currencyPair: CurrencyPair;
    public date: Date;

    constructor(fundingRate: number, currencyPair: CurrencyPair) {
        this.fundingRate = fundingRate;
        this.currencyPair = currencyPair;
        this.date = new Date();
    }
}
