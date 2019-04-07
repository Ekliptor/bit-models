import * as utils from "@ekliptor/apputils";
import {DatabaseObject} from "./base/DatabaseObject";
import * as fs from "fs";
import * as path from "path";
import {SocialNetwork} from "./Social/SocialPost";
import {Currency, Exchange} from "./base/Currency";

const nconf = utils.nconf
    , logger = utils.logger

const textDirs = [path.join(__dirname, 'text') + path.sep,
    path.join(__dirname, '..', '..', 'models', 'text') + path.sep] // if we are inside /build dir
const CUR_DIR = fs.existsSync(textDirs[0]) ? path.join(textDirs[0], '..') : path.join(textDirs[1], '..')
const DEFAULT_MARGIN_NOTIFICATION = 0.26
const DEFAULT_EXCHANGE_PROXY = []; // an array of proxy URLs to randomly choose a proxy

// this is the global server config for all servers
// there is only 1 doc of this in the database

export const COLLECTION_NAME = 'serverConfig'
// config values that can be changed by the user (and are not overwritten with default values) must be added here
export const OVERWRITE_PROPS = ["name", "notificationMethod", "apiKey", "twitterApi", "user", "username", "password", "userToken",
    "loggedIn", "lastUsername", "pausedTrading", "pausedOpeningPositions", "lastWorkingConfigName", "lastWorkingConfigTime", "firstStart", "configReset"];

let saveConfigTimerID: NodeJS.Timer = null;
let saveConfigQueue = Promise.resolve();

export class ServerConfig extends DatabaseObject {
    public name = 'master' // token-botNr from user.ts for premium bot users
    public enabled = true
    public processIntervalBaseSec = 0
    public processIntervalRandomSec = 5
    public notificationMethod = "Pushover" // name of the notification class ("Pushover")
    public adminNotificationMethod = "Pushover"; // class to notify admin in case of problems
    public candlestickPatternRecognizer = "NodeCandlestick"
    public maxCandlestickCandles = 5
    public trendlineKeepDays = 14
    public defaultCandleSize = 5 // in minutes. used when a strategy candleSize == "default"
    public candleEqualPercent = 0.005 // consider candle price equal if abs % change <= this value
    public keepCandles = 100 // number of last candles strategies shall keep
    public keepCandles1min = 6*24*60 // number of 1min candles to keep in strategies // 6 days
    public keepCandlesArbitrageGroup = 10 // number of candles for exchange grouping to keep (before deletion because an exchange didn't send data)
    public notificationPauseMin = 180 // how long to wait before sending the same notification again (per strategy)
    public checkMargins = true
    public checkInstances = true
    public instanceCount = 6
    public monitoringInstanceDir = "_monitor";
    public instanceApiCheckRepeatingSec = 30 // check again after x seconds befor terminating the instance
    public assumeBotCrashedMin = 11 // after we get no response for this time we assume the bot is not starting (errors on startup)
    public httpTimeoutMs = 130*1000 // > 2min // poloniex msg: This IP has been banned for 2 minutes. Please adjust your timeout to 130 seconds.
    public websocketTimeoutMs = 35000 // after how long we will reset the connection to the exchange if we don't receive any trades
    public httpPollIntervalSec = 20 // for exchanges without websocket support
    public fetchTradesMinBack = 2
    public keepResponseTimes = {
        recent: 2,
        avg: 25,
        lowFactor: 4.2 // how many times the recent ping has to be higher than avg for the exchange to be considered overloaded
    }
    public forwardTradesSec = 1; // limit how often we forward trades to strategies to save CPU
    public forwardTradesAddPerMarketSec = 1.3;
    public optimizeNumberDecimals = 10; // 10 = 1 decimal, 100 = 2 decimals,... // for backfinder/optimizer
    public tradeTickLog = 200 // verbose logs in strategies every x trades
    public maxPriceDiffPercent = 0.05 // how much higher/lower compared to last price our buy/sell price will be
    public orderBookUpdateDepth = 300
    public futureContractType = "quarter"; // this_week   next_week   quarter // only used for OKEX
    public fallbackContractType = "next_week"; // if we can't open the primary contract type (spread too high). leave empty to disable it
    public openOppositePositions = false; // allow opening long and short positions at the same time (only supported by some exchanges)
    public mainStrategyAlwaysTrade = true; // don't allow other strategies to overwrite buy/sell events of main strategy (even with higher priority)
    public updatePortfolioSec = 120;
    public updateMarginPositionsSec = 300; // has to be >= updatePortfolioSec
    public delayFirstEmitSyncSec = 60; // ensure strategies are initialized. means that balances show later in the UI
    public strategyRunOnceIntervalH = 12;
    public storeTrades = false; // in live mode
    public storeLendingTrades = false;
    public restartPausedBotsMin = 605; // 0 = disabled - restart bots if paused to reduce memory usage on small vServer
    public saveStateMin = 60; // save the bot state for faster restarts after crashes. 0 = disabled
    public minStrategyUpdateMs = 1000;
    public tradeNotifierClass = "TradeNotifier";
    public clearLogOnceProbability = 15;
    public maxClosePartialPercentage = 99.1;
    public checkUpdateIntervalH = 25; // don't set this too low because candles smaller than this interval will not get filled otherwise
    public loadConfigIntervalMin = 10; // save CPU
    public marginTradingPartialAmountFromRealBalance = true; // trade with percentages of actual position size when using partial take-profit or stop-loss. Useful with manual trading

