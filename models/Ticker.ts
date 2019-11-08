import * as utils from "@ekliptor/apputils";
const nconf = utils.nconf
    , logger = utils.logger;
import {DatabaseObject} from "./base/DatabaseObject";
import {Currency, Exchange, CurrencyPair, ExchangeCurrencies} from "./base/Currency";
import * as crypto from "crypto";

export const COLLECTION_NAME = 'tickers'
export const COLLECTION_NAME_EXTERNAL = 'tickersExternal'

export abstract class AbstractTickerMap<T> extends Map<string, T> {
    protected created = new Date();

    constructor() {
        super()
    }

    public setCreated(date: Date) {
        this.created = date;
    }

    public getCreated() {
        return this.created;
    }
}

export class TickerMap extends AbstractTickerMap<Ticker> { // (currency pair, ticker) 1 map per exchange
    constructor() {
        super()
    }

    public static fromJson(json, currencies: ExchangeCurrencies, exchange: Exchange): TickerMap {
        let ticker = new TickerMap();
        for (let prop in json)
        {
            let pair = currencies.getLocalPair(prop);
            if (pair === undefined)
                continue;
            let coin = Ticker.fromJson(json[prop], exchange);
            ticker.set(pair.toString(), coin);
        }
        return ticker;
    }
}

export class ExternalTickerMap extends AbstractTickerMap<ExternalTicker> {
    constructor() {
        super()
    }

    public static fromJson(json, currencies: ExchangeCurrencies, exchange: Exchange): ExternalTickerMap {
        let ticker = new ExternalTickerMap();
        for (let prop in json)
        {
            let pair = prop;
            let coin = ExternalTicker.fromJson(json[prop], exchange);
            ticker.set(pair.toString(), coin);
        }
        return ticker;
    }
}

export abstract class AbstractTicker extends DatabaseObject {
    public created = new Date();
    public exchange: Exchange;

    public last: number = 0;
    public lowestAsk: number = 0;
    public highestBid: number = 0;
    public percentChange: number = 0;
    public baseVolume: number = 0; // in BTC
    public quoteVolume: number = 0; // in coin
    public isFrozen: boolean = false;
    public high24hr: number = 0; // 24hrHigh
    public low24hr: number = 0; // 24hrLow

    // for index based exchanges (such as futures)
    public indexValue?: number;

    // for future contracts
    public turnover?: number;
    public openInterest?: number;
    public openValue?: number;

    // for perpetual future contracts
    public fundingIntervalH?: number;
    public fundingRate?: number; // per interval

    constructor(exchange: Exchange) {
        super()
        this.exchange = exchange;
    }

    public addIndexValues(indexTicker: Ticker) {
        this.indexValue = indexTicker.indexValue;
    }
}

export class Ticker extends AbstractTicker {
    public currencyPair: CurrencyPair; // stored as object (not array)


    constructor(exchange: Exchange) {
        super(exchange)
    }

    public static fromJson(json, exchange: Exchange): Ticker {
        // some exchanges (poloniex) return all numbers as strings
        let coin = new Ticker(exchange);
        for (let prop in json)
        {
            if (coin[prop] === undefined)
                continue; // we don't support this property

            if (prop === "isFrozen")
                coin.isFrozen = json[prop] ? true : false;
            else
                coin[prop] = this.parseNumber(json[prop])
        }
        return coin;
    }

    public static parseNumber(nr: any) {
        let nrVal = parseFloat(nr)
        if (nrVal === Number.NaN)
            return 0;
        return nrVal;
    }
}

export class ExternalTicker extends AbstractTicker {
    public currencyPair: string; // BTC_LTC or BTC-LTC. unmodified value from the exchange

    constructor(exchange: Exchange) {
        super(exchange)
    }

    public static fromJson(json, exchange: Exchange): ExternalTicker {
        // some exchanges (poloniex) return all numbers as strings
        let coin = new ExternalTicker(exchange);
        for (let prop in json)
        {
            if (coin[prop] === undefined)
                continue; // we don't support this property

            if (prop === "isFrozen")
                coin.isFrozen = json[prop] ? true : false;
            else
                coin[prop] = this.parseNumber(json[prop])
        }
        return coin;
    }

    public static parseNumber(nr: any) {
        let nrVal = parseFloat(nr)
        if (nrVal === Number.NaN)
            return 0;
        return nrVal;
    }
}

export function init(doc): Ticker {
    return Object.assign(new Ticker(doc.exchange), doc)
}

export function initMany(docs: any[]): Ticker[] {
    for (let i = 0; i < docs.length; i++)
        docs[i] = init(docs[i])
    return docs
}

export function initExternal(doc): ExternalTicker {
    return Object.assign(new ExternalTicker(doc.exchange), doc)
}

export function initManyExternal(docs: any[]): ExternalTicker[] {
    for (let i = 0; i < docs.length; i++)
        docs[i] = initExternal(docs[i])
    return docs
}

/**
 * Get the latest limit tickers. Generally tickers are stored once per hour.
 * @param db
 * @param exchange
 * @param currencyPair
 * @param end
 * @param limit
 * @param offset
 */
export async function getTickers(db, exchange: Exchange, currencyPair: CurrencyPair, end: Date, limit: number = 24, offset: number = 0): Promise<Ticker[]> {
    let collection = db.collection(COLLECTION_NAME)
    try {
        let result = await collection.find({
            exchange: exchange,
            currencyPair: {
                from: currencyPair.from,
                to: currencyPair.to
            },
            created: {$lte: end}
        }).sort({created: -1}).skip(offset).limit(limit).toArray();
        if (result)
            return initMany(result);
    }
    catch (err) {
        logger.error("Error getting exchange tickers", err);
    }
    return [];
}

export function getInitFunctions(db) {
    let functions = [];
    [COLLECTION_NAME, COLLECTION_NAME_EXTERNAL].forEach((collectionName) => {
        functions.push((callback) => {
                db.createCollection(collectionName, callback);
            },
            (callback) => {
                db.createIndex(collectionName, {
                    created: 1 // asc
                }, {
                    name: collectionName + 'CreatedIndex'
                }, callback);
            },
            (callback) => {
                db.createIndex(collectionName, {
                    exchange: 1 // asc
                }, {
                    name: collectionName + 'ExchangeIndex'
                }, callback);
            },
            (callback) => {
                db.createIndex(collectionName, {
                    currencyPair: 1 // asc
                }, {
                    name: collectionName + 'CurrencyPairIndex'
                }, callback);
            })
    });
    return functions;
}
