"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var uuidv = require("uuid");
var Nano = require("nano");
var async = require("async");
var Q = require("q");
var redis = require("redis");
var moment = require("moment-timezone");
var passwordValidator = require('password-validator');
var nano = Nano('http://localhost:5984');
var r_client;
var _current_system = "tastmanagement";
var utility = /** @class */ (function () {
    function utility() {
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
                    "map": "function (doc) {\n                if(doc.username)\n                emit(doc.username, null);\n                //startkey=\"abc\"&endkey=\"abc\uFFF0\"\n                }"
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
            oldphone: []
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
                oldphone: []
            }];
    }
    ;
    ;
    utility.prototype.setPrefix = function (p) {
        // set Prefix to customer server
        this._prefix = p;
        // save to the database
    };
    utility.prototype.initPrefix = function () {
        // load prefix to the system from database
    };
    utility.prototype.isJSON = function (str) {
        try {
            return (JSON.parse(str) && !!str);
        }
        catch (e) {
            return false;
        }
    };
    utility.prototype.genUUID = function () {
        return uuidv();
    };
    utility.prototype.init_redis = function () {
        this.r_client.flushdb(function (err, succeeded) {
            console.log(succeeded); // will be true if successfull
        });
    };
    utility.prototype.saveLoginToken = function (user, logintoken) {
        // r_client.set(user.username,logintoken,()=>{
        //     console.log('OK get user login token');
        r_client.set("__usertoken__" + user.gui, logintoken, function () {
            console.log('OK get user token');
            r_client.set("__userusergui__" + logintoken, user.gui, function () {
                console.log('OK save user gui');
            });
        });
        //});
    };
    utility.prototype.removeLoginToken = function (user, logintoken) {
        return r_client.del(user.username, logintoken, function (body) {
            console.log('OK delete login token ' + body);
        });
    };
    utility.prototype.getLoginToken = function (usergui) {
        return r_client.get("__logintoken__" + usergui, function (body) {
            console.log('OK save login token ' + body);
        });
    };
    utility.prototype.getUserGUI = function (logintoken) {
        return r_client.get("__usergui__" + logintoken, function (body) {
            console.log('OK save login token ' + body);
        });
    };
    utility.prototype.checkLoginToken = function (logintoken) {
        return r_client.exists("__usertoken__" + logintoken, function (body) {
            console.log('OK check login token');
        });
    };
    utility.prototype.create_db = function (dbname) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                nano.db.create(dbname, function (err, body) {
                    // specify the database we are going to use    
                    if (!err) {
                        console.log('database ' + dbname + ' created!');
                    }
                    else
                        console.log(dbname + " could not be created!");
                });
                return [2 /*return*/, nano.use(dbname)];
            });
        });
    };
    utility.prototype.filterObject = function (obj) {
        var need = ['_rev', 'password', 'oldphone', 'system', 'parents', 'roles', 'isActive'];
        //console.log(key);
        for (var i in obj) {
            //if(i==='password')
            //console.log(obj[i]);
            for (var x = 0; x < need.length; x++) {
                var key = need[x];
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
    };
    utility.prototype.init_taskmanager = function () {
        return __awaiter(this, void 0, void 0, function () {
            var deferred;
            return __generator(this, function (_a) {
                deferred = Q.defer();
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
                return [2 /*return*/, deferred.promise];
            });
        });
    };
    utility.prototype.initDB = function (dbname, design) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                async.eachSeries([
                    db = this.create_db(dbname),
                    db = nano.use(dbname),
                    db.insert(design, function (err, res) {
                        if (err) {
                            //console.log(design);
                            //console.log(err);
                            db.get('_design/objectList', function (er, re) {
                                if (er) {
                                    console.log(dbname);
                                    console.log(design);
                                    console.log('could not find design ' + er);
                                }
                                else {
                                    if (re) {
                                        var d = re;
                                        //console.log("d:"+JSON.stringify(d));
                                        db.destroy('_design/objectList', d._rev, function (e, r) {
                                            if (e)
                                                console.log(e);
                                            else {
                                                //console.log(res);
                                                db.insert(design, "_design/objectList", function (ee, rr) {
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
                                        db.insert(design, "_design/objectList", function (er, re) {
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
                ], function (err) {
                    console.log('exist ' + dbname);
                });
                return [2 /*return*/];
            });
        });
    };
    utility.prototype.checkAuthorize = function (js) {
        var deferred = Q.defer();
        //deferred.resolve(js); // JUST BY PASS THIS TEMPORARY
        //if (0)
        try {
            var except = ['ping', 'login', 'shake-hands', 'heart-beat', 'register',
                'check-secret', 'get-secret', 'submit-forgot', 'check-forgot', 'reset-forgot',
                'check-username', 'check-password', 'check-phone'
            ];
            if (except.indexOf(js.data.command) > -1) {
                js.data.message = 'OK';
                deferred.resolve(js);
            }
            else {
                r_client.get(_current_system + '_login_' + js.logintoken, function (err, r) {
                    if (err) {
                        js.data.message = err;
                        deferred.reject(js);
                    }
                    else {
                        if (r) {
                            var res = JSON.parse(r);
                            if (res.client.logintoken !== undefined) {
                                js.data.message = 'OK';
                                r_client.get(_current_system + '_usergui_' + js.logintoken, function (err, r) {
                                    if (err) {
                                        js.data.message = err;
                                        deferred.reject(js);
                                    }
                                    else {
                                        var res_1 = JSON.parse(r);
                                        if (res_1.gui) {
                                            js.data.message = 'OK authorized';
                                            js.auth = {};
                                            js.auth.gui = res_1.gui;
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
    };
    utility.prototype.checkExistUser = function (js) {
        var deferred = Q.defer();
        (!js.data || js.data === undefined) ? js.data = {} : js.data;
        var username = js.data.user.username;
        var db = this.create_db('taskmanageruser');
        // CHECK ACCESS TOKEN & IP 
        // AUTHENTICATION
        db.then(function (re) {
            re.view('_designObject', 'checkExistUser', {
                'keys': ['username']
            }).then(function (body) {
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
        })["catch"](function (err) {
            js.message = err;
            deferred.reject(js);
        });
        return deferred.promise;
    };
    utility.prototype.convertTZ = function (fromTZ) {
        return new Date(moment.tz(fromTZ, "Asia/Vientiane").format().replace('+07:00', ''));
    };
    utility.prototype.validatePassword = function (pass) {
        return this.passValidator.validate(pass, {
            list: true
        });
    };
    utility.prototype.validateUserInfo = function (u) {
        console.log(u);
        return this.userValidator.validate(u, {
            list: true
        });
    };
    utility.prototype.validatePhoneInfo = function (p) {
        console.log(p);
        return this.phoneValidator.validate(p, {
            list: true
        });
    };
    utility.prototype.checkUserByPhone = function (phone) {
        var deferred = Q.defer();
        var db = this.create_db('taskmanageruser');
        db.view(this.__design_view, 'findByPhone', {
            include_docs: true, key: phone + ''
        }, function (err, res) {
            if (err)
                deferred.reject(err);
            else {
                var arr = [];
                if (res.rows.length) {
                    arr.push(res.rows[0].doc);
                }
                deferred.resolve(arr);
            }
        });
        return deferred.promise;
    };
    utility.prototype.init_default_user = function (client) {
        var _this = this;
        //let db = create_db('gijusers');
        //console.log('default user:'+defaultUser.username);
        // findUserByUsername(defaultUser.username).then((res) {
        //     if (res) {
        nano.db.destroy('taskmanageruser', function (err, body) {
            client.data = {};
            client.data.message = 'destroy OK';
            nano.db.create('taskmanageruser', function (err, body) {
                // specify the database we are going to use    
                if (!err) {
                    console.log('database  created!');
                }
                else {
                    console.log("taskmanageruser could not be created!");
                }
                var db = nano.use('taskmanageruser');
                db.insert(_this.__design_users, "_design/objectList", function (err, res) {
                    if (err)
                        console.log('err insert new design ' + err);
                    else {
                        //setTimeout(() => {
                        _this.sDefaultUsers.push(_this.defaultUser);
                        db.bulk({
                            docs: _this.sDefaultUsers
                        }, function (err, res) {
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
    };
    return utility;
}());
exports.utility = utility;
;
