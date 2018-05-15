import * as utils from "@ekliptor/apputils";
import {DatabaseObject} from "../base/DatabaseObject";
import {Currency, Exchange, getCurrencyLabel} from "../base/Currency";
import {Sentiment, SocialAction, SocialActionType} from "./SocialAction";
import {ReadPreference} from "mongodb";
import * as crypto from "crypto";
import {TrollShout, COLLECTION_NAME as TROL_COLLECTION_NAME} from "./TrollShout";

export const COLLECTION_NAME = 'socialPosts'
const AGGREGATE_FIELDS = {
    type: 1,
    date: 1,
    currency: 1,
    currenciesRaw: 1,
    sentiment: 1,
    sentimentHeadline: 1,
    reply: 1
}

export enum SocialNetwork {
    OTHER = 0,
    REDDIT = 1,
    TWITTER = 2,
    TELEGRAM = 3,
    TELEGRAM_RAW = 4, // telegram with raw parsed currency strings (bot might not support them)

    // news sites
    COINDESK = 100,
    BITCOINCOM = 101,
    WALLSTREET_JOURNAL = 102,
    HACKER_NEWS = 103, // multiple smaller sites, named by chainnews.io
    BUSINESS_INSIDER = 104,
    REUTERS = 105,
    INDEPENDENT = 106,
    CNBC = 107,
    USA_TODAY = 108,
    WASHINGTON_POST = 109,
    TRIBETICA = 110,
    COINTELEGRAPH = 111,
    BITCOIN_MAGAZINE = 112,
    ECONOMIST = 113,
    THEGUARDIAN = 114,
    TECH_CRUNCH = 115,
    MASHABLE = 116,
    THESUN = 117,
    DAILYMAIL = 118,
    CNN = 119,
    WIRED = 120,
    CRYPTO_NEWS247 = 121,
    TRADINGVIEW = 122,
    NEWSBTC = 123,
    CRYPTONINJAS = 124,
    COINSPEAKER = 125,
    BTCMANAGER = 126,
    BITCOINIST = 127,
    LIVEBITCOINNEWS = 128,
    ZCRYPTO = 129,
    THE_INDEPENDENT_REPUBLIC = 130,
    PROFITCONFIDENTIAL = 131,
    COINIDOL = 132,
    ETHEREUMWORLDNEWS = 133,
    QZ = 134,
    AMBCRYPTO = 135,
    TRUSTNODES = 136,
    CRYPTOBRIEFING = 137,
    CRYPTOANSWERS = 138,
    USETHEBITCOIN = 139,
    COINDOO = 140,
    BITMEX = 141,
    HOWTOTOKEN = 142,
    COINTIA = 143,
    INVESTOPEDIA = 144,
    COINGAPE = 145,
    CRYPTOVEST = 146,

    MULTIPLE = 10000
}

export class SocialPostAggregateMap extends Map<string, SocialPostAggregate[]> { // (currency, SocialPostAggregate per day)
    network: SocialNetwork;
    //mainCurrency: Currency;

