import {SocialPost} from "./SocialPost";
import {SocialActionType} from "./SocialAction";

export class Tweet extends SocialPost {
    constructor() {
        super()
        this.type = SocialActionType.Tweet;
    }
}