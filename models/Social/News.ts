import {SocialPost} from "./SocialPost";
import {Sentiment, SocialActionType} from "./SocialAction";

export class News extends SocialPost {
    public sentimentHeadline: Sentiment;

    constructor() {
        super()
        this.type = SocialActionType.News;
    }
}