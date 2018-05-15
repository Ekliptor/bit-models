/**
 * Generic user module for all nodejs projects.
 * Don't use any express or Meteor functions in here!
 */

import {DatabaseObject} from "./base/DatabaseObject";
import * as crypto from "crypto";
import {ObjectID} from "mongodb";

export const COLLECTION_NAME = 'users';
export const MIN_USERNAME_LEN = 3;
export const MIN_PASSWORD_LEN = 6;
export const TOKEN_LEN = 8;
export const SALT_LEN = 40;
export const UPDATE_USER_ACTIVE_SEC = 120;
export const EXCLUDE_FIELDS = {
    actions: 0
}

export enum LEVEL {
    ADMIN = 1,
    CO_ADMIN = 10,
    MOD = 15,
    REGULAR = 30,
    CONFIRMATION_PENDING = 40
}

export const ERROR = { // error values can be used as keys for translations
    // register
    USERNAME_TOO_SHORT: 'usernameTooShort',
    USERNAME_ALREADY_EXISTS: 'usernameAlreadyExists',
    EMAIL_ALREADY_EXISTS: 'emailAlreadyExists',
    PASSWORD_WEAK: 'passwordWeak',
    PASSWORDS_DONT_MATCH: 'passwordsDontMatch',
    INVALID_EMAIL: 'invalidEmail',
    BLOCKED_EMAIL: 'blockedEmail',
    CAPTCHA_ERROR: 'captchaError',
    INTERNAL_ERROR_REGISTER: 'internalErrorRegister',
    //USER_REGISTERED: 'userRegistered', // not an error, but in localization
    // login
    USESR_NOT_FOUND: 'userNotFound',
    //INVALID_PASSWORD: 'invalidPassword', // we use userNotFound to prevent leaking information about our database
    TOO_MANY_LOGIN_ATTEMPTS: 'tooManyLoginAttempts',
    INTERNAL_ERROR_UPDATING_USER: 'internalErrorUpdateUser',

    // app internals
    INVALID_USER: 1
}

export enum PASSWORD_SECURITY {
    WEAK = 0,
    MEDIUM = 1,
    STRONG = 2
}

export type ResultFormat = "csv" | "json";
export type MailType = "smtp";

let userAppData = {
    passwordSecurity: PASSWORD_SECURITY.MEDIUM,
    userUpdateSec: UPDATE_USER_ACTIVE_SEC
}

let getPasswordHash = (passwordPlain, appSalt, userStr, callback) => {
    let secret = appSalt + 'pa#ss@W' + passwordPlain + userStr;
    //return crypto.createHash('sha512').update(secret, 'utf8').digest('base64');
    let salt = passwordPlain.split("").reverse().join("@%") + secret
    // available algorithms depend on the openssl of the OS. so use sha512 and be safe
    crypto.pbkdf2(passwordPlain, salt, 1000, 128, 'sha512', (err, key) => { // 128 bytes = 2x sha512 length. should be enough
        if (err)
            return callback(err)
        callback(null, key.toString('base64'))
    })
}
let getRandomString = function(len) {
    let chars = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let random = ''
    for (let i = 0; i < len; i++)
        random += chars.charAt(Math.floor(Math.random() * chars.length))
    return random
}

export interface UserCallback {
    (err: any, userDoc?: User): void;
}

export interface UserPremiumData {
    expires: Date;
    maxWorks: number;
    customPriceEur: number;
    customTitle: string;
}

export class User extends DatabaseObject {
    public token = "";                                  // unique id used for internals (and possibly for external refs too)
    public username = "";
    public password = "";                               // contains the hash when read from DB
    public passwordRepeat = "";                         // only used for registering, not stored in DB
    public lang = "";
    public email = "";
    public level: LEVEL = LEVEL.CONFIRMATION_PENDING;
    public confirm = "";                                // random string to confirm email. used as salt for password
    public resetConfirm = "";                           // random string sent to email to reset the password
    public joined: Date = null;                         // date
    public lastActive: Date = null;
    public tos = 0;                                     // the terms of service version the user accepted (should be 1 unless we update them)
    public actions = [];
    public site = "";

    // project specific values
    public name = "";
    public company = "";
    public address: string[] = [];
    public taxNr = "";
    public phone = "";

    public resultFormat: ResultFormat = "csv";

    // UI values (not stored in DB)
    public lastIp?: string;
    public lastAction?: string;
    public registrationData?: string;
    public langDisplay?: string;
    public joinedTimestamp?: number;
    public lastActiveTimestamp?: number;
    public premiumDisplay?: string;
    public premiumExpiresTimestamp?: number;

    constructor() {
        super()
    }
}

// we can't use user.prototype because the objects we get from mongoDB are just plain instances of Object
export function init(account): User {
    return Object.assign(new User(), account);
}

export function setPasswordSecurity(securityLevel: PASSWORD_SECURITY) {
    userAppData.passwordSecurity = securityLevel
}

