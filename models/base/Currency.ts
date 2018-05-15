import {ExternalTicker, Ticker} from "../Ticker";

// currencies stored as numbers in DB to save some bytes
export enum Currency {
    BTC = 1,
    LTC = 2,
    ETH = 3,
    XRP = 4,
    XMR = 5,
    DASH = 6,
    FCT = 7,
    DOGE = 8,
    STR = 9,
    MAID = 10,
    CLAM = 11,
    BTS = 12,
    XEM = 13, // NEM
    STEEM = 14,
    GNT = 15, // Golem
    ZEC = 16,
    SC = 17, // Siacoin
    GNO = 18, // Gnosis
    REP = 19, // Augur
    XCP = 20, // Counterparty
    SJCX = 21, // Storjcoin X

    // other minor altcoins
    AMP = 100,
    ARDR = 101,
    BCN = 102,
    BCY = 103,
    BELA = 104,
    BLK = 105,
    BTCD = 106,
    BTM = 107,
    BURST = 108,
    DCR = 109,
    DGB = 110,
    EMC2 = 111,
    ETC = 112,
    EXP = 113,
    FLDC = 114,
    FLO = 115,
    GAME = 116,
    GRC = 117,
    HUC = 118,
    LBC = 119,
    LSK = 120,
    NAUT = 121,
    NAV = 122,
    NEO = 123,
    NMC = 124,
    NOTE = 125,
    NXC = 126,
    NXT = 127,
    OMNI = 128,
    PASC = 129,
    PINK = 130,
    POT = 131,
    PPC = 132,
    RADS = 133,
    RIC = 134,
    SBD = 135,
    STRAT = 136,
    SYS = 137,
    VIA = 138,
    VRC = 139,
    VTC = 140,
    XBC = 141,
    XPM = 142,
    XVC = 143,
    BCH = 144, // BCC, BitCoin Cash
    EOS = 145,
    IOTA = 146,
    OMG = 147,
    SAN = 148, // Santiment
    //BCU = 149, // BTC fork
    //BCC = 150, // BTC fork
    //RRT = 151, // Recovery Right Token, BitFinex tokens after hack
    ETP = 152,
    QTM = 153,
    AVT = 154,
    EDO = 155,
    BTG = 156,
    DAT = 157,
    QASH = 158,
    YYW = 159,
    ADA = 160,
    BCC = 161, // BitConnect
    MONA = 162,
    WAVES = 163,
    PPT = 164,
    HSR = 165,
    SALT = 166,
    KMD = 167,
    TRX = 168,
    BAT = 169,
    CVC = 170,
    XVG = 171,
    PIVX = 172,
    VERI = 173,
    ARK = 174,
    NANO = 175, // previously XRB
    ETN = 176,
    SNT = 177,
    BNB = 178,
    PAY = 179,
    GBYTE = 180,
    WTC = 181,
    VET = 182,
    POWR = 183,
    ZRX = 184,
    BYTM = 185,
    RDD = 186,
    XZC = 187,
    DGD = 188,
    KNC = 189,
    AE = 190,
    GAS = 191,
    AION = 192,
    MANA = 193,
    FUN = 194,
    TNB = 195,
    SPANK = 196,
    SNM = 197,
    LUN = 198,
    ZCL = 199,
    NAS = 200,
    SRN = 201,
    ENG = 202,
    REQ = 203,
    NXS = 304,
    LINK = 305,
    GXS = 306,
    NEBL = 307,
    BNT = 308,
    SUB = 309,
    QSP = 310,
    MED = 311,
    EMC = 312,
    XP = 313,
    BTX = 314,
    ICX = 315,
    MKR = 316,
    KCS = 317,
    RHOC = 318,
    IOST = 319,
    WAX = 320,
    ETHOS = 321,
    DCN = 322,
    LRC = 323,
    CND = 324,
    ZEN = 325,
    DRGN = 326,
    ELF = 327,
    CNX = 328,
    SMART = 239, // also SmartCash with same symbol on CoinMarketCap
    DENT = 340,
    KIN = 341,
    PART = 342,
    PLR = 343,
    RDN = 344,
    ICN = 345, // also iCoin
    XDN = 346,
    STORM = 347,
    XPA = 348,
    RLC = 349,
    UBQ = 350,
    POE = 351,
    ENJ = 352,
    SPHTX = 353,
    DEW = 354,
    PPP = 355,
    BLOCK = 356,
    SKY = 357,
    BCO = 358,
    AST = 359,
    PAC = 360,
    ANT = 361,
    ACT = 362,
    BIX = 363,
    LEND = 364,
    HPB = 365,
    COB = 366,
    MCO = 367,
    VIBE = 368,
    KORE = 369,
    MUE = 370,
    WINGS = 371,
    ENRG = 372,
    NEOS = 373, // not NEO


