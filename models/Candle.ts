import * as utils from "@ekliptor/apputils";
import {DatabaseObject} from "./base/DatabaseObject";
import {CurrencyPair, Exchange} from "./base/Currency";
import {Trade} from "./Trade";

export const COLLECTION_NAME = 'candles'

export type TrendDirection = "up" | "down" | "none";

export class Candle extends /*AssetAction*/DatabaseObject {
    public start: Date;
    public interval = 1; // in minutes
    public currencyPair: CurrencyPair;
    public exchange: Exchange = Exchange.ALL; // if we accumulate market streams we assume this candle to be from "all"

    //public uniqueID: string; // we don't store our candles yet. and even if we do, we can easily re-create them every x minutes?

    public open: number = 0;
    public high: number = 0;
    public low: number = 0;
    public close: number = 0;
    public vwp: number = 0; // VWAP, weightedAverage https://en.wikipedia.org/wiki/Volume-weighted_average_price
    public volume: number = 0; // base volume
    public upVolume: number = 0;
    public downVolume: number = 0;
    //public quoteVolume: number = 0;
    public trades: number = 0;

    // all trades in this candle. not stored in DB, but useful for strategies
    public tradeData?: Trade[];
    public trend?: TrendDirection;

    constructor(currencyPair: CurrencyPair) {
        super()
        this.currencyPair = currencyPair;
    }

    public init() {
        //const uniqueKey = this.exchange.toString() + this.currencyPair + this.start.toUTCString() + this.interval + this.close + this.volume;
        //this.uniqueID = crypto.createHash('sha512').update(uniqueKey, 'utf8').digest('base64')
    }

    public getVolumeBtc() {
        return this.volume * this.close;
    }

    public getPercentChange() {
        return ((this.close - this.open) / this.open) * 100; // ((y2 - y1) / y1)*100 - positive % if price is rising
    }

    public getAveragePrice() {
        return (this.low + this.high) / 2.0;
    }

    public toString() {
        return utils.sprintf("start %s, open %s, close %s", utils.date.toDateTimeStr(this.start, true, true),
            this.open.toFixed(8), this.close.toFixed(8));
    }
    
    public equals(o: any) {
        if ((o instanceof Candle) === false)
            return false;
        return this.start.getTime() === o.start.getTime() && this.interval === o.interval && this.open === o.open && this.currencyPair.equals(o.currencyPair);
    }

    public static copy(candles: Candle[], withTrades = false) {
        let copy: Candle[] = [];
        candles.forEach((candle) => {
            let pair = new CurrencyPair(candle.currencyPair.from, candle.currencyPair.to)
            let curCopy = Object.assign(new Candle(pair), candle);
            curCopy.currencyPair = pair;
            if (curCopy.upVolume === undefined) // to be compatible with reading old state files
                curCopy.upVolume = 0.0;
            if (curCopy.downVolume === undefined)
                curCopy.downVolume = 0.0;
            if (!withTrades)
                delete curCopy.tradeData;
            copy.push(curCopy)
        })
        return copy;
    }

    public static toBarArray(candles: Candle[]): number[][] {
        /** // same order as elements in TradingView library. used to save network overhead
         * export interface Bar {
            time: number;
            open: number;
            high: number;
            low: number;
            close: number;
            volume?: number;
        }
         */
        let bars: number[][] = [];
        candles.forEach((candle) => {
            bars.push([candle.start.getTime(), candle.open, candle.high, candle.low, candle.close, candle.volume])
        });
        return bars;
    }
}

export function init(candle): Candle {
    candle = Object.assign(new Candle(candle.currencyPair), candle)
    return candle
}

export function initMany(candles: any[]): Candle[] {
    for (let i = 0; i < candles.length; i++)
        candles[i] = init(candles[i])
    return candles
}

export function getInitFunctions(db) {
    return [
        (callback) => {
            db.createCollection(COLLECTION_NAME, callback);
        },
        /*
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                uniqueID: 1 // asc
            }, {
                name: COLLECTION_NAME + 'UniqueIdIndex',
                unique: true
            }, callback);
        },
        */
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                start: 1 // asc
            }, {
                name: COLLECTION_NAME + 'StartIndex'
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
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                close: 1 // asc
            }, {
                name: COLLECTION_NAME + 'CloseIndex'
            }, callback);
        }
    ];
}