    constructor(network: SocialNetwork) {
        super()
        this.network = network;
    }
    addToDay(currencyStr: string, date: Date, sentiment: Sentiment, reply: boolean, sentimentHeadline?: Sentiment, incrementCount?: number) {
        if (!incrementCount)
            incrementCount = 1;
        let currencyAggregage = this.get(currencyStr);
        if (!currencyAggregage) {
            // we don't have stats for this currency yet
            currencyAggregage = [];
            let dayAggregate = new SocialPostAggregate(date, sentiment, reply, sentimentHeadline);
            currencyAggregage.push(dayAggregate);
            this.set(currencyStr, currencyAggregage);
        }
        else {
            // our list is sorted. so check if it's for the current day
            let lastDay = currencyAggregage[currencyAggregage.length-1];
            if (lastDay.year === date.getUTCFullYear() && lastDay.month === date.getUTCMonth() && lastDay.day === date.getUTCDate()) {
                lastDay.sentiment.compSum += sentiment.comparative;
                if (sentimentHeadline)
                    lastDay.sentimentHeadline.compSum += sentimentHeadline.comparative;
                if (reply)
                    lastDay.commentCount += incrementCount;
                else
                    lastDay.postCount += incrementCount;
            }
            else {
                // it's a new day
                // ensure there are no missing dates (fill up with 0 post entries)
                let last = utils.date.dateFromUtc(lastDay.year,lastDay.month,lastDay.day);
                last = utils.date.dateAdd(last, "day", 1);
                let next = utils.date.dateFromUtc(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
                let emptyDayAggregate: SocialPostAggregate = null;
                let nextDayAggregate = new SocialPostAggregate(date, sentiment, reply, sentimentHeadline);
                while (last.getTime() < next.getTime()) // while < next
                {
                    if (date.getUTCMonth() === last.getUTCMonth() && date.getUTCDate() === last.getUTCDate())
                        break; // double check
                    emptyDayAggregate = new SocialPostAggregate(last, null,false);
                    if (emptyDayAggregate.day === nextDayAggregate.day)
                        break;
                    currencyAggregage.push(emptyDayAggregate);
                    last = utils.date.dateAdd(last, "day", 1);
                }
                currencyAggregage.push(nextDayAggregate);
                this.set(currencyStr, currencyAggregage);
            }
        }
    }
    finalize(totalNumDays: number) {
        let minDate = new Date(Date.now() + 24*60*60*1000);
        for (let currency of this)
        {
            let currencyAggregage = currency[1];
            currencyAggregage.forEach((aggregate) => {
                aggregate.postCount = Math.floor(aggregate.postCount);
                aggregate.commentCount = Math.floor(aggregate.commentCount);
                const totalCount = aggregate.postCount + aggregate.commentCount;
                if (totalCount > 0) {
                    aggregate.sentiment.compAvg = aggregate.sentiment.compSum / totalCount;
                    aggregate.sentimentHeadline.compAvg = aggregate.sentimentHeadline.compSum / totalCount;
                }
                else {
                    aggregate.sentiment.compAvg = 0;
                    aggregate.sentimentHeadline.compAvg = 0;
                }
                let curDate = utils.date.dateFromUtc(aggregate.year,aggregate.month,aggregate.day);
                if (curDate.getTime() < minDate.getTime())
                    minDate = curDate;
            })
            if (currencyAggregage.length === 0)
                continue;
            // fill up remaining day until today (in case nothing was crawled today)
            let lastDay = currencyAggregage[currencyAggregage.length-1];
            let last = utils.date.dateFromUtc(lastDay.year,lastDay.month,lastDay.day);
            last = utils.date.dateAdd(last, "day", 1);
            const now = new Date();
            let today = utils.date.dateFromUtc(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
            let emptyDayAggregate: SocialPostAggregate = null;
            while (last.getTime() < today.getTime()) // while < today
            {
                if (today.getUTCMonth() === last.getUTCMonth() && today.getUTCDate() === last.getUTCDate())
                    break; // double check
                emptyDayAggregate = new SocialPostAggregate(last, null,false);
                currencyAggregage.push(emptyDayAggregate);
                last = utils.date.dateAdd(last, "day", 1);
            }
        }

        // ensure we start at the first day (in case crawling for this currency started later)
        for (let currency of this)
        {
            let currencyAggregage = currency[1];
            if (currencyAggregage.length === 0)
                continue;
            let currentFirstDate = utils.date.dateFromUtc(currencyAggregage[0].year, currencyAggregage[0].month, currencyAggregage[0].day);
            while (/*currentFirstDate.getTime() > minDate.getTime() && */currencyAggregage.length < totalNumDays)
            {
                currentFirstDate = utils.date.dateAdd(currentFirstDate, "day", -1); // go back 1 day
                let emptyDayAggregate = new SocialPostAggregate(currentFirstDate, null,false);
                currencyAggregage.unshift(emptyDayAggregate); // insert a new element at the beginning
            }
        }
        this.computeActivityChange();

        /*
        for (let currency of this)
        {
            let currencyAggregage = currency[1];
            currencyAggregage.forEach((aggregate) => {
                // ensure sentiment is 0. shouldn't be needed. sometimes there is 1 post. set it to 0 below a threshold?
                if (aggregate.isEmpty())
                    aggregate.sentiment.compAvg = 0;
            })
        }
        */
    }

    protected computeActivityChange() {
        for (let currency of this)
        {
            let currencyAggregage = currency[1];
            if (currencyAggregage.length === 0)
                continue;
            for (let i = 0; i < currencyAggregage.length - 1; i++)
            {
                // arr[n] - arr[n+1]
                let dayDataToday = currencyAggregage[i].commentCount + currencyAggregage[i].postCount;
                let dayDataTomorrow = currencyAggregage[i+1].commentCount + currencyAggregage[i+1].postCount;
                //currencyAggregage[i+1].activityChange = dayDataToday - dayDataTomorrow;
                currencyAggregage[i+1].activityChange = dayDataTomorrow - dayDataToday;
            }
        }
    }
}
export class SocialPostAggregate {
    year: number;
    month: number;
    day: number;
    postCount: number = 0;
    commentCount: number = 0;
    activityChange: number = 0;
    // TODO number of words?
    sentiment: {
        compAvg: number;
        compSum: number;
    }
    sentimentHeadline: {
        compAvg: number;
        compSum: number;
    }

    constructor(date: Date, sentiment: Sentiment = null, reply: boolean = false, sentimentHeadline: Sentiment = null) {
        this.year = date.getUTCFullYear();
        this.month = date.getUTCMonth();
        this.day = date.getUTCDate();
        this.sentiment = {
            compAvg: 0,
            compSum: sentiment ? sentiment.comparative : 0
        };
        this.sentimentHeadline = {
            compAvg: 0,
            compSum: sentimentHeadline ? sentimentHeadline.comparative : 0
        };
        if (sentiment) { // otherwise it's an empty day
            if (reply)
                this.commentCount++;
            else
                this.postCount++;
        }
    }
    isEmpty() {
        return this.postCount === 0 && this.commentCount === 0;
    }
}

export class SocialPost extends SocialAction {
    public url: string;
    public title: string;
    public text: string;
    public exchanges: Exchange[];
    public network: SocialNetwork;

    constructor() {
        super()
        this.type = SocialActionType.SocialPost;
    }

    public init() {
        // don't add currency here because tweets have multiple currency hashtags
        const uniqueKey = this.type.toString() + this.url + this.title + this.text;
        this.uniqueID = crypto.createHash('sha512').update(uniqueKey, 'utf8').digest('base64')
    }
}

export function init(post): SocialPost {
    post = Object.assign(new SocialPost(), post)
    return post
}

export function initMany(posts: any[]): SocialPost[] {
    for (let i = 0; i < posts.length; i++)
        posts[i] = init(posts[i])
    return posts
}

function isSocialNetwork(arg: any): arg is SocialNetwork {
    return true; // dummy to bypass TS compiler error
}

export function getRecentPosts(db, network: SocialNetwork, maxAge: Date) {
    return new Promise<SocialPost[]>((resolve, reject) => {
        let collection = db.collection(COLLECTION_NAME)
        collection.find({
            network: network,
            date: {$gt: maxAge}
        }).sort({date: 1}).setReadPreference(ReadPreference.SECONDARY_PREFERRED).toArray().then((docs) => {
            resolve(initMany(docs))
        }).catch((err) => {
            reject({txt: "Error getting recent posts", err: err})
        })
    })
}

export function getRecentPostStats(db, networkOrType: SocialNetwork | SocialActionType, maxAge: Date, numDays: number, bySocialType = false,
                                   aggregateProp = "currency") {
    return new Promise<SocialPostAggregateMap>((resolve, reject) => {
        let collectionName = COLLECTION_NAME;
        if (!bySocialType && networkOrType === SocialNetwork.TELEGRAM)
            collectionName = TROL_COLLECTION_NAME;
        let collection = db.collection(collectionName)
        // TODO map reduce & cache it
        /*
        collection.aggregate([{
            $match: {
                network: network,
                date: {$gt: maxAge}
            }
        }, {
            $sort: {date: 1}
        }, {
            $group: {_id: "currency"}
        }], aggregateOpts).then((docs) => {
        }).catch((err) => {
        })
        */
        let query: any = {
            date: {$gt: maxAge}
        }
        if (bySocialType)
            query.type = networkOrType;
        else
            query.network = networkOrType;
        collection.find(query, AGGREGATE_FIELDS).sort({date: 1}).setReadPreference(ReadPreference.SECONDARY_PREFERRED).toArray().then((docs) => {
            let aggregate: SocialPostAggregateMap;
            if (bySocialType)
                aggregate = new SocialPostAggregateMap(SocialNetwork.MULTIPLE)
            else if (isSocialNetwork(networkOrType))
                aggregate = new SocialPostAggregateMap(networkOrType)
            docs.forEach((doc) => {
                //if (doc.currency.length === 0)
                if (!doc[aggregateProp] || doc[aggregateProp].length === 0)
                    return; // skip it. shouldn't happen
                //const currencyStr = aggregateProp === "currency" ? getCurrencyLabel(doc.currency[0]) : doc[aggregateProp][0]; // aggregate by the 1st one
                const currencyStrArr: string[] = aggregateProp === "currency" ? doc.currency.map(c => getCurrencyLabel(c)) : doc[aggregateProp];
                currencyStrArr.forEach((currencyStr) => {
                    // if we count every mention of a currency, posts will be counted multiple times
                    // only increment by 1 / currencyStrArr.length in addToDay()
                    aggregate.addToDay(currencyStr, doc.date, doc.sentiment, doc.reply, doc.sentimentHeadline, 1/currencyStrArr.length);
                })
            })
            aggregate.finalize(numDays);
            resolve(aggregate)
        }).catch((err) => {
            reject({txt: "Error getting recent post stats", err: err})
        })
    })
}

export function getSocialNetworkNr(network: SocialNetwork): number {
    if (network.toString().match("^[0-9]+$") !== null)
        return parseInt(network.toString());
    return parseInt(SocialNetwork[network]);
}

export function getInitFunctions(db) {
    return [
        (callback) => {
            db.createCollection(COLLECTION_NAME, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                url: 1 // asc
            }, {
                name: COLLECTION_NAME + 'UrlIndex'
                //unique: true // url can't be unique because on Reddit we get the same URL for all comments. compound index with text is too big
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
                author: 1 // asc
            }, {
                name: COLLECTION_NAME + 'AuthorIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                title: 1 // asc
            }, {
                name: COLLECTION_NAME + 'TitleIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                currency: 1 // asc
            }, {
                name: COLLECTION_NAME + 'CurrencyIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                type: 1 // asc
            }, {
                name: COLLECTION_NAME + 'TypeIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                uniqueID: 1 // asc
            }, {
                name: COLLECTION_NAME + 'UniqueIDIndex'
                // property not set to unique to allow sharding
            }, callback);
        }
    ];
}