    USDT = 200, // US Dollar tethered, rates almost identical to US dollar

    // Fiat
    USD = 300,
    EUR = 301,
    JPY = 302,
    GBP = 303,

    ALL = 10000

    // Futures traded as BTC_USD with additional parameter contract_type: this_week next_week quarter
}

export function isCryptoCurrency(currency: Currency) {
    return currency < 300;
}

// mapping of Currency. needed for parsing trollbox & social media
// note: it is not neccessarry to add the currency symbol as value too
export const CurrencyName = new Map([
    [Currency.BTC, ["BitCoin", "XBT"]],
    [Currency.LTC, ["Litecoin"]],
    [Currency.ETH, ["Ethereum", "Ether"]],
    [Currency.XRP, ["Ripple"]],
    [Currency.XMR, ["Monero"]],
    [Currency.DASH, ["Dashcoin"]],
    [Currency.FCT, ["Factom"]],
    [Currency.DOGE, ["Doge", "Dogecoin"]],
    [Currency.STR, ["Stellar", "XLM", "Lumen"]], // XLM after merger with lumen? https://coinmarketcap.com/currencies/stellar/
    [Currency.MAID, ["MaidSafe", "MaidSafeCoin"]],
    [Currency.CLAM, ["CLAMS"]],
    [Currency.BTS, ["BitShares"]],
    [Currency.XEM, ["NEM"]],
    [Currency.STEEM, ["STEEM"]],
    [Currency.GNT, ["Golem"]],
    [Currency.ZEC, ["Zcash", "ZeroCash"]],
    [Currency.SC, ["Siacoin", "Sia"]],
    [Currency.GNO, ["Gnosis"]],
    [Currency.REP, ["Augur"]],
    [Currency.XCP, ["Counterparty"]],
    [Currency.SJCX, ["Storjcoin X", "Storjcoin", "Storj", "Storjshare"]],

    [Currency.AMP, ["Synero AMP", "Synero"]],
    [Currency.ARDR, ["Ardor"]],
    [Currency.BCN, ["Bytecoin"]],
    [Currency.BCY, ["BitCrystals"]],
    [Currency.BELA, ["Belacoin"]],
    [Currency.BLK, ["BlackCoin"]],
    [Currency.BTCD, ["BitcoinDark"]],
    [Currency.BTM, ["Bitmark"]],
    [Currency.BURST, ["Burst"]],
    [Currency.DCR, ["Decred"]],
    [Currency.DGB, ["DigiByte"]],
    [Currency.EMC2, ["Einsteinium"]],
    [Currency.ETC, ["Ethereum Classic", "Ether Classic"]],
    [Currency.EXP, ["Expanse"]],
    [Currency.FLDC, ["FoldingCoin"]],
    [Currency.FLO, ["Florincoin"]],
    [Currency.GAME, ["GameCredits"]],
    [Currency.GRC, ["Gridcoin Research"]],
    [Currency.HUC, ["Huntercoin"]],
    [Currency.LBC, ["LBRY Credits"]],
    [Currency.LSK, ["Lisk"]],
    [Currency.NAUT, ["Nautiluscoin", "Nautilus"]],
    [Currency.NAV, ["NAVCoin"]],
    [Currency.NEO, ["Neoscoin", "NeoCoin", "NEO"]],
    [Currency.NMC, ["Namecoin"]],
    [Currency.NOTE, ["DNotes"]],
    [Currency.NXC, ["Nexium"]],
    [Currency.NXT, ["NXT"]],
    [Currency.OMNI, ["Omni"]],
    [Currency.PASC, ["PascalCoin", "Pascal"]],
    [Currency.PINK, ["Pinkcoin"]],
    [Currency.POT, ["PotCoin"]],
    [Currency.PPC, ["Peercoin"]],
    [Currency.RADS, ["Radium"]],
    [Currency.RIC, ["Riecoin"]],
    [Currency.SBD, ["Steem Dollars"]],
    [Currency.STRAT, ["Stratis"]],
    [Currency.SYS, ["Syscoin"]],
    [Currency.VIA, ["Viacoin"]],
    [Currency.VRC, ["VeriCoin"]],
    [Currency.VTC, ["Vertcoin"]],
    [Currency.XBC, ["BitcoinPlus", "Bitcoin Plus"]],
    [Currency.XPM, ["Primecoin"]],
    [Currency.XVC, ["Vcash"]],
    [Currency.USDT, ["US Dollar Tethered"]],
    [Currency.BCH, ["BitCoin Cash", "BCH", "BCC"]], // BitConnect is dead, Bittrex calls it BCC
    [Currency.EOS, ["EOS"]],
    [Currency.IOTA, ["IOTA", "MIOTA"]],
    [Currency.OMG, ["OMG", "OmiseGO"]],
    [Currency.SAN, ["SAN", "Santiment"]],
    [Currency.ETP, ["ETP", "Metaverse"]],
    [Currency.QTM, ["QTM", "Qtum"]],
    [Currency.AVT, ["ETP", "Aventus"]],
    [Currency.EDO, ["EDO", "Eidoo"]],
    [Currency.BTG, ["BTG", "BitCoin Gold"]],
    [Currency.DAT, ["DAT", "Streamr"]],
    [Currency.QASH, ["QASH"]],
    [Currency.YYW, ["YYW", "YOYOW"]],
    [Currency.ADA, ["ADA", "Cardano"]],
    [Currency.BCC, ["BCC", "BitConnect"]],
    [Currency.MONA, ["MONA", "MonaCoin", "Mona Coin", "Mona"]],
    [Currency.WAVES, ["WAVES"]],
    [Currency.PPT, ["PPT", "Populous"]],
    [Currency.HSR, ["HSR", "Hshare"]], // TODO reddit
    [Currency.SALT, ["SALT"]],
    [Currency.KMD, ["KMD", "Komodo"]],
    [Currency.TRX, ["TRX", "TRON"]],
    [Currency.BAT, ["BAT", "Basic Attention Token"]],
    [Currency.CVC, ["CVC", "Civic"]],
    [Currency.XVG, ["XVG", "Verge"]],
    [Currency.PIVX, ["PIVX"]],
    [Currency.VERI, ["VERI", "Veritaseum"]], // TODO reddit
    [Currency.ARK, ["ARK", "Ark"]],
    [Currency.NANO, ["XRB", "RaiBlocks", "Nano"]],
    [Currency.ETN, ["ETN", "Electroneum"]],
    [Currency.SNT, ["SNT", "Status"]],
    [Currency.BNB, ["BNB", "Binance Coin", "BinanceCoin"]],
    [Currency.PAY, ["PAY", "TenX"]],
    [Currency.GBYTE, ["GBYTE", "Byteball Bytes", "ByteballBytes"]],
    [Currency.WTC, ["WTC", "Walton"]],
    [Currency.VET, ["VET", "VEN", "VeChain"]], // rebranded VET -> VEN
    [Currency.POWR, ["POWR", "Power Ledger", "PowerLedger"]],
    [Currency.ZRX, ["ZRX", "0x"]],
    [Currency.BYTM, ["BYTM", "BTM", "Bytom"]],
    [Currency.RDD, ["ReddCoin", "Redd Coin"]],
    [Currency.XZC, ["ZCoin", "Z Coin"]],
    [Currency.DGD, ["DigixDAO", "Digix DAO"]],
    [Currency.KNC, ["Kyber Network", "KyberNetwork"]],
    [Currency.AE, ["Aeternity"]],
    [Currency.GAS, ["Gas"]], // NEO contract currency, no own network + reddit
    [Currency.AION, ["Aion"]],
    [Currency.MANA, ["MNA", "Decentraland"]],
    [Currency.FUN, ["FunFair", "Fun Fair"]],
    [Currency.TNB, ["Time New Bank", "TimeNewBank"]],
    [Currency.SPANK, ["SpankChain", "Spank Chain", "SPK"]],
    [Currency.SNM, ["SONM"]],
    [Currency.LUN, ["Lunyr"]],
    [Currency.ZCL, ["ZClassic", "Z Classic"]],
    [Currency.NAS, ["Nebulas"]],
    [Currency.SRN, ["SIRIN LABS Token", "SIRIN"]],
    [Currency.ENG, ["Enigma"]],
    [Currency.REQ, ["Request Network"]],
    [Currency.NXS, ["Nexus"]],
    [Currency.LINK, ["ChainLink", "Chain Link"]],
    [Currency.GXS, ["GXShares", "GX Shares"]],
    [Currency.NEBL, ["Neblio"]],
    [Currency.BNT, ["Bancor"]],
    [Currency.SUB, ["Substratum"]],
    [Currency.QSP, ["Quantstamp"]],
    [Currency.MED, ["MediBloc", "Medi Bloc"]],
    [Currency.EMC, ["Emercoin"]],
    [Currency.XP, ["ExperiencePoints", "Experience Points"]],
    [Currency.BTX, ["Bitcore"]],
    [Currency.ICX, ["ICON"]],
    [Currency.MKR, ["Maker", "MakerDAO", "Maker DAO"]],
    [Currency.KCS, ["KuCoin Shares", "KuCoin"]],
    [Currency.RHOC, ["RChain"]],
    [Currency.IOST, ["IOStoken"]],
    [Currency.WAX, ["WAX"]],
    [Currency.ETHOS, ["Ethos"]],
    [Currency.DCN, ["Dentacoin"]],
    [Currency.LRC, ["Loopring"]],
    [Currency.CND, ["Cindicator"]],
    [Currency.ZEN, ["ZenCash", "Zen Cash"]],
    [Currency.DRGN, ["Dragonchain", "Dragon chain"]],
    [Currency.ELF, ["aelf"]], // TODO reddit
    [Currency.CNX, ["Cryptonex"]], // TODO reddit
    [Currency.SMART, ["SmartCash", "Smart Cash"]],
    [Currency.DENT, ["Dent"]],
    [Currency.KIN, ["Kin"]],
    [Currency.PART, ["Particl"]],
    [Currency.PLR, ["Pillar"]],
    [Currency.RDN, ["Raiden Network Token", "Raiden"]],
    [Currency.ICN, ["Iconomi"]],
    [Currency.XDN, ["DigitalNote", "Digital Note"]],
    [Currency.STORM, ["Storm"]],
    [Currency.XPA, ["XPlay"]], // TODO reddit
    [Currency.RLC, ["iExec RLC", "iExec"]],
    [Currency.UBQ, ["Ubiq"]],
    [Currency.POE, ["Po.et"]],
    [Currency.ENJ, ["Enjin Coin", "EnjinCoin"]],
    [Currency.SPHTX, ["SophiaTX"]],
    [Currency.DEW, ["DEW"]], // TODO reddit
    [Currency.PPP, ["PayPie", "Pay Pie"]],
    [Currency.BLOCK, ["Blocknet"]],
    [Currency.SKY, ["Skycoin", "Sky coin"]],
    [Currency.BCO, ["BridgeCoin", "Bridge Coin"]], // TODO reddit
    [Currency.AST, ["AirSwap", "Air Swap"]],
    [Currency.PAC, ["PACcoin", "PA Ccoin"]],
    [Currency.ANT, ["Aragon"]],
    [Currency.ACT, ["Achain"]],
    [Currency.BIX, ["Bibox Token", "BiboxToken"]],
    [Currency.LEND, ["ETHLend", "ETH Lend"]],
    [Currency.HPB, ["High Performance Blockchain"]],
    [Currency.COB, ["Cobinhood"]],
    [Currency.MCO, ["Monaco"]],
    [Currency.VIBE, ["Vibe"]],
    [Currency.KORE, ["Kore"]],
    [Currency.MUE, ["MonetaryUnit", "Monetary Unit"]],
    [Currency.WINGS, ["Wings DAO"]],
    [Currency.ENRG, ["EnergyCoin", "Energy Coin"]],
    [Currency.NEOS, ["NeosCoin"]],

    [Currency.USD, ["US Dollar"]],
    [Currency.EUR, ["Euro"]]
])

