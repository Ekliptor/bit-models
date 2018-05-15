import {AssetAction} from "./base/AssetAction";
import {TradeType} from "./Trade";

export const COLLECTION_NAME = 'loanOrders'

export class LoanOrder extends AssetAction {
    public rangeMin: number;
    public rangeMax: number;

    constructor() {
        super()
    }
}

export function init(order): LoanOrder {
    order = Object.assign(new LoanOrder(), order)
    return order
}

export function initMany(orders: any[]): LoanOrder[] {
    for (let i = 0; i < orders.length; i++)
        orders[i] = init(orders[i])
    return orders
}

export function getInitFunctions(db) {
    return [
        (callback) => {
            db.createCollection(COLLECTION_NAME, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                amount: 1 // asc
            }, {
                name: COLLECTION_NAME + 'AmountIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                rate: 1 // asc
            }, {
                name: COLLECTION_NAME + 'RateIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                type: 1 // asc
            }, {
                name: COLLECTION_NAME + 'TypeIndex'
            }, callback);
        }
    ];
}