import {DatabaseObject} from "./base/DatabaseObject";
import {ExternalTicker} from "./Ticker";
import {Exchange} from "./base/Currency";

export const COLLECTION_NAME = 'tickerVolumeSpikes'

export class TickerVolumeSpike {
    public date: Date = new Date();
    public lastTicker: ExternalTicker;
    public currentTicker: ExternalTicker;
    public spikeFactor: number;
    public priceChange: number = 0; // in % between last and current ticker
    public exchange: Exchange;
    public currencyPair: string;

    constructor(lastTicker: ExternalTicker, currentTicker: ExternalTicker, spikeFactor = 0.0) {
        this.lastTicker = lastTicker;
        this.currentTicker = currentTicker;
        this.exchange = this.lastTicker.exchange;
        this.currencyPair = this.lastTicker.currencyPair;
        if (spikeFactor == 0.0 && this.lastTicker.quoteVolume !== 0.0)
            this.spikeFactor = this.currentTicker.quoteVolume / this.lastTicker.quoteVolume;
        this.priceChange = this.getDiffPercent(this.currentTicker.last, this.lastTicker.last);
    }

    /**
     * Returns the % difference between value1 and value2
     * @param value1
     * @param value2
     * @returns {number} the % difference > 0 if value1 > value2, < 0 otherwise
     */
    protected getDiffPercent(value1: number, value2: number) {
        if (value2 === 0)
            return 0;
        return ((value1 - value2) / value2) * 100; // ((y2 - y1) / y1)*100 - positive % if value1 > value2
    }
}

export function init(doc): TickerVolumeSpike {
    return Object.assign(new TickerVolumeSpike(doc.lastTicker, doc.currentTicker, doc.spikeFactor), doc)
}

export function initMany(docs: any[]): TickerVolumeSpike[] {
    for (let i = 0; i < docs.length; i++)
        docs[i] = init(docs[i])
    return docs
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
                exchange: 1 // asc
            }, {
                name: COLLECTION_NAME + 'ExchangeIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                spikeFactor: 1 // asc
            }, {
                name: COLLECTION_NAME + 'SpikeFactorIndex'
            }, callback);
        }
    ];
}