export function setUserUpdateSec(sec: number) {
    userAppData.userUpdateSec = sec
}

/**
 * Register a new user
 * @param db The MongoDB connection
 * @param account the user object
 * @param appSalt A random string for this app
 * @param callback function(err, user)
 */
export function register(db, account, appSalt: string, callback: UserCallback) {
    if (typeof account.username !== 'string' || account.username.length < MIN_USERNAME_LEN)
        return callback(ERROR.USERNAME_TOO_SHORT);
    account.username = account.username ? account.username.trim() : '';
    account.email = account.email ? account.email.trim() : '';
    // check if username exists, to show an error immediately (and not after failed insert)
    let collection = db.collection(COLLECTION_NAME);
    collection.findOne({$or: [{username: account.username}, {email: account.email}]}, {fields: EXCLUDE_FIELDS}).then((doc) => {
        if (doc)
            return callback(doc.email === account.email ? ERROR.EMAIL_ALREADY_EXISTS : ERROR.USERNAME_ALREADY_EXISTS);
        // password strength: https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript/
        let passwordRegex = null
        switch (userAppData.passwordSecurity)
        {
            case PASSWORD_SECURITY.WEAK:
                passwordRegex = new RegExp('[a-z0-9]+', 'i');
                break;
            case PASSWORD_SECURITY.MEDIUM:
                // upper-, lowercase and number
                passwordRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{" + MIN_PASSWORD_LEN + ",})");
                break;
            case PASSWORD_SECURITY.STRONG:
                // medium plus special char required
                passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{" + MIN_PASSWORD_LEN + ",})");
                break;
        }
        if (typeof account.password !== 'string' || account.password.length < MIN_PASSWORD_LEN || passwordRegex.test(account.password) === false)
            return callback(ERROR.PASSWORD_WEAK);
        else if (account.password !== account.passwordRepeat)
            return callback(ERROR.PASSWORDS_DONT_MATCH);
        account.confirm = getRandomString(SALT_LEN);
        let passwordPlain = account.password;
        getPasswordHash(account.password, appSalt, account.confirm, (err, passwordHash) => {
            if (err)
                return callback(ERROR.INTERNAL_ERROR_REGISTER);
            if (!isValidEmail(account.email))
                return callback(ERROR.INVALID_EMAIL);

            // TODO load spam email file and block spam/1-time accounts
            // TODO optional captcha support

            delete account.passwordRepeat;
            account.password = passwordHash;
            account.token = getRandomString(TOKEN_LEN);
            account.joined = new Date();
            account = Object.assign(new User(), account);
            collection.insertOne(account, (err, result) => {
                if (err) {
                    account.password = passwordPlain; // reset values for the input form or api
                    account.passwordRepeat = passwordPlain;
                    account.token = ""; // TODO retry if duplicate token
                    account.joined = null;
                    //console.log(err);
                    return callback(ERROR.INTERNAL_ERROR_REGISTER);
                }
                callback(null, init(result.ops[0])); // return the inserted object
            });
        });
    });
}

/**
 * Gets a user
 * @param db The MongoDB connection
 * @param {string} usernameOrEmail the username or email
 * @param {bool/function} isLogin True if it is a login (to enable brute-force check). Or the callback
 * @param {function} callback (optional) function(err, user)
 */
export function find(db, usernameOrEmail: string, isLogin, callback: UserCallback) {
    // TODO brute-force login check if isLogin
    if (typeof isLogin === 'function') {
        callback = isLogin;
        isLogin = false;
    }
    usernameOrEmail = usernameOrEmail.trim();
    let collection = db.collection(COLLECTION_NAME);
    collection.find({$or: [{username: usernameOrEmail}, {email: usernameOrEmail}]}, EXCLUDE_FIELDS).toArray().then((docs) => {
        let emailLower = usernameOrEmail.toLocaleLowerCase();
        for (let doc of docs) {
            if (doc.username === usernameOrEmail || doc.email.toLocaleLowerCase() === emailLower)
                return callback(null, init(doc));
        }
        return callback(ERROR.USESR_NOT_FOUND);
    });
}

export function findByToken(db, token: string, callback: UserCallback) {
    let collection = db.collection(COLLECTION_NAME);
    collection.findOne({token: token}, {fields: EXCLUDE_FIELDS}).then((doc) => {
        if (doc)
            return callback(null, init(doc));
        return callback(ERROR.USESR_NOT_FOUND);
    });
}

export function isCorrectPassword(userObj, passwordPlain: string, appSalt: string, callback) {
    if (!userObj)
        return callback(false)
    getPasswordHash(passwordPlain, appSalt, userObj.confirm, (err, passwordHash) => {
        if (err)
            return callback(false)
        callback(passwordHash === userObj.password)
    });
}

