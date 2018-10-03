import * as utils from "@ekliptor/apputils";
import {DatabaseObject} from "./base/DatabaseObject";
import {CurrencyPair, Currency, Exchange} from "./base/Currency";
import {ReadPreference} from "mongodb";

export const COLLECTION_NAME = 'coinMarketInfos'

export class CoinMarketInfoMap extends Map<string, CoinMarketInfo[]> { // (currency string, currency data)
    constructor() {
        super()
    }
    public ensureSameLength() {
        let max = 0;
        for (let coin of this)
        {
            if (coin[1].length > max)
                max = coin[1].length;
        }
        for (let coin of this)
        {
            let infos = coin[1];
            if (infos.length === 0)
                continue; // we have no data on this coin yet
            let emptyInfo = new CoinMarketInfo(Currency[coin[0]]);
            let firstDate = utils.date.dateFromUtc(infos[0].year, infos[0].month, infos[0].day, infos[0].hour);
            while (infos.length < max) // add a copy of the first row ahead of the array until it has the same length
            {
                emptyInfo = Object.assign(new CoinMarketInfo(emptyInfo.currency), emptyInfo); // copy it
                firstDate.setTime(firstDate.getTime() - 1*3600000); // go back 1h
                emptyInfo.added = firstDate; // not real, but less than the previous so that sorting works as expected
                emptyInfo.year = firstDate.getUTCFullYear();
                emptyInfo.month = firstDate.getUTCMonth();
                emptyInfo.day = firstDate.getUTCDate();
                emptyInfo.hour = firstDate.getUTCHours();
                infos.unshift(emptyInfo)
            }
        }
    }
}

export class CoinMarketInfo extends DatabaseObject {
    /**
     * based on coinmarketcap API json:
     * {
        id: "zcoin",
        name: "ZCoin",
        symbol: "XZC",
        rank: "101",
        price_usd: "97.0103",
        price_btc: "0.00670179",
        24h_volume_usd: "10612000.0",
        market_cap_usd: "373691794.0",
        available_supply: "3852084.0",
        total_supply: "3852084.0",
        max_supply: null,
        percent_change_1h: "-0.3",
        percent_change_24h: "-5.63",
        percent_change_7d: "-21.43",
        last_updated: "1515616748" // unix timestamp, *1000 to use as Date
        }
     */

    public currency: Currency;
    public priceUSD: number = 0;
    public priceBTC: number = 0;
    public volume24hUSD: number = 0;
    public marketCapUSD: number = 0;
    public availableSupply: number = 0;
    public totalSupply: number = 0;
    public maxSupply: number = 0; // 0 = unlimited supply
    public percentChange1h: number = 0.0;
    public percentChange24h: number = 0.0;
    public percentChange7d: number = 0.0;
    public lastUpdated: Date = null; // the time when the 3rd party service last updated data on this coin (not the time we crawled it)
    public added: Date; // the date we added it to our DB. used for fetching & easier queries

    // we only keep 1 entry per hour (overwrite them). used as UTC date values
    public year: number;
    public month: number;
    public day: number;
    public hour: number;

    constructor(currency: Currency) {
        super()
        this.currency = currency;
        this.added = new Date(); // can get overwritten in init() with value from DB
        this.initDate();
    }

    protected initDate() {
        this.year = this.added.getUTCFullYear();
        this.month = this.added.getUTCMonth();
        this.day = this.added.getUTCDate();
        this.hour = this.added.getUTCHours();
    }
}

export function init(info): CoinMarketInfo {
    info = Object.assign(new CoinMarketInfo(info.currency), info)
    return info
}

export function initMany(infos: any[]): CoinMarketInfo[] {
    for (let i = 0; i < infos.length; i++)
        infos[i] = init(infos[i])
    return infos
}

export function insert(db, infos: CoinMarketInfo[]) {
    return new Promise<void>((resolve, reject) => {
        let collection = db.collection(COLLECTION_NAME)
        let insertOps = []
        infos.forEach((info) => {
            insertOps.push(new Promise((resolve, reject) => {
                collection.updateOne({
                    currency: info.currency,
                    year: info.year,
                    month: info.month,
                    day: info.day,
                    hour: info.hour
                }, info, {
                    upsert: true
                }, (err, result) => {
                    if (err)
                        return reject({txt: 'Error storing coin market info', err: err, result: result})
                    resolve()
                })
            }))
        })
        Promise.all(insertOps).then(() => {
            resolve()
        }).catch((err) => {
            reject({txt: "Error during coin market info insert", err: err})
        })
    })
}

export function getLatestData(db, maxAge: Date) {
    return new Promise<CoinMarketInfoMap>((resolve, reject) => {
        let collection = db.collection(COLLECTION_NAME)
        collection.find({
            added: {$gt: maxAge}
        }).sort({added: 1}).setReadPreference(ReadPreference.SECONDARY_PREFERRED).toArray().then((docs) => {
            let ungroupedData = initMany(docs);
            let coinInfoMap = new CoinMarketInfoMap(); // TODO define currency order in map by initializing it with empty arrays for every currency
            let lastInfoMap = new Map<string, CoinMarketInfo>();
            ungroupedData.forEach((info) => {
                const currencyStr = Currency[info.currency];
                let coinData = coinInfoMap.get(currencyStr);
                if (!coinData)
                    coinData = [];
                else {
                    // ensure we have 1 entry per hour. if there is a gap place the last entry repeatedly
                    let previous = coinData[coinData.length-1];
                    let previousDate = utils.date.dateFromUtc(previous.year, previous.month, previous.day, previous.hour);
                    const nextDate = utils.date.dateFromUtc(info.year, info.month, info.day, info.hour);
                    //while (previous.added.getTime() - info.added.getTime() > 1*60*60*1000)
                    while (nextDate.getTime() - previousDate.getTime() > 1*60*60*1000)
                    {
                        previous = Object.assign(new CoinMarketInfo(previous.currency), previous); // copy it
                        previousDate.setTime(previousDate.getTime() + 1*3600000); // add 1h
                        previous.year = previousDate.getUTCFullYear();
                        previous.month = previousDate.getUTCMonth();
                        previous.day = previousDate.getUTCDate();
                        previous.hour = previousDate.getUTCHours();
                        //previous.added.setTime(previous.added.getTime() + 1*3600000); // keep added at the same value
                        coinData.push(previous)
                    }
                }
                coinData.push(info) // we get the data sorted by date ascending from mongoDB
                coinInfoMap.set(currencyStr, coinData)
                lastInfoMap.set(currencyStr, info);
            })
            coinInfoMap.ensureSameLength(); // if we started crawling later for some coins, we have to fill the beginning with 0 value entries
            resolve(coinInfoMap)
        }).catch((err) => {
            reject({txt: "Error getting recent coin market infos", err: err})
        })
    })
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
                currency: 1 // asc
            }, {
                name: COLLECTION_NAME + 'CurrencyIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                volume24hUSD: 1 // asc
            }, {
                name: COLLECTION_NAME + 'Volume24hUSDIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                percentChange24h: 1 // asc
            }, {
                name: COLLECTION_NAME + 'PercentChange24hIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                percentChange7d: 1 // asc
            }, {
                name: COLLECTION_NAME + 'PercentChange7dIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                // all asc
                year: 1,
                month: 1,
                day: 1,
                hour: 1
            }, {
                name: COLLECTION_NAME + 'DateCompound'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                added: 1 // asc
            }, {
                name: COLLECTION_NAME + 'AddedIndex'
            }, callback);
        },
    ];
}