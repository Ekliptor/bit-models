import * as utils from "@ekliptor/apputils";
const nconf = utils.nconf
    , logger = utils.logger
import {DatabaseObject} from "./base/DatabaseObject";
import {AssetAction} from "./base/AssetAction";
import {CurrencyPair, Exchange} from "./base/Currency";

export const COLLECTION_NAME = 'tradeHistory'

/**
 * Represents a complete range of imported trades.
 */
export class TradeHistory extends DatabaseObject {
    public currencyPair: CurrencyPair;
    public exchange: Exchange;
    public start: Date;
    public end: Date;

    constructor(currencyPair: CurrencyPair, exchange: Exchange, start: Date, end: Date) {
        super();
        this.currencyPair = currencyPair;
        this.exchange = exchange;
        this.start = start;
        this.end = end;
        if (this.start.getTime() > this.end.getTime())
            throw new Error("Trade history start has to be strictly lower than end")
    }
}

export function init(trade): TradeHistory {
    trade = Object.assign(new TradeHistory(trade.currencyPair, trade.exchange, trade.start, trade.end), trade)
    return trade
}

export function initMany(trades: any[]): TradeHistory[] {
    for (let i = 0; i < trades.length; i++)
        trades[i] = init(trades[i])
    return trades
}

export function addToHistory(db, history: TradeHistory, cb?) {
    let collection = db.collection(COLLECTION_NAME)
    let pairNr = history.currencyPair.toNr();
    let insertHistory = Object.assign({}, history);
    insertHistory.currencyPair = pairNr;
    collection.find({
        exchange: history.exchange,
        currencyPair: pairNr
    }).toArray().then((existingHistory) => {
        // we have to check if our imported range overlaps with an existing range
        // if yes merge it, otherwise create a new range
        existingHistory = initMany(existingHistory);
        let deleteIds = []
        existingHistory.forEach((curHistory: TradeHistory) => {
            if (!utils.date.overlaps(insertHistory, curHistory, true))
                return;
            // merge the range by taking the min and max
            let remove = false;
            if (insertHistory.start.getTime() >= curHistory.start.getTime()) {
                insertHistory.start = curHistory.start;
                remove = true;
            }
            if (insertHistory.end.getTime() <= curHistory.end.getTime()) {
                insertHistory.end = curHistory.end;
                remove = true;
            }
            if (remove === true) // should always be true if history overlaps
                deleteIds.push(curHistory._id);
        })

        collection.deleteMany({_id: {$in: deleteIds}}, (err, result) => {
            if (err) {
                logger.error("Error deleting overlapping ids", err);
                return cb && cb(err);
            }
            collection.insertOne(insertHistory, (err, result) => {
                if (err) {
                    logger.error("Error inserting trade history", err);
                    return cb && cb(err)
                }
                cb && cb()
            })
        })
    })
}

export function isAvailable(db, history: TradeHistory) {
    return new Promise<boolean>((resolve, reject) => {
        let collection = db.collection(COLLECTION_NAME)
        let pairNr = history.currencyPair.toNr();
        collection.findOne({ // should only be 1 since overlapping ranges are merged
            exchange: history.exchange,
            currencyPair: pairNr,
            start: {$lte: history.start},
            end: {$gte: history.end}
        }).then((existingHistory) => {
            if (existingHistory)
                resolve(true)
            else
                resolve(false)
        })
    })
}

export function getAvailablePeriods(db, exchange: Exchange, currencyPair: CurrencyPair) {
    return new Promise<TradeHistory[]>((resolve, reject) => {
        let collection = db.collection(COLLECTION_NAME)
        let pairNr = currencyPair.toNr();
        collection.find({
            exchange: exchange,
            currencyPair: pairNr
        }).toArray().then((histories) => {
            histories = initMany(histories);
            resolve(histories)
        })
    })
}

export function getInitFunctions(db) {
    return [
        (callback) => {
            db.createCollection(COLLECTION_NAME, callback);
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