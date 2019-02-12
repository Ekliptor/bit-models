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
    //HSR = 165, // removed (from CMC, and everywhere?)
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
    NXS = 204,
    LINK = 205,
    GXS = 206,
    NEBL = 207,
    BNT = 208,
    SUB = 209,
    QSP = 210,
    MED = 211,
    EMC = 212,
    XP = 213,
    BTX = 214,
    ICX = 215,
    MKR = 216,
    KCS = 217,
    RHOC = 218,
    IOST = 219,
    WAX = 220,
    ETHOS = 221,
    DCN = 222,
    LRC = 223,
    CND = 224,
    ZEN = 225,
    DRGN = 226,
    ELF = 227,
    CNX = 228,
    SMART = 239, // also SmartCash with same symbol on CoinMarketCap
    DENT = 240,
    KIN = 241,
    PART = 242,
    PLR = 243,
    RDN = 244,
    ICN = 245, // also iCoin
    XDN = 246,
    STORM = 247,
    XPA = 248,
    RLC = 249,
    UBQ = 250,
    POE = 251,
    ENJ = 252,
    SPHTX = 253,
    DEW = 254,
    PPP = 255,
    BLOCK = 256,
    SKY = 257,
    BCO = 258,
    AST = 259,
    PAC = 260,
    ANT = 261,
    ACT = 262,
    BIX = 263,
    LEND = 264,
    HPB = 265,
    COB = 266,
    MCO = 267,
    VIBE = 268,
    KORE = 269,
    MUE = 270,
    WINGS = 271,
    ENRG = 272,
    NEOS = 273, // not NEO
    XTZ = 274,
    ZIL = 275,
    ONT = 276,
    MOAC = 277,
    BCD = 278,
    NPXS = 279,
    AOA = 280,
    MITH = 281,
    CMT = 282, // or Comet, very low market cap
    HOT = 283,
    WAN = 284,
    XIN = 285,
    HT = 286,
    DROP = 287,
    BTCP = 288,
    ELA = 289,
    THETA = 290,
    NULS = 291,
    TTU = 292,
    LOOM = 293,
    ODE = 294,
    POLY = 295,
    CTXC = 296,
    BSV = 297, // Bitcoin SV
    TWOGIVE = 298,
    ABY = 299,
    ADT = 350,
    ADX = 351,
    AEON = 352,
    AUR = 353,
    BAY = 354,
    BCPT = 355,
    BITB = 356,
    BLITZ = 357,
    BRK = 358,
    BRX = 359, // no reddit yet
    BSD = 360,
    BYC = 361,
    CANN = 362,
    CFI = 363,
    CLOAK = 364,
    COVAL = 365,
    CRW = 366,
    CURE = 367,
    DCT = 368,
    DMD = 369,
    DNT = 370,
    DOPE = 371,
    DTB = 372,
    DYN = 373,
    EBST = 374,
    EDG = 375,
    EFL = 376,
    EGC = 377,
    ERC = 378,
    EXCL = 379,
    FAIR = 380,
    FTC = 381,
    GAM = 382,
    GBG = 383,
    GCR = 384,
    GEO = 385,
    GLD = 386,
    GOLOS = 387,
    GRS = 388,
    GTO = 389,
    GUP = 390,
    GVT = 391,
    HC = 392,
    HMQ = 393,
    INCNT = 394,
    IGNIS = 395,
    INS = 396,
    IOC = 397,
    ION = 398,
    IOP = 399,
    IOTX = 400,
    KEY = 401,
    LGD = 402,
    MDA = 403,
    MEME = 404,
    MER = 405,
    MFT = 406,
    MLN = 407,
    MOD = 408,
    MTH = 409,
    MTL = 410,
    MUSIC = 411,
    //NAS = 412,
    USNBT = 413,
    NCASH = 414,
    NLG = 415,
    NMR = 416,
    //NULS = 417,
    OAX = 418,
    OK = 419,
    OST = 420,
    //PDC = 421, // PAY
    PHX = 422,
    PKB = 423,
    POA = 424,
    //POLY = 425,
    PTC = 426,
    PTOY = 427,
    QKC = 428,
    QLC = 429,
    QRL = 430,
    QWARK = 431,
    RBY = 432,
    RCN = 433,
    REN = 434,
    //RLC = 435,
    RVN = 436,
    RVR = 437,
    SEQ = 438,
    SHIFT = 439,
    SIB = 440,
    SLR = 441,
    SLS = 442,
    SNGLS = 443,
    SPHR = 444,
    //SRN = 445,
    SWT = 446,
    SYNX = 447,
    THC = 448,
    //THETA = 449,
    TIX = 450,
    TKS = 451,
    TNT = 452,
    TUBE = 453,
    TX = 454,
    UKG = 455,
    UP = 456,
    VEE = 457,
    VIB = 458,
    VRM = 459,
    //VTR = 460,
    WABI = 461,
    WPR = 462,
    XEL = 463,
    XMY = 464,
    XST = 465,
    XWC = 466,
    PRO = 467,
    BTT = 468,

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
    return currency < 300 && currency !== 200; // thether is a crypto strictly speaking
}

