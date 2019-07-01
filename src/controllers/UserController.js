"use strict";
exports.__esModule = true;
var Ajv = require("ajv");
var userModel = require("../models/UserModel");
var utility = require("../scripts/utility");
var moment = require("moment-timezone");
var Q = require("q");
var UserController = /** @class */ (function () {
    function UserController() {
        this.__design_view = "objectList";
    }
    UserController.prototype.addNewUser = function (req, res) {
        var ajv = new Ajv({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
        var client = req.body;
        var ut = new utility.utility();
        var db = ut.create_db('taskmanageruser');
        (!client.data || client.data === undefined) ? client.data = {} : client.data;
        var usr = client.data.user;
        try {
            if (!usr || usr === undefined) {
                throw Error('Error user data is empty or undefined');
            }
            ;
            var validate = ajv.compile(userModel.UserSchema);
            var valid = validate(usr);
            if (!valid) {
                console.log(validate.errors);
                client.data.user = {};
                client.data.error = validate.errors;
                client.data.message = 'Error validate add new user';
                res.send(client);
            }
            else {
                // ADD TO DATABASE HERE
                db.then(function (re) {
                });
                client.data.user = {};
                client.data.error = {};
                client.data.message = 'add new user success fully ' + usr.userName;
                res.send(client);
            }
        }
        catch (error) {
            console.log(error);
            client.data.user = {};
            client.data.error = error;
            client.data.message = "Error adding a new user";
            res.send(client);
        }
    };
    UserController.prototype.findUserByGUI = function (gui) {
        var _this = this;
        var deferred = Q.defer();
        var uti = new utility.utility();
        var db = uti.create_db('gijusers');
        db.then(function (re) {
            re.view(_this.__design_view, 'findByUserGui', {
                include_docs: true, key: gui + ''
            }, function (err, res) {
                if (err)
                    deferred.reject(err);
                else {
                    var arr = [];
                    for (var index = 0; index < res.rows.length; index++) {
                        var element = res.rows[index].doc;
                        //cleanUserInfo(element);
                        arr.push(element);
                    }
                    console.log('FOUND ' + gui);
                    console.log('length: ' + arr.length);
                    if (arr.length < 2)
                        deferred.resolve(arr[0]);
                    else
                        deferred.reject(new Error('ERROR system found more record please contact admin'));
                }
            });
        })["catch"](function (err) {
        });
        return deferred.promise;
    };
    UserController.prototype.displayUserDetails = function (gui) {
        var deferred = Q.defer();
        var uti = new utility.utility();
        this.findUserByGUI(gui).then(function (res) {
            if (res) {
                //console.log(res);
                uti.filterObject(res);
                //console.log(res);
                deferred.resolve(res);
            }
            else {
                deferred.reject(new Error('ERROR no user profile'));
            }
        })["catch"](function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    UserController.prototype.userDetails = function (req, res) {
        var ajv = new Ajv({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
        var client = req.body;
        (!client.data || client.data === undefined) ? client.data = {} : client.data;
        var usr = client.data.user;
        var validate = ajv.compile(userModel.UserSchema);
        var valid = validate(usr);
        if (!valid) {
            console.log(validate.errors);
            client.data.user = {};
            client.data.error = validate.errors;
            client.data.message = 'Error validate user details';
            res.send(client);
        }
        else {
            // QUERY FROM DATA BASE HERE
            client.data.user = {};
            client.data.error = {};
            client.data.message = 'OK User details ' + usr.userName;
            res.send(client);
        }
    };
    UserController.prototype.testUserValidator = function (req, res) {
        var sample = {
            "userName": "",
            "password": "",
            "confirmPassword": "",
            "firstName": "",
            "lastName": "",
            "email": "",
            "company": "",
            "phone": "",
            "created_date1": "",
            "last_update": ""
        };
        var ajv = new Ajv({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
        var validate = ajv.compile(userModel.UserSchema);
        console.log('valid : ' + validate);
        var valid = validate(sample);
        console.log('valid : ' + valid);
        if (!valid) {
            res.send("sample is not valid");
        }
        else {
            res.send("sample is valid");
        }
    };
    UserController.prototype.showUserModel = function (req, res) {
        console.log(userModel.UserSchema);
        res.send(userModel.UserSchema);
    };
    UserController.prototype.addSubUser = function (userinfo) {
        var _this = this;
        var deferred = Q.defer();
        var uti = new utility.utility();
        var db = uti.create_db('gijusers');
        var parents = [];
        if (userinfo.parents === undefined) {
            userinfo.parents = ['default'];
        }
        else
            parents = userinfo.parents;
        console.log(userinfo.confirmpassword + "  -  " + userinfo.password);
        if (userinfo.confirmpassword != userinfo.password) {
            deferred.reject(new Error('ERROR wrong confirmed password'));
        }
        else {
            console.log('find sub username ');
            console.log(userinfo);
            this.findUserByUsername(userinfo.username).then(function (res) {
                var p = res;
                if (p.length) {
                    deferred.reject(new Error('ERROR this user exist'));
                }
                else {
                    console.log('find exist USER');
                    _this.findUserByUsername(parents).then(function (res) {
                        console.log('find parent');
                        var p = res;
                        if (!p.length) {
                            userinfo.parents.push(uti.defaultUser.username);
                        }
                        userinfo.username = userinfo.username.trim().toLowerCase();
                        var r;
                        if ((r = uti.validateUserInfo(userinfo.username)).length) {
                            console.log('validate error username');
                            deferred.reject(r);
                        }
                        else if ((r = uti.validatePhoneInfo(userinfo.phonenumber)).length) {
                            console.log('validate error phonenumber');
                            deferred.reject(r);
                        }
                        else if ((r = uti.validatePassword(userinfo.password)).length) {
                            console.log('validate error password');
                            deferred.reject(r);
                        }
                        else {
                            userinfo.photo = [];
                            userinfo.description = '';
                            userinfo.note = '';
                            userinfo.gijvalue = 0;
                            userinfo.totalgij = 0;
                            userinfo.totalgijspent = 0;
                            db.insert(userinfo, userinfo.gui, function (err, res) {
                                if (err)
                                    deferred.reject(err);
                                else {
                                    console.log('user added');
                                    //console.log(res);
                                    deferred.resolve(res);
                                }
                            });
                        }
                    })["catch"](function (err) {
                        deferred.reject(err);
                    });
                }
            })["catch"](function (err) {
                deferred.reject(err);
            });
        }
        return deferred.promise;
    };
    UserController.prototype.findUserByUsername = function (username) {
        var deferred = Q.defer();
        var uti = new utility.utility();
        var db = uti.create_db('gijusers');
        try {
            console.log('find username : ' + username);
            if (username === undefined)
                username = [];
            else if (typeof (username) === 'string') {
                username = [username];
            }
            db.view(this.__design_view, 'findByUsername', {
                keys: username
            }, function (err, res) {
                if (err)
                    deferred.reject(err);
                else {
                    //console.log(res);
                    console.log('find users');
                    // console.log(res.rows[0].doc);
                    if (res.rows.length == 1) {
                        deferred.resolve([res.rows[0].doc]);
                    }
                    else if (res.rows.length > 1) {
                        var arr = [];
                        for (var index = 0; index < res.rows.length; index++) {
                            var element = res.rows[index].doc;
                            arr.push(element);
                        }
                        deferred.resolve(arr);
                    }
                    else {
                        deferred.resolve([]);
                    }
                }
            });
        }
        catch (error) {
            deferred.reject(error);
        }
        return deferred.promise;
    };
    UserController.prototype.addUser = function (userinfo) {
        var _this = this;
        var deferred = Q.defer();
        var uti = new utility.utility();
        var db = uti.create_db('gijusers');
        var parents = [];
        if (userinfo.parents === undefined) {
            userinfo.parents = ['default'];
        }
        parents.push(userinfo.parents[0]);
        //console.log(userinfo.confirmpassword+"  -  "+userinfo.password);
        if (userinfo.confirmpassword != userinfo.password)
            deferred.reject(new Error('ERROR wrong confirmed password'));
        else
            uti.checkUserByPhone(userinfo.phonenumber).then(function (res) {
                //console.log('phone length');
                //console.log(res);
                var p = res;
                if (p.length) {
                    deferred.reject(new Error('ERROR you could not use this phonenumber'));
                }
                else {
                    _this.findUserByUsername(userinfo.username).then(function (res) {
                        var p = res;
                        if (p.length) {
                            deferred.reject(new Error('ERROR this user exist'));
                        }
                        else {
                            _this.findUserByUsername(parents[0]).then(function (res) {
                                var p = res;
                                if (!p.length) {
                                    userinfo.parents.push(uti.defaultUser.username);
                                }
                                userinfo.username = userinfo.username.trim().toLowerCase();
                                var r;
                                if ((r = uti.validateUserInfo(userinfo.username)).length)
                                    deferred.reject(r);
                                else if ((r = uti.validatePhoneInfo(userinfo.phonenumber)).length)
                                    deferred.reject(r);
                                else if ((r = uti.validatePassword(userinfo.password)).length)
                                    deferred.reject(r);
                                else {
                                    userinfo.gui = uti.genUUID();
                                    userinfo.createddate = uti.convertTZ(moment().format());
                                    userinfo.lastupdate = uti.convertTZ(moment().format());
                                    userinfo.isactive = true;
                                    userinfo.roles = ['user'];
                                    userinfo.description = "";
                                    userinfo.photo = "";
                                    userinfo.note = "";
                                    userinfo.gijvalue = 0;
                                    userinfo.totalgij = 0;
                                    userinfo.totalgijspent = 0;
                                    db.insert(userinfo, userinfo.gui, function (err, res) {
                                        if (err)
                                            deferred.reject(err);
                                        else {
                                            console.log('user added');
                                            //console.log(res);
                                            deferred.resolve(res);
                                        }
                                    });
                                }
                            })["catch"](function (err) {
                                deferred.reject(err);
                            });
                        }
                    })["catch"](function (err) {
                        deferred.reject(err);
                    });
                }
            })["catch"](function (err) {
                deferred.reject(err);
            });
        return deferred.promise;
    };
    UserController.prototype.findUserByUsernameAndPhone = function (username, phone) {
        var _this = this;
        var deferred = Q.defer();
        var uti = new utility.utility();
        var db = uti.create_db('gijusers');
        console.log("finding : " + username + " phone:" + phone);
        db.then(function (re) {
            re.view(_this.__design_view, 'findByUsernameAndPhone', {
                include_docs: true, key: [username + '', phone + '']
            }, function (err, res) {
                if (err)
                    deferred.reject(err);
                else {
                    if (res.rows.length) {
                        //let arr=[];
                        deferred.resolve(res.rows[0].doc);
                    }
                    else {
                        deferred.reject(new Error('ERROR Username and phone not found'));
                    }
                }
            });
        })["catch"](function (err) {
            deferred.reject(new Error(err));
        });
        return deferred.promise;
    };
    UserController.prototype.change_password = function (client) {
        var _this = this;
        var deferred = Q.defer();
        var uti = new utility.utility();
        var db = uti.create_db('taskmanageruser');
        var username = client.username;
        var gui = client.gui;
        var phone = client.data.user.phone;
        var oldpass = client.data.user.oldpassword;
        var newpass = client.data.user.newpass;
        console.log("username:" + username);
        console.log("phone:" + phone);
        console.log("oldpass:" + oldpass);
        console.log("newpass:" + newpass);
        this.findUserByUsernameAndPhone(username, phone).then(function (res) {
            // console.log('found :' + JSON.stringify(res));
            if (res) {
                if (res.password != oldpass)
                    deferred.reject(new Error('ERROR wrong password'));
                var passValidate = uti.validatePassword(newpass);
                if (passValidate.length)
                    deferred.reject(new Error('ERROR validating ' + (passValidate.toString())));
                else {
                    res.password = newpass;
                    console.log('updating ' + JSON.stringify(res));
                    _this.updateUser(res).then(function (res) {
                        var content = 'your password has been changed';
                        //                        this.SMSToPhone(js, content, phone);
                        deferred.resolve('OK');
                    })["catch"](function (err) {
                        deferred.reject(err);
                    });
                }
            }
            else {
                throw new Error('ERROR username and phone not found');
            }
        })["catch"](function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    UserController.prototype.updateUser = function (userinfo) {
        var deferred = Q.defer();
        var uti = new utility.utility();
        var db = uti.create_db('gijusers');
        try {
            if (!userinfo._rev) {
                userinfo.gui = uti.genUUID();
                userinfo._id = userinfo.gui;
            }
            db.then(function (re) {
                re.insert(userinfo, userinfo._id, function (err, body) {
                    if (err)
                        throw err;
                    else {
                        deferred.resolve('OK update');
                    }
                });
            })["catch"](function (err) {
                deferred.reject(err);
            });
        }
        catch (error) {
            deferred.reject(error);
        }
        return deferred.promise;
    };
    UserController.prototype.indUserByUsernameAndPhone = function (username, phone) {
        var _this = this;
        var deferred = Q.defer();
        var uti = new utility.utility();
        var db = uti.create_db('taskmanageruser');
        console.log("finding : " + username + " phone:" + phone);
        db.then(function (re) {
            re.view(_this.__design_view, 'findByUsernameAndPhone', {
                include_docs: true, key: [username + '', phone + '']
            }, function (err, res) {
                if (err)
                    deferred.reject(err);
                else {
                    if (res.rows.length) {
                        //let arr=[];
                        deferred.resolve(res.rows[0].doc);
                    }
                    else {
                        deferred.reject(new Error('ERROR Username and phone not found'));
                    }
                }
            });
        })["catch"](function (err) {
            deferred.reject(new Error(err));
        });
        return deferred.promise;
    };
    UserController.prototype.forgotPassword = function (req, res) {
        var client = req.body;
        this.reset_password(client).then(function (re) {
            client.data.message = re;
            res.send(client);
        })["catch"](function (err) {
            client.data.message = err.message;
            client.data.errormessage = err;
            res.send(client);
        });
    };
    UserController.prototype.addNewUserManual = function (req, res) {
        var deferred = Q.defer();
        var client = req.body;
        var uti = new utility.utility();
        var u = {};
        //u = this.cloneObj(client.data.user, u);
        u = client.data.user;
        if (client.data.user.system === undefined) {
            client.data.user.system = [];
        }
        client.data.user.system.push('default');
        client.data.user.system.push('gij');
        this.addSubUser(client.data.user).then(function (res) {
            client.data.message = 'OK added a new user';
            deferred.resolve(client);
        })["catch"](function (err) {
            console.log(err);
            client.data.message = err;
            deferred.reject(client);
        });
        return deferred.promise;
    };
    UserController.prototype.update_sub_userinfo = function (client) {
        var _this = this;
        var deferred = Q.defer();
        try {
            this.findUserByGUI(client.auth.gui).then(function (res) {
                var p = res;
                _this.findUserByGUI(client.data.user.gui).then(function (res) {
                    var u = res;
                    if (u.parents.indexOf(p.username) > -1) {
                        u.description = client.data.user.description;
                        u.note = client.data.user.note;
                        u.isactive = client.data.user.isactive;
                        //u.phonenumber=client.data.user.phonenumber;                
                        _this.updateUser(u).then(function (res) {
                            client.data.user = u;
                            client.data.message = 'OK update subuser info';
                            deferred.resolve(client);
                        });
                    }
                    else {
                        throw new Error('ERROR you have are not their parents');
                    }
                });
            })["catch"](function (err) {
                throw err;
            });
        }
        catch (error) {
            client.data.message = error;
            deferred.reject(client);
        }
        return deferred.promise;
    };
    UserController.prototype.reset_password = function (client) {
        var _this = this;
        var deferred = Q.defer();
        var uti = new utility.utility();
        this.findUserByPhone(client.data.user.phonenumber).then(function (res) {
            if (res) {
                res.password = "123456";
                _this.updateUser(res).then(function (res) {
                    deferred.resolve('OK 123456');
                });
            }
            else {
                deferred.reject(new Error('ERROR phone number not found'));
            }
        })["catch"](function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    UserController.prototype.resetSubUserPassword = function (req, res) {
        var _this = this;
        var deferred = Q.defer();
        var uti = new utility.utility();
        var client = req.body;
        try {
            this.findUserByGUI(client.auth.gui).then(function (res) {
                var p = res;
                _this.findUserByGUI(client.data.user.gui).then(function (res) {
                    var u = res;
                    if (u.parents.indexOf(p.username) > -1) {
                        u.password = '123456';
                        _this.updateUser(u).then(function (res) {
                            u.password = '';
                            client.data.user = u;
                            client.data.message = 'OK reset subuser password to 123456';
                            deferred.resolve(client);
                        });
                    }
                    else {
                        throw new Error('ERROR you have are not their parents');
                        //deferred.reject(client);
                    }
                });
            })["catch"](function (err) {
                throw err;
            });
        }
        catch (error) {
            client.data.message = error;
            deferred.reject(client);
        }
        return deferred.promise;
    };
    UserController.prototype.findUserByPhone = function (phone) {
        var _this = this;
        var deferred = Q.defer();
        var uti = new utility.utility();
        var db = uti.create_db('taskmanageruser');
        db.then(function (re) {
            re.view(_this.__design_view, 'findByPhone', {
                include_docs: true, key: phone + ''
            }, function (err, res) {
                if (err)
                    deferred.reject(err);
                else {
                    if (res.rows.length) {
                        //console.log(res);
                        deferred.resolve(res.rows[0].doc);
                    }
                    else
                        deferred.resolve('');
                }
            });
        })["catch"](function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    return UserController;
}());
exports.UserController = UserController;