    public websocketPingMs = 30000 // keep alive ping for WebUI

    // Lending
    public updateBalancesTimeSec = 120;
    public updateBalancesImmediatelyTimeSec = 5;
    public minPortfolioUpdateMs = 12000;
    public minPlaceAllCoinsDiffSec = 50;
    public offerTimeoutSec = 120 // cancel loan offers that haven't been taken after this time // should be >= updateBalancesTimeSec
    public websocketTimeoutAddMs = 240*1000; // lending trades happen less frequently
    public orderBookRaisePercentWallDetect = 0.05;
    public euroDollarRate = 1.22;

    public strategyDefaults = {
        thresholds: {
            //down: -0.025,
            //up: 0.025,
            down: -0.55,
            up: 0.1,
            // best parameters for June 2017 for ETH on poloniex: down -0.55, up 0.02 -> 163%
            // TODO detect weekly up and down trends and adjust parameters dynamically?
            persistence: 1, // starting at 1 = open immediately
            sidewaysPercent: 3.5
        }
    }

    public backtest = {
        from: "2017-08-01 00:00:00",
        to: "2017-09-04 00:00:00",

        startBalance: 1.0, // for every coin (leveraged *2.5 when margin trading)
        slippage: 0.0, // in %, for example 0.05%
        cacheCandles: false,
        walk: true, // Walk Forward Analysis: load previously optimized parameters and continue optimizing on them
        resetWarmupBacktestErrorSec: 30
    }
    public batchTrades = true;
    public exchangeImportDelayMs = 5000; // Bitfinex (and others?) need time to connect websockets
    public parentBacktestTickMs = 1000;
    public importTickIntervalMs = 3000;
    public importWarmupAddPercent = 20; // how many percent more the "max candles" shall be imported

    public plot = {
        emaPeriod: 26
    }

