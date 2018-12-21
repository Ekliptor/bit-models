import * as utils from "@ekliptor/apputils";
const logger = utils.logger;
import {DatabaseObject} from "./base/DatabaseObject";
import {Trade} from "./Trade";
import {Currency, CurrencyPair, Exchange} from "./base/Currency";
import {FundingTrade} from "./Funding";


export const COLLECTION_NAME = 'botTrades'

export enum LogTradeType {
    BUY = 1,
    SELL = 2,
    CLOSE_LONG = 3,
    CLOSE_SHORT = 4,
    LEND = 5 // doesn't have close orders. gets set when place and we add the interest
    // this assumes the loan will be taken the full time // TODO implement "loan returned" and "loan taken" API calls
    //INTEREST_PAY = 6 // margin trading
    //INTEREST_GET = 7 // lending
}
export enum LogTradeMarket {
    EXCHANGE = 1,
    MARGIN = 2,
    LENDING = 3
}

export type TradingMode = "trading" | "arbitrage" | "lending";
export const TRADING_MODES: TradingMode[] = ["trading", "arbitrage", "lending"];

export abstract class AbstractBotTrade extends DatabaseObject {
    public time: Date = null;
    public market: LogTradeMarket;
    public type: LogTradeType;
    public rate: number = 0.0;
    public amount: number = 0.0;

    public exchange: Exchange;
    public currencyPair: CurrencyPair; // from and to is the same for lending. used with index
    public configName: string = "";
    public strategies: string[] = [];
    public reason: string = "";

    public userToken: string = ""; // for auth in public environment

    // other data such as currencyPairStr is added in UI when creating UITrade objects

    constructor(time: Date, market: LogTradeMarket, type: LogTradeType, exchange: Exchange, currencyPair: CurrencyPair) {
        super()
        this.market = market;
        this.type = type;
        this.exchange = exchange;
        this.time = time;
        this.currencyPair = currencyPair;
    }

    public setTradingAmount(rate: number, amount: number) {
        this.rate = rate;
        this.amount = amount;
    }

    protected setTradingDataInternal(configName: string, strategies: string[], reason: string) {
        this.configName = configName;
        this.strategies = strategies;
        this.reason = reason;
    }
}

export class BotTrade extends AbstractBotTrade {
    public trades: Trade[] = [];
    //public profitLossAmount: number = -1; // gets calculated when fetching docs and aggregating the same currency pairs
    //public profitLossPercentage: number = -1;
    public fees: number = 0.0; // in percent
    // TODO add margin lending fees for margin trading. needs API calls to query them from exchange
    public arbitrage: boolean = false;
    public paper: boolean = false;

    constructor(time: Date, market: LogTradeMarket, type: LogTradeType, exchange: Exchange, currencyPair: CurrencyPair) {
        super(time, market, type, exchange, currencyPair)
    }

    public setTradingData(configName: string, strategies: string[], trades: Trade[], reason: string) {
        this.trades = trades;
        this.setTradingDataInternal(configName, strategies, reason);
    }
}

export class BotLendingTrade extends AbstractBotTrade {
    public lendingTrades: FundingTrade[] = [];
    public lendingFees: number = 0.0; // in percent
    //public interestRate: number = 0.0; // always use rate form parent class
    public interestAmount: number = 0.0; // interestRate * days if the loan is not returned earlier
    public days: number = 0;

    constructor(time: Date, market: LogTradeMarket, type: LogTradeType, exchange: Exchange, currency: Currency) {
        super(time, market, type, exchange, new CurrencyPair(currency, currency))
    }

    public setTradingData(configName: string, strategies: string[], lendingTrades: FundingTrade[], reason: string) {
        this.lendingTrades = lendingTrades;
        this.setTradingDataInternal(configName, strategies, reason);
    }
}

export function init(trade): BotTrade {
    if (trade.market === LogTradeMarket.LENDING)
        trade = Object.assign(new BotLendingTrade(trade.time, trade.market, trade.type, trade.exchange, trade.currency), trade);
    else
        trade = Object.assign(new BotTrade(trade.time, trade.market, trade.type, trade.exchange, trade.currencyPair), trade);
    if (Array.isArray(trade.currencyPair) === true)
        trade.currencyPair = CurrencyPair.fromNr(trade.currencyPair);
    return trade
}

export function initMany(trades: any[]): BotTrade[] {
    for (let i = 0; i < trades.length; i++)
        trades[i] = init(trades[i])
    return trades
}

export async function storeTrade(db, botTrade: AbstractBotTrade): Promise<boolean> {
    let collection = db.collection(COLLECTION_NAME)
    try {
        let result = await collection.insertOne(botTrade);
    }
    catch (err) {
        logger.error("Error storing bot trade", botTrade, err)
        return false;
    }
    return true;
}

export function getInitFunctions(db) {
    return [
        (callback) => {
            db.createCollection(COLLECTION_NAME, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                time: 1 // asc
            }, {
                name: COLLECTION_NAME + 'TimeIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                market: 1 // asc
            }, {
                name: COLLECTION_NAME + 'MarketIndex'
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
                exchange: 1 // asc
            }, {
                name: COLLECTION_NAME + 'ExchangeIndex'
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
                configName: 1 // asc
            }, {
                name: COLLECTION_NAME + 'ConfigNameIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                userToken: "hashed"
            }, {
                name: COLLECTION_NAME + 'UserTokenIndex'
            }, callback);
        },
    ];
}