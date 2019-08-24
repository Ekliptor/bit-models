import * as utils from "@ekliptor/apputils";
const nconf = utils.nconf
    , logger = utils.logger;
import {AssetAction} from "./base/AssetAction";
import {CurrencyPair, Exchange} from "./base/Currency";
import {TradeType} from "./Trade";


export const COLLECTION_NAME = 'liquidations'
export type LiquidationType = "buy" | "sell";

export class Liquidation extends AssetAction {
    constructor() {
        super()
    }

    public static createLiquidation(currencyPair: CurrencyPair, type: LiquidationType, amount: number, rate: number, exchange: Exchange, tradeID: string | number = ""): Liquidation {
        let liq = new Liquidation();
        liq.currencyPair = currencyPair;
        liq.type = type === "buy" ? TradeType.BUY : TradeType.SELL;
        liq.amount = amount;
        liq.rate = rate;
        liq.exchange = exchange;
        liq.date = new Date();
        liq.init(tradeID);
        if (liq.amount === undefined || liq.amount === null || liq.rate === undefined || liq.rate === null) {
            logger.error("Received invalid liquidation data: amount %s, rate %s, exchange %s", amount, rate, exchange);
            return null;
        }
        return liq;
    }
}

export function init(doc): Liquidation {
    return Object.assign(new Liquidation(), doc)
}

export function initMany(docs: any[]): Liquidation[] {
    for (let i = 0; i < docs.length; i++)
        docs[i] = init(docs[i])
    return docs
}

export function storeLiquidations(db, liquidations: Liquidation[], cb) {
    if (!liquidations || liquidations.length === 0)
        return cb && cb();
    let storeList = [];
    for (let i = 0; i < liquidations.length; i++)
    {
        let liq = Object.assign({}, liquidations[i]);
        liq.currencyPair = liq.currencyPair.toNr();
        storeList.push(liq)
    }
    let collection = db.collection(COLLECTION_NAME)
    // we have to use ordered == false to continue inserting on duplicate key
    collection.insertMany(storeList, {ordered: false}, (err, result) => {
        if (err) {
            if (err.code !== 11000) // ignore duplicate key errors
                return cb && cb(err);
        }
        cb && cb()
    })
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
                date: 1 // asc
            }, {
                name: COLLECTION_NAME + 'DateIndex'
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
        }
    ];
}
