import {AssetAction} from "./base/AssetAction";
import {CurrencyPair, Exchange} from "./base/Currency";
import {TradeType} from "./Trade";


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
        return liq;
    }
}