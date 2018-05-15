import * as utils from "@ekliptor/apputils";
const nconf = utils.nconf
    , logger = utils.logger
import {DatabaseObject} from "./base/DatabaseObject";
import * as crypto from "crypto";
import * as os from "os";

export const COLLECTION_NAME = 'processes'
export const COUNT_ACTIVE_MIN = 5

/**
 * Represents a running node process instance.
 */
export class Process extends DatabaseObject {
    public uniqueID: string = ""; // globally unique (across all hosts)
    public PID: number = 0;
    public hostname: string = "";
    public apiPort: number = 0;
    public name: string = ""; // for display purposes, not unique
    public args: string[] = []; // process.argv
    public data: any = null;
    public firstContact: Date = null;
    public lastContact: Date = null;

    constructor(args: string[]) {
        super();
        this.args = args;
    }

    public init() {
        this.uniqueID = crypto.createHash('sha512').update(JSON.stringify({h: this.hostname, a: this.args}), 'utf8').digest('base64')
    }
}

export function init(process): Process {
    process = Object.assign(new Process(process.args), process)
    return process
}

export function initMany(proc: any[]): Process[] {
    for (let i = 0; i < proc.length; i++)
        proc[i] = init(proc[i])
    return proc
}

export function getProcessObject(data = null) {
    let proc = new Process(process.argv);
    proc.hostname = os.hostname();
    proc.PID = process.pid;
    if (data)
        proc.data = data;
    proc.init();
    return proc;
}

export function setLastActive(db, process: Process = null, cb?) {
    let collection = db.collection(COLLECTION_NAME)
    if (!process)
        process = getProcessObject();

    // first check if this process already existed
    collection.findOne({uniqueID: process.uniqueID}).then((doc) => {
        if (doc)
            process.firstContact = doc.firstContact;
        else
            process.firstContact = new Date();
        process.lastContact = new Date();

        // update the process in DB
        collection.updateOne({uniqueID: process.uniqueID}, process, {upsert: true}, (err, result) => {
            if (err)
                return cb && cb(err);
            cb && cb();
        })
    }).catch((err) => {
        cb && cb(err);
    })
}

export function getActiveCount(db, proc: Process = null) {
    return new Promise<number>((resolve, reject) => {
        let collection = db.collection(COLLECTION_NAME)
        let maxAge = utils.date.dateAdd(new Date(), 'minute', -1*COUNT_ACTIVE_MIN)
        if (!proc)
            proc = getProcessObject();
        collection.count({
            lastContact: {$gt: maxAge},
            uniqueID: {$ne: proc.uniqueID}                  // don't count this process (on restart)
        }).then((count) => {
            resolve(count)
        }).catch((err) => {
            logger.error("Error getting active process count", err);
            resolve(0)
        })
    })
}

export function getInitFunctions(db) {
    return [
        (callback) => {
            db.createCollection(COLLECTION_NAME, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                uniqueID: 1 // asc
            }, {
                name: COLLECTION_NAME + 'UniqueIDIndex',
                unique: true
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                hostname: 1 // asc
            }, {
                name: COLLECTION_NAME + 'HostnameIndex'
            }, callback);
        }
    ];
}