export function updateUser(db, usernameOrEmail: string, updates, callback) {
    // TODO user leve, email,...
}

export function requestResetPassword(db, usernameOrEmail: string, callback) {
    // TODO...
    // also modifyUser(db, account, [appSalt, ] callback)
    // also brute-force login check and more...
}

export function logAction(db, usernameOrEmail: string, actionName: string, req, customData = {}, callback?) {
    if (typeof customData === 'function') {
        callback = customData;
        customData = {};
    }
    let ips = []
    if (req.cf_ip) // cloudflare-express module
        ips = [req.cf_ip]
    else if (req.ips && req.ips.length !== 0)
        ips = req.ips // express specific solution for trusted proxy
    else if (req.ip)
        ips = [req.ip] // express specific solution without proxy
    else { // default node-js http server
        if (req.headers['x-forwarded-for'])
            ips = req.headers['x-forwarded-for'].split(",").map(ip => ip.trim())
        // the client ip or the ip of the last proxy in front of our app
        // unlike for express above we always add this, because we have no whitelist to know if we can trust the proxy
        // https://expressjs.com/en/guide/behind-proxies.html
        if (ips.length === 0 || (req.connection.remoteAddress !== '127.0.0.1' && req.connection.remoteAddress !== '::1'))
            ips.push(req.connection.remoteAddress)
    }
    let action = {
        name: actionName,
        ips: ips,
        headers: req.headers,
        custom: customData,
        when: new Date()
    }
    usernameOrEmail = usernameOrEmail.trim();
    let collection = db.collection(COLLECTION_NAME);
    collection.find({$or: [{username: usernameOrEmail}, {email: usernameOrEmail}]}, EXCLUDE_FIELDS).toArray().then((docs) => {
        let emailLower = usernameOrEmail.toLocaleLowerCase();
        for (let doc of docs) {
            if (doc.username === usernameOrEmail || doc.email.toLocaleLowerCase() === emailLower) {
                let filter = doc.username === usernameOrEmail ? {username: doc.username} : {email: doc.email}
                collection.updateOne(filter, {
                    $push: {actions: action}
                }, (err) => {
                    if (err)
                        return callback && callback(ERROR.INTERNAL_ERROR_UPDATING_USER)
                    return callback && callback(null)
                })
                return;
            }
        }
        return callback && callback(ERROR.USESR_NOT_FOUND);
    });
}

export function setUserActive(db, userObjOrToken, cb?) {
    if (userObjOrToken == null)
        return cb && cb(ERROR.INVALID_USER)
    let collection = db.collection(COLLECTION_NAME);
    let getUserObj = Promise.resolve(userObjOrToken)
    const objType = typeof userObjOrToken
    let skipUpdate = (userObj) => {
        return userObj.lastActive && userObj.lastActive.getTime() + userAppData.userUpdateSec*1000 > Date.now()
    }
    if (objType !== 'object')
        getUserObj = collection.findOne({token: userObjOrToken}, {fields: EXCLUDE_FIELDS})
    else if (skipUpdate(userObjOrToken))
        return cb && cb()
    getUserObj.then((userObj) => {
        if (!userObj)
            return cb && cb(ERROR.USESR_NOT_FOUND)
        if (skipUpdate(userObj))
            return cb && cb()
        const now = new Date()
        collection.updateOne({token: userObj.token}, {$set: {lastActive: now}}, (err) => {
            if (err)
                return cb && cb(err)
            if (objType === 'object')
                userObjOrToken.lastActive = now // update it. our session store (redis) will serialize this too automatically
            cb && cb()
        })
    })
}

export function ensureSchema(db, id, prop, callback) {
    let emptyUser = new User()
    if (!emptyUser[prop])
        return callback && callback('no such property to ensure user schema')
    let collection = db.collection(COLLECTION_NAME)
    let update = {}
    update[prop] = emptyUser[prop]
    collection.updateOne({_id: typeof id === 'string' ? new ObjectID(id) : id}, {
        $set: update
        }, (err, result) => {
        if (err)
            return callback && callback(err)
        callback && callback()
    })
}

export function isValidEmail(email: string) {
    // http://emailregex.com/
    const emailRegex = new RegExp("^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$");
    if (typeof email !== 'string')
        return false;
    if (emailRegex.test(email) === false)
        return false;
    return true;
}

export function getInitFunctions(db) {
    return [
        (callback) => {
            db.createCollection(COLLECTION_NAME, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                token: 1 // asc
            }, {
                unique: true,
                name: COLLECTION_NAME + 'TokenUnique'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                username: 1 // asc
            }, {
                unique: true,
                name: COLLECTION_NAME + 'UsernameUnique'
            }, callback);
        },
        (callback) => {
            db.createIndex(COLLECTION_NAME, {
                email: 1 // asc
            }, {
                unique: true,
                name: COLLECTION_NAME + 'EmailUnique'
            }, callback);
        }
    ];
}