// mapping of Currency. needed for parsing trollbox & social media
// note: it is not neccessarry to add the currency symbol as value too
export const CurrencyName = new Map([
    [Currency.BTC, ["BitCoin", "XBT"]],
    [Currency.LTC, ["Litecoin"]],
    [Currency.ETH, ["Ethereum", "Ether"]],
    [Currency.XRP, ["Ripple"]],
    [Currency.XMR, ["Monero"]],
    [Currency.DASH, ["Dashcoin", "Dash coin"]],
    [Currency.FCT, ["Factom"]],
    [Currency.DOGE, ["Dogecoin", "Doge coin"]],
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
    [Currency.BCH, ["Bitcoin Cash", "BitcoinCash", "BCC", "BCash"]], // BitConnect is dead, Bittrex calls it BCC
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
    //[Currency.HSR, ["Hshare"]],
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
    [Currency.PAY, ["PAY", "TenX"]], // renamed
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
    [Currency.ZEN, ["ZenCash", "Zen Cash", "Horizen"]], // renamed to Horizen
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
    [Currency.XTZ, ["Tezos"]],
    [Currency.ZIL, ["Zilliqa"]],
    [Currency.ONT, ["Ontology"]],
    [Currency.MOAC, ["MOAC"]],
    [Currency.BCD, ["Bitcoin Diamond", "BitcoinDiamond"]],
    [Currency.NPXS, ["Pundi X", "PundiX"]],
    [Currency.AOA, ["Aurora"]],
    [Currency.MITH, ["Mithril"]],
    [Currency.CMT, ["CyberMiles", "Cyber Miles"]],
    [Currency.HOT, ["Holo"]],
    [Currency.WAN, ["Wanchain"]],
    [Currency.XIN, ["Mixin"]],
    [Currency.HT, ["Huobi Token", "HuobiToken"]],
    [Currency.DROP, ["Dropil"]],
    [Currency.BTCP, ["Bitcoin Private", "BitcoinPrivate"]],
    [Currency.ELA, ["Elastos"]],
    [Currency.THETA, ["Theta Token", "ThetaToken"]],
    [Currency.NULS, ["Nuls"]],
    [Currency.TTU, ["TaTaTu"]],
    [Currency.LOOM, ["Loom Network", "LoomNetwork"]],
    [Currency.ODE, ["ODEM"]],
    [Currency.POLY, ["Polymath"]],
    [Currency.CTXC, ["Cortex"]],
    [Currency.BSV, ["Bitcoin SV", "Bitcoin Cash SV"]],
    [Currency.TWOGIVE, ["2GIVE"]],
    [Currency.ABY, ["ArtByte", "Art Byte"]],
    [Currency.ADT, ["adToken", "ad Token"]],
    [Currency.ADX, ["AdEx"]],
    [Currency.AEON, ["Aeon"]],
    [Currency.AUR, ["Auroracoin", "Aurora coin"]],
    [Currency.BAY, ["BitBay", "Bit Bay"]],
    [Currency.BCPT, ["BlockMasonCreditProtocol", "BlockMasonCredit", "Block Mason Credit"]],
    [Currency.BITB, ["BeanCash", "Bean Cash"]],
    [Currency.BLITZ, ["BANKEX"]],
    [Currency.BRK, ["Breakout"]],
    [Currency.BRX, ["BreakoutStake", "Breakout Stake"]],
    [Currency.BSD, ["BitSend"]],
    [Currency.BYC, ["Burst"]],
    [Currency.CANN, ["CannabisCoin", "Cannabis Coin"]],
    [Currency.CFI, ["CashBetCoin", "Cash Bet"]],
    [Currency.CLOAK, ["CloakCoin", "Cloak Coin"]],
    [Currency.COVAL, ["CircuitsofValue", "Circuitsof Value"]],
    [Currency.CRW, ["Crown"]],
    [Currency.CURE, ["Curecoin"]],
    [Currency.DCT, ["DECENT"]],
    [Currency.DMD, ["Diamond"]],
    [Currency.DNT, ["district0x"]],
    [Currency.DOPE, ["DopeCoin", "Dope Coin"]],
    [Currency.DTB, ["Databits"]],
    [Currency.DYN, ["Dynamic"]],
    [Currency.EBST, ["eBoost"]],
    [Currency.EDG, ["Edgeless"]],
    [Currency.EFL, ["EndorProtocol", "Endor Protocol"]],
    [Currency.EGC, ["EverGreenCoin", "Ever Green Coin"]],
    [Currency.ERC, ["EnjinCoin", "Enjin Coin"]],
    [Currency.EXCL, ["ExclusiveCoin", "Exclusive Coin"]],
    [Currency.FAIR, ["FairGame"]],
    [Currency.FTC, ["Feathercoin"]],
    [Currency.GAM, ["Gambit"]],
    [Currency.GBG, ["GolosGold", "Golos Gold"]],
    [Currency.GCR, ["ByteballBytes", "Byteball Bytes"]],
    [Currency.GEO, ["GeoCoin", "Geo Coin"]],
    [Currency.GLD, ["GoldCoin", "Gold Coin"]],
    [Currency.GOLOS, ["Golos"]],
    [Currency.GRS, ["Groestlcoin", "Groestl coin"]],
    [Currency.GTO, ["Gifto"]],
    [Currency.GUP, ["Matchpool"]],
    [Currency.GVT, ["GenesisVision", "Genesis Vision"]],
    [Currency.HC, ["HyperCash", "Hyper Cash"]],
    [Currency.HMQ, ["Humaniq"]],
    [Currency.HOT, ["Holo"]],
    [Currency.IGNIS, ["Ignis"]],
    [Currency.INCNT, ["Incent"]],
    [Currency.INS, ["Insolar"]],
    [Currency.IOC, ["I/OCoin"]],
    [Currency.ION, ["ION"]],
    [Currency.IOP, ["InternetOfPeople"]],
    [Currency.IOTX, ["IoTeX"]],
    [Currency.KEY, ["Selfkey"]],
    [Currency.LGD, ["LBRYCredits"]],
    [Currency.MDA, ["MoedaLoyaltyPoints", "Moeda Loyalty Points"]],
    [Currency.MEME, ["Memetic/PepeCoin"]],
    [Currency.MER, ["Mercury"]],
    [Currency.MFT, ["Mainframe"]],
    [Currency.MLN, ["Melon"]],
    [Currency.MOD, ["Modum"]],
    [Currency.MTH, ["Monetha"]],
    [Currency.MTL, ["Metal"]],
    [Currency.MUSIC, ["Musicoin"]],
    [Currency.NAS, ["Nebulas"]],
    [Currency.USNBT, ["NuBits"]],
    [Currency.NCASH, ["NucleusVision", "NucleusVision"]],
    [Currency.NLG, ["Gulden"]],
    [Currency.NMR, ["Numeraire"]],
    [Currency.OAX, ["OAX"]],
    [Currency.OK, ["OKCash"]],
    [Currency.OST, ["OST"]],
    [Currency.PAY, ["PayDay Coin"]],
    [Currency.PHX, ["RedPulsePhoenix"]],
    [Currency.PKB, ["ParkByte"]],
    [Currency.POA, ["POANetwork"]],
    [Currency.PRO, ["Propy"]],
    [Currency.PTC, ["Pesetacoin"]],
    [Currency.PTOY, ["Patientory"]],
    [Currency.QKC, ["QuarkChain"]],
    [Currency.QLC, ["QLCChain"]],
    [Currency.QRL, ["QuantumResistantLedger"]],
    [Currency.QWARK, ["Qwark"]],
    [Currency.RBY, ["Rubycoin"]],
    [Currency.RCN, ["RipioCreditNetwork"]],
    [Currency.REN, ["RepublicProtocol"]],
    [Currency.RVN, ["Ravencoin"]],
    [Currency.RVR, ["RevolutionVR"]],
    [Currency.SEQ, ["Sequence"]],
    [Currency.SHIFT, ["Shift"]],
    [Currency.SIB, ["SIBCoin"]],
    [Currency.SLR, ["SolarCoin"]],
    [Currency.SLS, ["SaluS"]],
    [Currency.SNGLS, ["SingularDTV"]],
    [Currency.SPHR, ["Sphere"]],
    [Currency.SRN, ["SIRINLABSToken"]],
    [Currency.SWT, ["SwarmCity"]],
    [Currency.SYNX, ["Syndicate"]],
    [Currency.THC, ["HempCoin"]],
    [Currency.TIX, ["Blocktix"]],
    [Currency.TKS, ["Tokes"]],
    [Currency.TNT, ["Tierion"]],
    [Currency.TUBE, ["BitTube", "Bit Tube"]],
    [Currency.TX, ["TransferCoin"]],
    [Currency.UKG, ["UnikoinGold"]],
    [Currency.UP, ["UpToken"]],
    [Currency.VEE, ["BLOCKv"]],
    [Currency.VIB, ["Viberate"]],
    [Currency.VRM, ["VeriumReserve"]],
    //[Currency.VTR, ["Vertcoin"]],
    [Currency.WABI, ["Wabi"]],
    [Currency.WAN, ["Wanchain"]],
    [Currency.WPR, ["WePower"]],
    [Currency.XEL, ["XEL"]],
    [Currency.XMY, ["Myriad"]],
    [Currency.XST, ["Stealth"]],
    [Currency.XWC, ["WhiteCoin"]],
    [Currency.BTT, ["BitTorrent", "Bit Torrent"]],

    [Currency.USD, ["US Dollar"]],
    [Currency.EUR, ["Euro"]]
]);

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
        const from = Currency[parts[0]];
        const to = Currency[parts[1]];
        if (!from || !to)
            return null;
        return new CurrencyPair(from, to);
    }

    public static fromNr(nr: CurrencyPairNr) {
        return new CurrencyPair(nr[0], nr[1]);
    }

    public toString() {
        return Currency[this.from] + "_" + Currency[this.to]
    }
    
    public valueOf() {
        return this.from*1000000 + this.to;
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
    BITMEX = 8,
    DERIBIT = 9,
    COINBASEPRO = 10
}