    public tradeMode = 2 // 1 = SIMULATION, 2 = LIVE
    public holdMin = 1 // how many minutes we have to hold a coin at least after a trade
    public canAlwaysClose = true // "close" orders can happen even if "holdMin" hasn't passed
    public canTradeImmediatelyAfterClose = true // we can place new buy/sell orders after closing a position without waiting for "holdMin"
    public orderTimeoutSec = 600 // cancel orders that haven't been filled after this time
    public orderAdjustBeforeTimeoutFactor = 3.0 // move orders at orderTimeoutSec/orderAdjustBeforeTimeoutFactor (before they time out)
    public orderBookTimeoutSec = 90 // force reloading the orderbook snapshot if no updates happen for x seconds
    public maxRealtimeMarketOffsetSec = 120
    public delayPossible2ndPositionCloseSec = 20 // don't set this too high, our strategy might change from long to short
    public waitOrdersRepeatingCheckSec = 30
    public delayVerificationOrderSec = 180 // verify internally in the exchange class if an order got executed with the correct amount
    public orderMakerAdjustSec = 40
    public orderContractExchangeAdjustSec = 240 // higher volatility, usually only 1 fee for submitting (maker + taker) order
    public tickerExpirySec = 60
    public closeRatePercentOffset = 0.3; // how much higher/lower the max close rate shall be (for exchanges that don't support market orders)
    public maxSellPriseRise = 2.5 // how many times more coins the trader is allow to sell than buy (than specified in config)
    public removeOldLog = false // remove old logfiles on app start
    public logTimeoutMin = 30 // after what time log entries from logOnce() can appear again
    public uiLogLineCount = 100 // how many recent log lines to fetch when when web UI starts
    public restoreStateMaxAgeMin = 600 // after this time state will be discarded. use higher values if bot crashes more often
    public restoreStateFromOthers = true; // try to restore strategy states from other strategies with the same candle size
    public restoreStateFromBacktest = true; // run a backtest to restore the state if we have no local state history
    public gzipState = true
    public searchAllPairsForState = true
    public pausedTrading = false
    public pausedOpeningPositions = false
    public lastWorkingConfigName = "Noop";
    public lastWorkingConfigTime: Date = null;
    public fallbackTradingConfig = "Noop";
    public lastWorkingResetConfigMin = 30;
    public lastRestartTime: Date = null;
    public restartPreviouslyIntervalMin = 10; // how many minutes we shall count the restart as recent, before resetting all config on failure otherwise
    public exchangesIdle = false;
    public maxProcessRuntimeMin = 20;

    public socketTimeoutMs = 10000                    // for spider and other browsers
    public userAgents = [
        // https://developers.whatismybrowser.com/useragents/explore/software_type_specific/web-browser/
        // windows
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
        'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0',
        'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1',
        'Mozilla/4.0 (compatible; MSIE 9.0; Windows NT 6.1)',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393',
        'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:52.0) Gecko/20100101 Firefox/52.0',
        'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
        // osx
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/603.3.8 (KHTML, like Gecko)',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/601.7.7 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
    ]

    // moved to BrainConfig.pricePoints
    //public inputPricePoints = 10; // 11 // inputs per currency for neuroal network price predictions (for example input 10 and predict the 11th price)
    public hiddenNeuronFactor = 0.7; // hidden neurons will be this value * inputNeurons + outputNeurons
    public consecutiveLearningSteps = true;
    public keepPredictionHistory = 150; // how many price predictions to keep in memory
    public futureCoinPairs = ["USD_BTC", "USD_LTC", "USD_ETH", "USD_ETC", "USD_BTG", "USD_XRP", "USD_EOS"];

