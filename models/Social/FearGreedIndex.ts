import {DatabaseObject} from "../base/DatabaseObject";

export const COLLECTION_NAME = 'fearGreedIndex'

export class FearGreedIndex extends DatabaseObject {
    public value: number;
    public valueYesterday: number = 0;
    public date: Date;      // date when the index was updated (crawled from website)

    constructor(value: number, date: Date) {
        super()
        this.value = value;
        this.date = date;
    }

    public equals(o: any): boolean {
        if (o instanceof FearGreedIndex === false)
            return false;
        return o.value === this.value && o.valueYesterday === this.valueYesterday;
    }
}

export function init(doc): FearGreedIndex {
    return Object.assign(new FearGreedIndex(doc.value, doc.date), doc)
}

export function initMany(docs: any[]): FearGreedIndex[] {
    for (let i = 0; i < docs.length; i++)
        docs[i] = init(docs[i])
    return docs
}

export async function getLatest(db): Promise<FearGreedIndex> {
    let collection = db.collection(COLLECTION_NAME)
    let result = await collection.find({}).sort({date: -1}).limit(1).toArray();
    if (!result || result.length == 0)
        throw new Error("Unable to read latest fear greed index from database. No data?");
    return init(result[0]);
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
        }
    ];
}