export const ExchangeName = new Map<string, Exchange>([
    ["Poloniex", Exchange.POLONIEX],
    ["OKEX", Exchange.OKEX],
    ["Kraken", Exchange.KRAKEN],
    ["Bitfinex", Exchange.BITFINEX],
    ["Bittrex", Exchange.BITTREX],
    ["Binance", Exchange.BINANCE],
    ["BitMEX", Exchange.BITMEX],
    ["Deribit", Exchange.DERIBIT],
    //["CoinbasePro", Exchange.COINBASEPRO] // not yet implemented
]);

export const ExchangeLink = new Map<string, string>([
    ["Poloniex", "https://poloniex.com"],
    ["OKEX", "https://www.okex.com"],
    ["Kraken", "https://www.kraken.com"],
    ["Bitfinex", "https://bitfinex.com"],
    ["Bittrex", "https://bittrex.com"],
    ["Binance", "https://www.binance.com/?ref=11886203"],
    ["BitMEX", "https://www.bitmex.com/register/NPaVXP"],
    ["Deribit", "https://www.deribit.com/reg-4328.975"],
    ["CoinbasePro", "https://pro.coinbase.com"]
]);

export const ExchangeRecommendedPairs = new Map<string, string[]>([
    ["Poloniex", ["BTC_ETH", "BTC_XRP", "BTC_LTC", "BTC_DOGE", "BTC_XMR", "USDC_BTC", "USDC_ETH", "USDC_XRP"]],
    ["OKEX", ["USD_BTC", "USD_ETH", "USD_LTC", "USD_XRP", "USD_EOS", "USD_BCH"]],
    ["Kraken", ["USD_BTC", "USD_ETH", "USD_BCH", "USD_LTC", "USD_DASH", "USD_XRP", "BTC_ETH", "BTC_BCH", "BTC_XRP"]],
    ["Bitfinex", ["USD_BTC", "USD_ETH", "USD_XRP", "USD_EOS", "USD_BCH", "USD_LTC", "USD_IOTA", "USD_NEO", "BTC_ETH", "BTC_XRP", "BTC_BCH"]],
    ["Bittrex", ["BTC_ETH","BTC_LTC", "BTC_BCH", "BTC_XRP", "BTC_XMR", "BTC_SC", "BTC_DASH", "BTC_TRX", "USD_BTC", "USD_ETH"]],
    ["Binance", ["USDT_BTC", "USDT_ETH", "USDT_BCH", "BTC_ETH", "BTC_LTC", "BTC_ETC", "BTC_BCH", "BTC_IOTA", "BTC_STEEM"]],
    ["BitMEX", ["USD_BTC", "USD_ETH"]],
    ["Deribit", ["USD_BTC"]],
    ["CoinbasePro", ["USD_BTC", "USD_ETH", "USD_BCH", "USD_LTC", "USD_ETC"]]
]);

//export const TwoKeyExchanges = new Set<string>(["Bitfinex"]);

export const NotificationMethods = new Map([
    ["Pushover", true]
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