    // place all keys here. we don't run user specific configurations to keep the design simpler. each user has his own bot instance
    public apiKey = {
        // a class with the exact same name has to exist under /Exchanges/ resp /Notifications/
        exchange: {
            // remove an exchange here to disable trading on it
            // marginNotification,proxy are optional. leave empty to disable it
            Poloniex: [{
                key: "",
                secret: "",
                marginNotification: DEFAULT_MARGIN_NOTIFICATION
            }],
            OKEX: [{
                key: "",
                secret: "",
                passphrase: "",
                marginNotification: 0.03,
                proxy: DEFAULT_EXCHANGE_PROXY
            }],
            Kraken: [{
                key: "",
                secret: "",
                marginNotification: 0.75
            }],
            // we need to 2 keys per array entry on bitfinex because we use API v2 and v1 currently
            Bitfinex: [{
                key: "",
                secret: "",
                key2: "",
                secret2: "",
                marginNotification: 0.22 // min margin 0.13
            }],
            Bittrex: [{
                key: "",
                secret: "",
                marginNotification: 0.5
            }],
            Binance: [{
                key: "",
                secret: "",
                marginNotification: 0.5
            }],
            BitMEX: [{
                key: "",
                secret: "",
                marginNotification: 0.03,
                testnet: false
            }],
            Deribit: [{
                key: "",
                secret: "",
                marginNotification: 0.03,
                testnet: false
            }],
            CoinbasePro: [{
                key: "",
                secret: "",
                passphrase: "",
                marginNotification: 0.5
            }],
            Bitstamp: [{
                key: "",
                secret: "",
                passphrase: "",
                marginNotification: 0.5
            }],
            CexIo: [{
                key: "",
                secret: "",
                passphrase: "",
                marginNotification: 0.5
            }],
            Cobinhood: [{
                key: "",
                secret: "",
                marginNotification: 0.5
            }],
            Gemini: [{
                key: "",
                secret: "",
                marginNotification: 0.5
            }],
            HitBTC: [{
                key: "",
                secret: "",
                marginNotification: 0.5
            }],
            Huobi: [{
                key: "",
                secret: "",
                marginNotification: 0.5
            }],
            KuCoin: [{
                key: "",
                secret: "",
                passphrase: "",
                marginNotification: 0.5
            }],
            Nova: [{
                key: "",
                secret: "",
                marginNotification: 0.5
            }],
            BitForex: [{
                key: "",
                secret: "",
                marginNotification: 0.5
            }],
            FCoin: [{
                key: "",
                secret: "",
                marginNotification: 0.5
            }],
            Bibox: [{
                key: "",
                secret: "",
                marginNotification: 0.5
            }],
            BxCo: [{
                key: "",
                secret: "",
                marginNotification: 0.5
            }],
            Liquid: [{
                key: "",
                secret: "",
                marginNotification: 0.5
            }],
            YoBit: [{
                key: "",
                secret: "",
                marginNotification: 0.5
            }],
        },
        notify: {
            Pushover: {
                appToken: "",
                receiver: "",
                adminReceiver: ""
            }
        },
        coinMarketCap: {
            apiKey: ""
        }
    }
    public wizardStrategies: string[] = [
        "TripleTrend", "TradingViewSignal", "WaveSurfer", "DayTrendFollower", "VolumeProfiler", "PivotSniper", "DirectionRunner", "Ichimoku",
        "IntervalExtremes", "MACD", "DEMA",
        // more technical
        "RSI", "CCI", "MFI", "OBV", "KAMA", "STC", "BollingerBouncer", "PingPong", "StopHunter", "TrendlineScalper",
        // stops
        "StopLossTurn", "StopLossTurnPartial", "EarlyStopLoss", "BollingerStop", "SARStop", "VolumeSpikeStopper", "WaveStopper", "TimeStop", "StopLossTime",
        "TrailingStopReverseEntry",
        // profit
        "TakeProfitAdvanced", "TakeProfit", "TakeProfitPartial", "TakeProfitStochRSI", "ProtectProfit",
        // others
        "WeekPredictor", "UnlimitedMargin", "VolumeProfileControl",
        "FishingNet", "SimpleAndShort",
        "PriceSpikeDetector", "VolumeSpikeDetector", "OrderBookPressure", "OrderPartitioner",
        "MakerFeeOrder", "OneTimeOrder", "MarketMakerOffset"
    ];
    // do we also need individual recommended strategies per exchange?

