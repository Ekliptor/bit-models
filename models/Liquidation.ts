import {AssetAction} from "./base/AssetAction";
import {CurrencyPair} from "./base/Currency";
import {TradeType} from "./Trade";


export class Liquidation extends AssetAction {
    constructor() {
        super()
    }

    public static createLiquidation(currencyPair: CurrencyPair, type: "buy" | "sell", amount: number, rate: number, tradeID: string | number = ""): Liquidation {
        let liq = new Liquidation();
        liq.currencyPair = currencyPair;
        liq.type = type === "buy" ? TradeType.BUY : TradeType.SELL;
        liq.amount = amount;
        liq.rate = rate;
        liq.date = new Date();
        liq.init(tradeID);
        return liq;
    }
}