/**
 * Get alternative currency symbol. Useful if a coin get's a rebranding. Conversion is done BOTH ways
 * @param {string} currencyStr
 * @returns {string}
 */
export function getAlternativSymbol(currencyStr: string): string {
    const conversions = {}
    conversions["STR"] = "XLM";
    conversions["IOTA"] = "MIOTA";
    conversions["QTM"] = "QTUM";
    conversions["STORJ"] = "SJCX";
    if (conversions[currencyStr])
        return conversions[currencyStr];
    for (let key in conversions)
    {
        if (conversions[key] === currencyStr)
            return key;
    }
    return "";
}

//export type CurrencyPair = [Currency, Currency];
export type CurrencyPairNr = [number, number];
export class CurrencyPair {
    public from: Currency;
    public to: Currency;

    constructor(from: Currency, to: Currency) {
        this.from = from;
        this.to = to;
    }

    public static fromString(pairStr: string): CurrencyPair {
        let parts = pairStr.split("_");
        if (parts.length !== 2)
            return null;
        return new CurrencyPair(Currency[parts[0]], Currency[parts[1]]);
    }

    public static fromNr(nr: CurrencyPairNr) {
        return new CurrencyPair(nr[0], nr[1]);
    }

    public toString() {
        return Currency[this.from] + "_" + Currency[this.to]
    }