    // Social Crawler config
    public minWordLenDetectCurrency = 5;
    public socialUpdateSecUI = 600;
    public postDisplayAgeDays = 7; // 14
    public postDeleteOldDays = 60;
    public cleanupPostsIntervalDays = 1;
    public networksEnabled = [SocialNetwork.REDDIT, SocialNetwork.TWITTER, SocialNetwork.TELEGRAM];
    public checkSocialSpikeMin = 60;
    public crawlPricesMin = 30; // we currently show them hourly
    public crawlPricesHttpTimeoutSec = 50;
    public crawlTickerHours = 12;
    public tickerVolumeSpikeFactor = 2.0;
    public notifyVolumeSpikes = false;
    public removeTickersDays = 14;
    public removeTickersIntervalDays = 1;
    public removeVolumeSpikeDays = 2;
    public listVolumeSpikes = 20; // per exchange
    public crawlTickerExchanges = ["Bittrex", "Binance", "Bitfinex", "Poloniex"];
    public crawlTickerExchangeLabels = [Exchange.BITTREX, Exchange.BINANCE, Exchange.BITFINEX, Exchange.POLONIEX];
    public requiredTickerCurrencies = ["BTC", "XBT", "USD"];
    public listTopSocialCurrencies = 20;
    public maxLinePlotCurrencies = 8;
    //public crawlPricesUrl = "https://api.coinmarketcap.com/v2/ticker/?start=0&limit=300"; // deprecated. removed in December 2018
    public minPostsDayBefore = {
        twitter: 1700,
        telegram: 10,
        other: 100
    };
    public postTodayIncreaseFactor = 1.7;
    public startExtrapolateMessageH = 9; // don't send spike notifications before 9 AM (extrapolated for the whole day) to avoid false positives
    public spikeNotificationRepeatHours = 24; // how many hours before a message for the same network + currency can be sent again
    public rssFeedPollIntervalMin = 30;
    public checkTelegramRunningMin = 120;

    public coinMarketInfoDisplayAgeDays = 7;
    public cleanupPriceDataIntervalDays = 1;
    public priceDataDeleteOldDays = 14;
    public coinsTickIndicatorHours = 96;  // must be <= coinMarketInfoDisplayAgeDays
    public priceComparisonCoins = [Currency.BTC, Currency.ETH, Currency.XRP, Currency.BCH, Currency.EOS, Currency.STR, Currency.LTC,
            Currency.ADA, Currency.XMR, Currency.IOTA, Currency.DASH, Currency.TRX, Currency.TRX, Currency.BNB, Currency.XEM];
    public notifyCoinMarketApiErrors = true;
    public socialCralerInstanceCount = 3;
    public socialCrawlerDistributeSeed = "FooSeed234‚ƒfsd32l=)3f";

    public twitterApi = {
        consumerKey: '',
        consumerSecret: '',
        // we can get additional queries by removing this (limit per app instead of per user)
        accessTokenKey: '',
        accessTokenSecret: ''
    }
    public twitterStatusBaseUrl = "https://twitter.com/statuses/"
    public pollTwitterDataSec = 2; // max 450 requests per 15 min
    public maxTwitterQueryLength = 500; // their docs say 500 - only for REST API (no comma separated queries)
    public twitterSubscribeCurrencyNames = 120; // subscribe to the first x names + symbols, only symbols after
    public minCurrencyNameLengthSocial = 4;
    public twitterCurrencyTagFilter = ["amp", "bts", "omg", "pay", "game", "fun", "part", "dat", "gas", "via", "str", "nxt",
        "smart", "pink", "note", "eng", "act", "storm", "hot", "ht", "bela", "hc", "key", "geo", "cure", "bay", "wax", "med",
        "melon", "metal", "monetha", "gulden", "stealth", "myriad", "wepower", "wabi", "shift", "salus", "sequence", "propy", "ost",
        "ion", "incent", "holo", "gambit", "dynamic", "decent", "crown", "burst", "breakout", "adex",
        // currencies we might want to move to "required" filter
        "edo", "pasc", "salt", "sc", "cvc", "drop", "kin", "pot", "sky", "wtc", "rep"];
    // also for news
    public twitterRequireCurrencyKeyword = ["waves", "burst", "bat", "vet", "san", "ada", "mana", "ark", "mona", "naut",
        "avt", "veri", "link", "amp", "sub", "pay", "block", "game", "fun", "part", "via", "ppt", "theta", "icn",
        "ela", "maker", "status", "wings"];

