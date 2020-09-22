// TODO add types for all the functions returning messages

import {ObjectID} from "mongodb";

export const COLLECTION_NAME = 'sysMessages' // prefix "system" will cause mongoclient to display it under "System" instead of "Collections"
export const MAX_RESULTS = 8000
export const SEEN_COUNT_CACHE_SEC = 30
export const EXCLUDE_FIELDS = {
    text: 0,
    data: 0
}

class SeenCountCache {
    public loadedTime: Date = new Date(0);
    public count: number = 0;
    constructor() {
    }
    public update(count: number) {
        this.count = count;
        this.loadedTime = new Date();
    }
}

let connection = null
let autoSave = true
let lastSeenCache = new SeenCountCache();

export interface MessageAttributes {
    sender?: string;
    email?: string;
    data?: any;
    site?: string;
}

export class SystemMessageData {
    public title: string;
    public message = '';
    public callback: (err?: any) => void = null

    /**
     * Create an store a message in database (if autoSave enabled)
     * @param title
     * @param messages msg1, msg2, ..., callback()
     */
    constructor(title: string, ...messages) { /// waiting for ...message to work in nodejs
        this.title = title
        this.message = ''
        this.callback = null
        for (let i = 1; i < arguments.length; i++) {
            let message = arguments[i]
            let msgType = typeof message
            if (this.message !== '')
                this.message += "\r\n"
            if (arguments[i] === null || msgType === 'string' || msgType === 'number' || msgType === 'boolean')
                this.message += message
            else if (i === arguments.length-1 && msgType === 'function')
                this.callback = message
            else
                this.message += JSON.stringify(message, null, 4)
        }
        if (autoSave)
            this.save({}, this.callback)
    }

    save(attributes: MessageAttributes = {}, callback) {
        let collection = connection.collection(COLLECTION_NAME)
        collection.insertOne({
            sender: attributes.sender ? attributes.sender : 'SystemError',
            email: attributes.email ? attributes.email : '',
            subject: this.title,
            text: this.message,
            data: attributes.data ? attributes.data : null, // arbitrary object
            created: new Date(),
            seen: null,                                     // date,
            site: attributes.site ? attributes.site : ''
        }, (err) => {
            callback && callback(err)
        })
    }

    static list(_id = null, callback = null) {
        let query = this._getIdQuery(_id)
        let excludeFields = _id ? {} : EXCLUDE_FIELDS
        let collection = connection.collection(COLLECTION_NAME)
        collection.find(query, {projection: excludeFields}).sort({created: -1}).limit(MAX_RESULTS).toArray((err, docs) => {
            if (err)
                return callback && callback(null)
            if (_id) // return one doc
                return callback && callback(docs.length !== 0 ? docs[0] : null)
            callback && callback(docs)// return all docs
        })
    }

    static countNew(callback) {
        if (lastSeenCache.loadedTime.getTime() + SEEN_COUNT_CACHE_SEC*60*1000 > Date.now()) {
            setTimeout(() => { // returning sync might break the control flow of some calls
                callback && callback(lastSeenCache.count)
            }, 0)
            return;
        }
        let collection = connection.collection(COLLECTION_NAME)
        collection.count({seen: null}).then((count) => {
            lastSeenCache.update(count);
            callback && callback(count)
        })
    }

    static markSeen(_id, callback?) {
        let query = this._getIdQuery(_id)
        let collection = connection.collection(COLLECTION_NAME)
        collection.updateMany(query, {$set: {seen: new Date()}}, (err, result) => {
            callback && callback(err)
        })
    }

    static remove(_id, callback?) {
        let query = this._getIdQuery(_id)
        let collection = connection.collection(COLLECTION_NAME)
        collection.deleteMany(query, (err, result) => {
            callback && callback(err)
        })
    }

    static createCollection(callback) {
        connection.createCollection(COLLECTION_NAME, (err, collection) => {
            if (err)
                return callback && callback(err)
            connection.createIndex(COLLECTION_NAME, {
                created: -1 // desc
            }, {
                background: true,
                name: 'sysMesCreatedIndex'
            }, (err, indexName) => {
                if (err)
                    return callback && callback(err)
                connection.createIndex(COLLECTION_NAME, {
                    subject: 'text'
                }, {
                    name: 'sysMesSubjectIndex'
                }, (err, indexName) => {
                    connection.createIndex(COLLECTION_NAME, {
                        seen: 1 // asc
                    }, {
                        background: true,
                        name: 'sysMesSeenIndex'
                    }, (err, indexName) => {
                        if (err)
                            return callback && callback(err)
                        callback && callback()
                    })
                })
            })
        })
    }

    static _getIdQuery(_id) {
        return _id ? {
            _id: typeof _id === 'string' ? new ObjectID(_id) : _id
        } : {}
    }
}

export function SystemMessage(dbConnection = null, save = true) {
    if (dbConnection) // if null the last one will be kept
        connection = dbConnection
    autoSave = save
    return SystemMessageData // return the constructor
}