    public toNr(): CurrencyPairNr { // to reduce storage size in mongodb
        return [this.from, this.to]
    }

    public equals(o: any) { // not part of JS. better override valueOf() ?
        return o instanceof CurrencyPair && o.from === this.from && o.to === this.to;
    }

    public getBase(): string {
        return Currency[this.from];
    }

    public getQuote(): string {
        return Currency[this.to];
    }
}

export enum Exchange {
    ALL = 1, // for global stats
    POLONIEX = 2,
    OKEX = 3,
    KRAKEN = 4,
    BITFINEX = 5,
    BITTREX = 6,
    BINANCE = 7,
    BITMEX = 8
}

export const ExchangeName = new Map([
    ["Poloniex", Exchange.POLONIEX],
    ["OKEX", Exchange.OKEX],
    ["Kraken", Exchange.KRAKEN],
    ["Bitfinex", Exchange.BITFINEX],
    ["Bittrex", Exchange.BITTREX],
    ["Binance", Exchange.BINANCE],
    ["BitMEX", Exchange.BITMEX]
])

export enum TradingAccount {
    EXCHANGE = 1,
    MARGIN = 2,
    LENDING = 3
}

export enum Unit {
    ASSET = 1,
    BTC = 2,
    USD = 3
}

// some exchanges use different labels (for example only 3 letters for all currencies)
// internally we only use enums in our app (stored as numbers in DB)