    public cryptoCurrencyKeywords = [
        // additional crypto keywords. we already search for all currency keywords and symbols. see Currency.ts
        "Blockchain",
        "Crypto Currency",
        "Cryptocurrency",
        "Mining",
        "Hash",
        "Hashing",
        "BTC",
        "Bitcoin",
        "ETH",
        "Ethereum",
        "Ether",
        "Crypto",
        "Litecoin",
        "Dash",
        "Monero",
        "Zcash",
        "Wallet",
        "Foundation",
        "Dev",
        "Developer",
        "Developers"
    ]
    // TODO add crypto hashtags that we also search for on twitter such as #CryptoTwitter
    public maxLengthCurrencyRaw = 8; // Binance = 7
    public currencyRawFilter = ["BINANCE", "BITTREX", "AIRDROP", "NEWS", "NEW", "STOPLOSS", "ALT", "YOBIT", "WHALES", "HTML", "ALTCOINS"];

    // User config
    public premium = false // is it a bot being sold (or our own private bot). affects mostly UI + debugging
    public username = "Ekliptor";
    public password = "";
    public loggedIn = false;
    public lastUsername = "";
    // unique random string per user, idea: token-confirm-botNr from user.ts
    // currently used sha2(userTokenSeed + appDir + username)
    public userToken = "h9Ao3h14-SLlsJdfl324SDUfosUdfl34jljgfl34ewrwer";
    public user = {
        // object gets loaded and stored in DB (values here will be overwritten)
        devMode: false,
        restoreCfg: false
    }
    public checkLoginUrl = ""; // the API url for premium bot login
    public updateApiKeyUrl = "";
    public checkLoginApiKey = "";
    public checkLoginIntervalMin = 60;
    public notifyBeforeSubscriptionExpirationDays = 3;
    public premiumConfigFileName = "sensorConfig.json";
    public userTokenSeed = "nSDfhwelk5uo3uoDJ45tesgsasnll2p23GGG";
    public firstStart: Date = null;
    public configReset: boolean = false;

    public serverType = { // TODO add a json config file to machines and put server specific config here (number of backtest processes, ...)
        local: {},
        small: {}
    }

    constructor() {
        super()
    }
}

export function init(cfg): ServerConfig {
    //cfg = Object.assign(new ServerConfig(), cfg) // we need recursion
    cfg = utils.objects.deepAssign(new ServerConfig(), cfg)
    return cfg
}

export function loadServerConfig(db, cb) {
    /*
    let collection = db.collection(COLLECTION_NAME)
    let configObj = init({}) // create a default obj
    let filter: any = {}
    if (configObj.premium === true) {
        filter.name = "";
        filter.userToken = "";
    }
    else
        filter.name = "master"; // always load the master config. data gets overwritten from json on disk later
    collection.findOne(filter).then((cfg: ServerConfig) => {
        if (!cfg || configObj.premium === false) { // first install
            nconf.set('serverConfig', configObj);
            // for non-premium (dev) we load all configs from .ts file and ignore the DB
            return cb && cb();
        }
        //configObj = init(configObj) // only overwrite certain properties
        cfg = init(cfg);
        for (let prop in cfg)
        {
            if (OVERWRITE_PROPS.indexOf(prop) === -1)
                continue;
            nconf.set('serverConfig:' + prop, cfg[prop]) // also works for nested objects
        }

        cb && cb()
    })
    */
    // easier solution: always use config from here and merge with local file. every user has his own bot
    let currentConfig = nconf.get('serverConfig');
    let configObj = init({}) // create a default obj
    OVERWRITE_PROPS.forEach((prop) => {
        //delete configObj[prop];
        if (currentConfig[prop] !== undefined)
            configObj[prop] = currentConfig[prop];
    });
    nconf.set('serverConfig', configObj);
    setTimeout(() => {
        cb && cb()
    }, 0)
}

