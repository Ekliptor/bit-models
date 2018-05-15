import {DatabaseObject} from "../base/DatabaseObject";
import {Currency, Exchange} from "../base/Currency";
import {SocialAction, SocialActionType} from "./SocialAction";
import * as crypto from "crypto";
import {SocialNetwork} from "./SocialPost";

export const COLLECTION_NAME = 'trollPosts'

export class TrollShout extends SocialAction {
    public text: string;
    public exchange: Exchange;
    public network: SocialNetwork;
    public currenciesRaw: string[] = []; // parsed strings starting with # or $ (currencies our bot might not know yet)

    constructor() {
        super()
        this.type = SocialActionType.TrollShout;
    }

    public init() {
        const uniqueKey = this.type.toString() + this.text + (this.exchange ? this.exchange.toString() : "");
        this.uniqueID = crypto.createHash('sha512').update(uniqueKey, 'utf8').digest('base64')
    }
}

export function init(shout): TrollShout {
    shout = Object.assign(new TrollShout(), shout)
    return shout
}

export function initMany(shouts: any[]): TrollShout[] {
    for (let i = 0; i < shouts.length; i++)
        shouts[i] = init(shouts[i])
    return shouts
}

export function getInitFunctions(db) {
    return [
        (callback) => {
            db.createCollection(COLLECTION_NAME, callback);
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
                author: 1 // asc
            }, {
                name: COLLECTION_NAME + 'AuthorIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                currency: 1 // asc
            }, {
                name: COLLECTION_NAME + 'CurrencyIndex'
            }, callback);
        }
        ,
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                exchange: 1 // asc
            }, {
                name: COLLECTION_NAME + 'ExchangeIndex'
            }, callback);
        }
    ];
}