export interface ExchangeCurrencyList {
    [key: string]: /*number | */string; // name and amount as string
}

export interface LocalCurrencyList {
    [key: string]: number; // name as Currency numeric string and amount as number
}

export interface CurrencyMap {
    [nr: string]: string;
}

export interface ExchangeCurrencies {
    // get the local/remote name of a currency. return undefined if that currency is not supported
    getExchangeName(localCurrencyName: string): string;
    getLocalName(exchangeCurrencyName: string): string;

    getExchangePair(localPair: CurrencyPair): string;
    getLocalPair(exchangePair: string): CurrencyPair;

    // returns ticker data for a single currency pair (returns undefined if the pair is not supported)
    toLocalTicker(exchangeTicker: any): Ticker;
}

export interface ExternalExchangeTicker {
    toExternalTicker(exchangeTicker: any): ExternalTicker;
}

export function isExternalExchangeTicker(currencies: any): currencies is ExternalExchangeTicker {
    return currencies && typeof currencies.toExternalTicker === "function";
}

export function toExchange(cur: Currency, exchangeCurrencies: ExchangeCurrencies = null): string {
    let currencyStr = Currency[cur]; // 2 -> LTC
    if (exchangeCurrencies)
        currencyStr = exchangeCurrencies.getExchangeName(currencyStr)
    return currencyStr;
}

