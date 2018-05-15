import {DatabaseObject} from "../base/DatabaseObject";
import {Currency} from "../base/Currency";

export const enum SocialActionType {
    SocialPost = 1,
    Tweet = 2,
    TrollShout = 3,
    News = 4
}
export interface Sentiment {
    score: number;
    comparative: number;
}

export abstract class SocialAction extends DatabaseObject {
    public type: SocialActionType;
    public date: Date;
    public author: string;
    public currency: Currency[];
    public sentiment: Sentiment;
    public reply: boolean; // a reply or a new thread
    public uniqueID: string; // needed to filter duplicates

    constructor() {
        super()
    }

    /**
     * A function that must set the uniqueID property so that we can identify duplicate posts.
     */
    public abstract init(): void;
}