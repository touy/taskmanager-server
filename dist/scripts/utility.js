"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuidv = require("uuid");
const Nano = require("nano");
const async = require("async");
const Q = require("q");
const redis = require("redis");
const moment = require("moment-timezone");
var passwordValidator = require('password-validator');
let nano = Nano('http://localhost:5984');
let r_client;
let _current_system = "tastmanagement";
class utility {
    constructor() {
        this.r_client = redis.createClient();
        this._prefix = 'skytelecom@?$##@$J34';
        this.__design_view = "objectList";
        this.passValidator = new passwordValidator();
        this.userValidator = new passwordValidator();
        this.phoneValidator = new passwordValidator();
        this.__design_users = {
            "_id": "_design/objectList",
            "views": {
                "authentication": {
                    "map": "function(doc) {\r\n    if(doc.username.toLowerCase()&&doc.password) {\r\n        emit([doc.username.toLowerCase(),doc.password],null);\r\n    }\r\n}"
                },
                "findByPhone": {
                    "map": "function(doc) {\r\n    if(doc.phonenumber) {\r\n        emit(doc.phonenumber,null);\r\n    }\r\n}"
                },
                "findByUsernameAndPhone": {
                    "map": "function(doc) {\r\n    if(doc.username.toLowerCase()) {\r\n        emit([doc.username.toLowerCase(),doc.phonenumber],null);\r\n    }\r\n}"
                },
                "findByUsername": {
                    "map": "function(doc) {\r\n    if(doc.username.toLowerCase()) {\r\n        emit(doc.username.toLowerCase(),null);\r\n    }\r\n}"
                },
                "searchByUsername": {
                    "map": `function (doc) {
                if(doc.username)
                emit(doc.username, null);
                //startkey="abc"&endkey="abc\ufff0"
                }`
                },
                "findByUserGui": {
                    "map": "function(doc) {\r\n    if(doc.gui) {\r\n        emit(doc.gui,null);\r\n    }\r\n}"
                },
                "findExist": {
                    "map": "function(doc) {\n if(doc.username.toLowerCase()) \n emit(doc.username.toLowerCase(), null);\n}"
                },
                "changePassword": {
                    "map": "function(doc) {\n    emit([doc.username.toLowerCase(),doc.password,doc.phonenumber], null);\n}"
                },
                "findByRole": {
                    "map": "function(doc) {\n   for(var i=0;i<doc.roles.length;i++) emit([doc.roles[i]], null);\n}"
                },
                "countByRole": {
                    "reduce": "_count",
                    "map": "function(doc) {\n   for(var i=0;i<doc.roles.length;i++) emit([doc.roles[i]], null);\n}"
                },
                "findByParent": {
                    "map": "function(doc) {\n   for(var i=0;i<doc.parents.length;i++) emit([doc.parents[i]], null);\n}"
                },
                "searchByParent": {
                    "map": "function(doc) {\n   for(var i=0;i<doc.parents.length;i++) if(doc.username)emit([doc.parents[i],doc.username], null);\n}"
                },
                "countByParent": {
                    "reduce": "_count",
                    "map": "function(doc) {\n   for(var i=0;i<doc.parents.length;i++) emit([doc.parents[i]], null);\n}"
                },
                "findAdmin": {
                    "map": "function(doc) {\n   for(var i=0;i<doc.system.length;i++) emit([doc.system[i]], null);\n}"
                },
                "countAdmin": {
                    "reduce": "_count",
                    "map": "function(doc) {\n   for(var i=0;i<doc.system.length;i++) emit([doc.system[i]], null);\n}"
                }
            },
            "language": "javascript"
        };
        //var _authen_arr = ["/profile", "/this.change_password"] // could get from redis;
        this._author_path = [{
                urlpath: '/login',
                roles: ['guest', 'user', 'admin']
            },
            {
                urlpath: '/change_password',
                roles: ['user', 'admin']
            },
            {
                urlpath: '/profile',
                roles: ['user', 'admin']
            },
            {
                urlpath: '/home',
                roles: ['guest', 'user', 'admin']
            },
        ];
        this.defaultUser = {
            username: 'superadmin',
            password: '123456@!!!',
            confirmpassword: '',
            phonenumber: '2055516321',
            gui: this.genUUID(),
            createddate: this.convertTZ(moment().format()),
            lastupdate: this.convertTZ(moment().format()),
            isactive: true,
            parents: ["default"],
            roles: ['admin', 'user'],
            logintoken: '',
            expirelogintoken: '',
            description: '',
            photo: [],
            note: '',
            system: ['taskmanagement'],
            oldphone: [],
        };
        this.sDefaultUsers = [{
                username: 'superadmin',
                password: '123456@!!!',
                confirmpassword: '',
                phonenumber: '2055516321',
                gui: this.genUUID(),
                createddate: this.convertTZ(moment().format()),
                lastupdate: this.convertTZ(moment().format()),
                isactive: true,
                parents: ["default"],
                roles: ['admin', 'user'],
                logintoken: '',
                expirelogintoken: '',
                description: '',
                photo: [],
                note: '',
                system: ['web-post', 'gij'],
                oldphone: [],
            }];
    }
    ;
    ;
    setPrefix(p) {
        // set Prefix to customer server
        this._prefix = p;
        // save to the database
    }
    initPrefix() {
        // load prefix to the system from database
    }
    isJSON(str) {
        try {
            return (JSON.parse(str) && !!str);
        }
        catch (e) {
            return false;
        }
    }
    genUUID() {
        return uuidv();
    }
    init_redis() {
        this.r_client.flushdb((err, succeeded) => {
            console.log(succeeded); // will be true if successfull
        });
    }
    saveLoginToken(user, logintoken) {
        // r_client.set(user.username,logintoken,()=>{
        //     console.log('OK get user login token');
        r_client.set("__usertoken__" + user.gui, logintoken, () => {
            console.log('OK get user token');
            r_client.set("__userusergui__" + logintoken, user.gui, () => {
                console.log('OK save user gui');
            });
        });
        //});
    }
    removeLoginToken(user, logintoken) {
        return r_client.del(user.username, logintoken, (body) => {
            console.log('OK delete login token ' + body);
        });
    }
    getLoginToken(usergui) {
        return r_client.get("__logintoken__" + usergui, (body) => {
            console.log('OK save login token ' + body);
        });
    }
    getUserGUI(logintoken) {
        return r_client.get("__usergui__" + logintoken, (body) => {
            console.log('OK save login token ' + body);
        });
    }
    checkLoginToken(logintoken) {
        return r_client.exists("__usertoken__" + logintoken, (body) => {
            console.log('OK check login token');
        });
    }
    create_db(dbname) {
        return __awaiter(this, void 0, void 0, function* () {
            nano.db.create(dbname, (err, body) => {
                // specify the database we are going to use    
                if (!err) {
                    console.log('database ' + dbname + ' created!');
                }
                else
                    console.log(dbname + " could not be created!");
            });
            return nano.use(dbname);
        });
    }
    filterObject(obj) {
        var need = ['_rev', 'password', 'oldphone', 'system', 'parents', 'roles', 'isActive'];
        //console.log(key);
        for (let i in obj) {
            //if(i==='password')
            //console.log(obj[i]);
            for (let x = 0; x < need.length; x++) {
                let key = need[x];
                if (!obj.hasOwnProperty(i)) { }
                else if (Array.isArray(obj[i])) {
                    if (i.toLowerCase().indexOf(key) > -1)
                        obj[i] = [];
                }
                else if (typeof obj[i] === 'object') {
                    this.filterObject(obj[i]);
                }
                else if (i.indexOf(key) > -1) {
                    obj[i] = '';
                }
            }
        }
        return obj;
    }
    init_taskmanager() {
        return __awaiter(this, void 0, void 0, function* () {
            let deferred = Q.defer();
            this.passValidator.is().min(6) // Minimum length 8 
                .is().max(100) // Maximum length 100 
                //.has().uppercase()                              // Must have uppercase letters 
                ///.has().lowercase() // Must have lowercase letters 
                //.has().digits() // Must have digits 
                .has().not().spaces();
            this.userValidator = new passwordValidator();
            this.userValidator.is().min(3)
                .is().max(12)
                //.has().digits()
                .has().lowercase()
                .has().not().spaces();
            this.phoneValidator = new passwordValidator();
            this.phoneValidator.is().min(9)
                .has().digits()
                .has().not().spaces();
            // init user
            this.initDB(this._prefix + '_users', this.__design_users);
            // init doc
            // init roles
            // init permission 
            // init jobs
            return deferred.promise;
        });
    }
    initDB(dbname, design) {
        return __awaiter(this, void 0, void 0, function* () {
            // create a new database
            var db;
            async.eachSeries([
                db = this.create_db(dbname),
                db = nano.use(dbname),
                db.insert(design, (err, res) => {
                    if (err) {
                        //console.log(design);
                        //console.log(err);
                        db.get('_design/objectList', (er, re) => {
                            if (er) {
                                console.log(dbname);
                                console.log(design);
                                console.log('could not find design ' + er);
                            }
                            else {
                                if (re) {
                                    var d = re;
                                    //console.log("d:"+JSON.stringify(d));
                                    db.destroy('_design/objectList', d._rev, (e, r) => {
                                        if (e)
                                            console.log(e);
                                        else {
                                            //console.log(res);
                                            db.insert(design, "_design/objectList", (ee, rr) => {
                                                if (ee)
                                                    console.log('err insert new design ' + dbname + ee);
                                                else {
                                                    //console.log('insert design completed ' + dbname);
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    db.insert(design, "_design/objectList", (er, re) => {
                                        if (er)
                                            console.log('err insert new design ' + dbname + er);
                                        else {
                                            //console.log('insert design completed ' + dbname);
                                        }
                                    });
                                    // console.log("could not find design");
                                }
                            }
                        });
                    }
                    else {
                        console.log('created design ' + dbname);
                    }
                })
            ], (err) => {
                console.log('exist ' + dbname);
            });
        });
    }
    checkAuthorize(js) {
        let deferred = Q.defer();
        //deferred.resolve(js); // JUST BY PASS THIS TEMPORARY
        //if (0)
        try {
            let except = ['ping', 'login', 'shake-hands', 'heart-beat', 'register',
                'check-secret', 'get-secret', 'submit-forgot', 'check-forgot', 'reset-forgot',
                'check-username', 'check-password', 'check-phone'
            ];
            if (except.indexOf(js.data.command) > -1) {
                js.data.message = 'OK';
                deferred.resolve(js);
            }
            else {
                r_client.get(_current_system + '_login_' + js.logintoken, (err, r) => {
                    if (err) {
                        js.data.message = err;
                        deferred.reject(js);
                    }
                    else {
                        if (r) {
                            let res = JSON.parse(r);
                            if (res.client.logintoken !== undefined) {
                                js.data.message = 'OK';
                                r_client.get(_current_system + '_usergui_' + js.logintoken, (err, r) => {
                                    if (err) {
                                        js.data.message = err;
                                        deferred.reject(js);
                                    }
                                    else {
                                        let res = JSON.parse(r);
                                        if (res.gui) {
                                            js.data.message = 'OK authorized';
                                            js.auth = {};
                                            js.auth.gui = res.gui;
                                            deferred.resolve(js);
                                        }
                                        else {
                                            js.data.message = new Error('ERROR empty login');
                                            deferred.resolve(js);
                                        }
                                    }
                                });
                            }
                            else {
                                js.data.message = new Error('ERROR empty login');
                                deferred.resolve(js);
                            }
                        }
                        else {
                            js.data.message = new Error('ERROR empty login');
                            deferred.resolve(js);
                        }
                    }
                });
            }
        }
        catch (error) {
            js.data.message = error;
            deferred.reject(js);
        }
        return deferred.promise;
    }
    checkExistUser(js) {
        let deferred = Q.defer();
        (!js.data || js.data === undefined) ? js.data = {} : js.data;
        let username = js.data.user.username;
        let db = this.create_db('taskmanageruser');
        // CHECK ACCESS TOKEN & IP 
        // AUTHENTICATION
        db.then((re) => {
            re.view('_designObject', 'checkExistUser', {
                'keys': ['username']
            }).then((body) => {
                if (body.rows.length) {
                    js.data.user = {};
                    js.message = "Error exist username";
                    deferred.reject(js);
                }
                else {
                    js.data.user = {};
                    js.message = "OK user is not exist";
                    deferred.resolve(js);
                }
            });
        }).catch((err) => {
            js.message = err;
            deferred.reject(js);
        });
        return deferred.promise;
    }
    convertTZ(fromTZ) {
        return new Date(moment.tz(fromTZ, "Asia/Vientiane").format().replace('+07:00', ''));
    }
    validatePassword(pass) {
        return this.passValidator.validate(pass, {
            list: true
        });
    }
    validateUserInfo(u) {
        console.log(u);
        return this.userValidator.validate(u, {
            list: true
        });
    }
    validatePhoneInfo(p) {
        console.log(p);
        return this.phoneValidator.validate(p, {
            list: true
        });
    }
    checkUserByPhone(phone) {
        let deferred = Q.defer();
        let db = this.create_db('taskmanageruser');
        db.view(this.__design_view, 'findByPhone', {
            include_docs: true, key: phone + ''
        }, (err, res) => {
            if (err)
                deferred.reject(err);
            else {
                let arr = [];
                if (res.rows.length) {
                    arr.push(res.rows[0].doc);
                }
                deferred.resolve(arr);
            }
        });
        return deferred.promise;
    }
    init_default_user(client) {
        //let db = create_db('gijusers');
        //console.log('default user:'+defaultUser.username);
        // findUserByUsername(defaultUser.username).then((res) {
        //     if (res) {
        nano.db.destroy('taskmanageruser', (err, body) => {
            client.data = {};
            client.data.message = 'destroy OK';
            nano.db.create('taskmanageruser', (err, body) => {
                // specify the database we are going to use    
                if (!err) {
                    console.log('database  created!');
                }
                else {
                    console.log("taskmanageruser could not be created!");
                }
                let db = nano.use('taskmanageruser');
                db.insert(this.__design_users, "_design/objectList", (err, res) => {
                    if (err)
                        console.log('err insert new design ' + err);
                    else {
                        //setTimeout(() => {
                        this.sDefaultUsers.push(this.defaultUser);
                        db.bulk({
                            docs: this.sDefaultUsers
                        }, (err, res) => {
                            // if (err) {
                            //     client.data.message = err;
                            //     res.send(client);
                            // } else {
                            //     js.client.data.message = 'OK INIT default users';
                            //     js.resp.send(js.client);
                            // }
                        });
                        //}, 1000*3);
                    }
                });
            });
        });
    }
}
exports.utility = utility;
;
//# sourceMappingURL=utility.js.map