export async function saveConfig(db, configObj: ServerConfig): Promise<void> {
    logger.warn("Saving server config shouldn't be used currently. Better save config locally with nconf to a JSON file.")
    let collection = db.collection(COLLECTION_NAME)
    let filter: any = {}
    if (configObj.premium === true) {
        filter.name = ""; // TODO
        filter.userToken = "";
    }
    else
        filter.name = "master";
    try {
        let result = await collection.updateOne(filter, configObj, {upsert: true});
        if (result.matchedCount !== 1)
            logger.error("Config to update not found. filter", filter)
    }
    catch (err) {
        logger.error("Error updating config", err);
    }
}

export function saveConfigLocal() {
    return new Promise<void>((resolve, reject) => {
        if (saveConfigTimerID !== null) { // delay saving because this might be called multiple times at once
            clearTimeout(saveConfigTimerID);
            saveConfigTimerID = null;
        }
        saveConfigTimerID = setTimeout(() => {
            saveConfigTimerID = null;
            saveConfigQueue = saveConfigQueue.then(() => {
                return new Promise<void>((resolve, reject) => {
                    nconf.save(null, (err) => {
                        if (err)
                            logger.error("Error saving config locally", err);
                        resolve(); // always resolve
                    });
                })
            });
        }, 600);
        setTimeout(resolve.bind(this), 700); // easy way: always resolve later after timer to avoid issues when this is being called multiple times
    })
    // TODO add 2nd backup file and load from backup if 1st fails (invalid JSOn when crashing while saving)
}

export function getObjFromArr(valuesArr, key, keyName = 'name') {
    for (let i = 0; i < valuesArr.length; i++)
    {
        if (valuesArr[i][keyName] === key)
            return valuesArr[i];
    }
    return null;
}

export function getServerObjFromArr(valuesArr, serverArr, name) {
    let clientObj = getObjFromArr(valuesArr, name);
    if (!clientObj || ! clientObj.value)
        return null;
    let serverObj = getObjFromArr(serverArr, clientObj.value, 'value');
    if (!serverObj)
        return null
    return serverObj;
}

export function isEmptyApiKeys(exchangeKeys: any) {
    if (!exchangeKeys)
        return true; // shouldn't happen
    for (let name in exchangeKeys)
    {
        const keys: any[] = exchangeKeys[name];
        for (let i = 0; i < keys.length; i++) {
            for (let prop in keys[i]) {
                if (typeof keys[i][prop] === "string" && keys[i][prop].trim().length !== 0)
                    return false; // at least 1 key is set
            }
        }
    }
    return true;
}

/*
export function getNextInvoiceCount(db, cb) {
    let collection = db.collection(COLLECTION_NAME)
    collection.findOneAndUpdate({}, {$inc: {nextInvoiceNr: 1}}, {
        projection: {nextInvoiceNr: 1}
    }, (err, result) => {
        if (err)
            return cb(0);
        cb(result.value.nextInvoiceNr)
    })
}
*/

export function getInitFunctions(db) {
    return [
        (callback) => {
            db.createCollection(COLLECTION_NAME, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                name: 1 // asc
            }, {
                unique: true,
                name: COLLECTION_NAME + 'NameIndex'
            }, callback);
        },
        // insert test data
        (callback) => {
            let dataDir = nconf.get('debug') ? 'test' : 'production'
            const dirPath = path.join(CUR_DIR, 'data', dataDir, 'serverConfig.json')
            utils.test.readData(dirPath, (testData) => {
                if (Array.isArray(testData) === false) {
                    logger.verbose("No test data for init found. Using default values")
                    return callback && callback()
                }
                let objects = []
                testData.forEach((data) => {
                    objects.push(utils.test.createObject(new ServerConfig(), data))
                })
                db.collection(COLLECTION_NAME).insertMany(objects, callback)
            })
        }
    ];
}