export function fromExchange(cur: string, exchangeCurrencies: ExchangeCurrencies = null): Currency {
    if (exchangeCurrencies)
        cur = exchangeCurrencies.getLocalName(cur)
    let currencyNumber = Currency[cur]; // LTC -> 2
    return currencyNumber;
}

export function toExchangeList(currencies: LocalCurrencyList, exchangeCurrencies: ExchangeCurrencies = null): ExchangeCurrencyList {
    let resultList = {}
    for (let prop in currencies)
    {
        const nameStr = Currency[prop];
        let key = toExchange(nameStr, exchangeCurrencies)
        if (key !== undefined) // only convert currencies our app supports
            resultList[nameStr] = currencies[prop]
    }
    return resultList
}

export function fromExchangeList(currencies: ExchangeCurrencyList, exchangeCurrencies: ExchangeCurrencies = null): LocalCurrencyList {
    let resultList = {}
    for (let prop in currencies)
    {
        let key = fromExchange(prop, exchangeCurrencies)
        if (key !== undefined) { // only convert currencies our app supports
            resultList[key] = parseFloat(currencies[prop])
            if (resultList[prop] === Number.NaN)
                resultList[prop] = 0;
        }
    }
    return resultList;
}

export function getCurrencyMap(): CurrencyMap {
    let map: CurrencyMap = {}; // use simple object, Map object can't be serialized to JSON
    let keyList = Object.keys(Currency);
    for (let key of keyList)
    {
        if (key.match("^[0-9]+$") === null)
            continue;
        let name = Currency[key];
        if (name) // skip undefined values
            map[key] = name;
    }
    return map;
}

export function getExchangeName(exchange: Exchange): string {
    // reverse lookup value -> key for ExchangeName map
    for (let ex of ExchangeName)
    {
        if (ex[1] === exchange)
            return ex[0];
    }
    return "";
}

export function listExchangeNames(): string[] {
    let names = [];
    for (let ex of ExchangeName)
        names.push(ex[0]);
    return names;
}

export function getCurrencyNr(currency: Currency): number {
    if (currency.toString().match("^[0-9]+$") !== null)
        return parseInt(currency.toString());
    return parseInt(Currency[currency]);
}

export function getCurrencyLabel(currency: Currency): string {
    if (currency.toString().match("^[0-9]+$") === null)
        return currency.toString();
    return Currency[currency];
}