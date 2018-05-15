import {DatabaseObject} from "./base/DatabaseObject";

export const COLLECTION_NAME = 'conversations'
export const EXCLUDE_FIELDS = {
    messages: 0
}

export enum STATE {
    // open states
    OPEN = 1,
    WAITING_ANSWER = 2,

    // closed states
    RESOLVED = 10,
    CLOSED = 11
}

export class Conversation extends DatabaseObject {
    public title: string;
    public from: string;
    public email = ""                           // alternative to "from" for unregistered users
    public started: Date = null                 // Date

    public lastMessage: Date = null             // Date
    public newMessages = false
    public messageCount = 0
    public messages: Message[] = []
    public custom: any = null                   // custom meta information (such as the details about the user IP, browser,...)
    public state: STATE = STATE.OPEN

    constructor(title = "", from = "") {
        super()
        this.title = title
        this.from = from
    }

    updateTimestamps() {
        if (this.messages.length === 0)
            return
        this.messageCount = this.messages.length
        let last = this.messages[this.messages.length-1]
        this.lastMessage = last.sent;
        this.newMessages = last.seen == null;
    }
}

export class Message {
    public text: string;

    public from: string;                        // user token or ""
    public email = "";
    public phone = "";
    public address: string[] = [];              // company name, representative, address,....

    // more fields (project specific)
    public name = "";
    public company = "";
    public subject?: string;                    // temporarily, moved to Conversation when storing

    public sent: Date = null
    public seen: Date = null

    constructor(text = "", from = "") {
        //this.title = title
        this.text = text

        this.from = from
    }
}

export function init(conv): Conversation {
    conv = Object.assign(new Conversation(), conv)
    return conv
}

export function getInitFunctions(db) {
    return [
        (callback) => {
            db.createCollection(COLLECTION_NAME, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                title: 1 // asc
            }, {
                name: COLLECTION_NAME + 'TitleIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                started: 1 // asc
            }, {
                name: COLLECTION_NAME + 'StartedIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                lastMessage: 1 // asc
            }, {
                name: COLLECTION_NAME + 'LastMessageIndex'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                state: 1 // asc
            }, {
                name: COLLECTION_NAME + 'StateIndex'
            }, callback);
        }
    ];
}