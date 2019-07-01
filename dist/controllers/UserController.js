"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Ajv = require("ajv");
const userModel = require("../models/UserModel");
const utility = require("../scripts/utility");
const moment = require("moment-timezone");
const Q = require("q");
class UserController {
    constructor() {
        this.__design_view = "objectList";
    }
    addNewUser(req, res) {
        let ajv = new Ajv({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
        let client = req.body;
        let ut = new utility.utility();
        let db = ut.create_db('taskmanageruser');
        (!client.data || client.data === undefined) ? client.data = {} : client.data;
        let usr = client.data.user;
        try {
            if (!usr || usr === undefined) {
                throw Error('Error user data is empty or undefined');
            }
            ;
            let validate = ajv.compile(userModel.UserSchema);
            let valid = validate(usr);
            if (!valid) {
                console.log(validate.errors);
                client.data.user = {};
                client.data.error = validate.errors;
                client.data.message = 'Error validate add new user';
                res.send(client);
            }
            else {
                // ADD TO DATABASE HERE
                db.then(re => {
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
    }
    findUserByGUI(gui) {
        let deferred = Q.defer();
        let uti = new utility.utility();
        let db = uti.create_db('gijusers');
        db.then(re => {
            re.view(this.__design_view, 'findByUserGui', {
                include_docs: true, key: gui + ''
            }, (err, res) => {
                if (err)
                    deferred.reject(err);
                else {
                    let arr = [];
                    for (let index = 0; index < res.rows.length; index++) {
                        const element = res.rows[index].doc;
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
        }).catch(err => {
        });
        return deferred.promise;
    }
    displayUserDetails(gui) {
        let deferred = Q.defer();
        let uti = new utility.utility();
        this.findUserByGUI(gui).then((res) => {
            if (res) {
                //console.log(res);
                uti.filterObject(res);
                //console.log(res);
                deferred.resolve(res);
            }
            else {
                deferred.reject(new Error('ERROR no user profile'));
            }
        }).catch((err) => {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    userDetails(req, res) {
        let ajv = new Ajv({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
        let client = req.body;
        (!client.data || client.data === undefined) ? client.data = {} : client.data;
        let usr = client.data.user;
        let validate = ajv.compile(userModel.UserSchema);
        let valid = validate(usr);
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
    }
    testUserValidator(req, res) {
        let sample = {
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
        let ajv = new Ajv({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
        let validate = ajv.compile(userModel.UserSchema);
        console.log('valid : ' + validate);
        let valid = validate(sample);
        console.log('valid : ' + valid);
        if (!valid) {
            res.send("sample is not valid");
        }
        else {
            res.send("sample is valid");
        }
    }
    showUserModel(req, res) {
        console.log(userModel.UserSchema);
        res.send(userModel.UserSchema);
    }
    addSubUser(userinfo) {
        let deferred = Q.defer();
        let uti = new utility.utility();
        let db = uti.create_db('gijusers');
        let parents = [];
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
            this.findUserByUsername(userinfo.username).then((res) => {
                let p = res;
                if (p.length) {
                    deferred.reject(new Error('ERROR this user exist'));
                }
                else {
                    console.log('find exist USER');
                    this.findUserByUsername(parents).then((res) => {
                        console.log('find parent');
                        let p = res;
                        if (!p.length) {
                            userinfo.parents.push(uti.defaultUser.username);
                        }
                        userinfo.username = userinfo.username.trim().toLowerCase();
                        let r;
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
                            db.insert(userinfo, userinfo.gui, (err, res) => {
                                if (err)
                                    deferred.reject(err);
                                else {
                                    console.log('user added');
                                    //console.log(res);
                                    deferred.resolve(res);
                                }
                            });
                        }
                    }).catch((err) => {
                        deferred.reject(err);
                    });
                }
            }).catch((err) => {
                deferred.reject(err);
            });
        }
        return deferred.promise;
    }
    findUserByUsername(username) {
        let deferred = Q.defer();
        let uti = new utility.utility();
        let db = uti.create_db('gijusers');
        try {
            console.log('find username : ' + username);
            if (username === undefined)
                username = [];
            else if (typeof (username) === 'string') {
                username = [username];
            }
            db.view(this.__design_view, 'findByUsername', {
                keys: username
            }, (err, res) => {
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
                        let arr = [];
                        for (let index = 0; index < res.rows.length; index++) {
                            const element = res.rows[index].doc;
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
    }
    addUser(userinfo) {
        let deferred = Q.defer();
        let uti = new utility.utility();
        let db = uti.create_db('gijusers');
        let parents = [];
        if (userinfo.parents === undefined) {
            userinfo.parents = ['default'];
        }
        parents.push(userinfo.parents[0]);
        //console.log(userinfo.confirmpassword+"  -  "+userinfo.password);
        if (userinfo.confirmpassword != userinfo.password)
            deferred.reject(new Error('ERROR wrong confirmed password'));
        else
            uti.checkUserByPhone(userinfo.phonenumber).then((res) => {
                //console.log('phone length');
                //console.log(res);
                let p = res;
                if (p.length) {
                    deferred.reject(new Error('ERROR you could not use this phonenumber'));
                }
                else {
                    this.findUserByUsername(userinfo.username).then((res) => {
                        let p = res;
                        if (p.length) {
                            deferred.reject(new Error('ERROR this user exist'));
                        }
                        else {
                            this.findUserByUsername(parents[0]).then((res) => {
                                let p = res;
                                if (!p.length) {
                                    userinfo.parents.push(uti.defaultUser.username);
                                }
                                userinfo.username = userinfo.username.trim().toLowerCase();
                                let r;
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
                                    db.insert(userinfo, userinfo.gui, (err, res) => {
                                        if (err)
                                            deferred.reject(err);
                                        else {
                                            console.log('user added');
                                            //console.log(res);
                                            deferred.resolve(res);
                                        }
                                    });
                                }
                            }).catch((err) => {
                                deferred.reject(err);
                            });
                        }
                    }).catch((err) => {
                        deferred.reject(err);
                    });
                }
            }).catch((err) => {
                deferred.reject(err);
            });
        return deferred.promise;
    }
    findUserByUsernameAndPhone(username, phone) {
        let deferred = Q.defer();
        let uti = new utility.utility();
        let db = uti.create_db('gijusers');
        console.log("finding : " + username + " phone:" + phone);
        db.then(re => {
            re.view(this.__design_view, 'findByUsernameAndPhone', {
                include_docs: true, key: [username + '', phone + '']
            }, (err, res) => {
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
        }).catch(err => {
            deferred.reject(new Error(err));
        });
        return deferred.promise;
    }
    change_password(client) {
        let deferred = Q.defer();
        let uti = new utility.utility();
        let db = uti.create_db('taskmanageruser');
        let username = client.username;
        let gui = client.gui;
        let phone = client.data.user.phone;
        let oldpass = client.data.user.oldpassword;
        let newpass = client.data.user.newpass;
        console.log("username:" + username);
        console.log("phone:" + phone);
        console.log("oldpass:" + oldpass);
        console.log("newpass:" + newpass);
        this.findUserByUsernameAndPhone(username, phone).then((res) => {
            // console.log('found :' + JSON.stringify(res));
            if (res) {
                if (res.password != oldpass)
                    deferred.reject(new Error('ERROR wrong password'));
                let passValidate = uti.validatePassword(newpass);
                if (passValidate.length)
                    deferred.reject(new Error('ERROR validating ' + (passValidate.toString())));
                else {
                    res.password = newpass;
                    console.log('updating ' + JSON.stringify(res));
                    this.updateUser(res).then(res => {
                        let content = 'your password has been changed';
                        //                        this.SMSToPhone(js, content, phone);
                        deferred.resolve('OK');
                    }).catch(err => {
                        deferred.reject(err);
                    });
                }
            }
            else {
                throw new Error('ERROR username and phone not found');
            }
        }).catch((err) => {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    updateUser(userinfo) {
        let deferred = Q.defer();
        let uti = new utility.utility();
        let db = uti.create_db('gijusers');
        try {
            if (!userinfo._rev) {
                userinfo.gui = uti.genUUID();
                userinfo._id = userinfo.gui;
            }
            db.then(re => {
                re.insert(userinfo, userinfo._id, (err, body) => {
                    if (err)
                        throw err;
                    else {
                        deferred.resolve('OK update');
                    }
                });
            }).catch(err => {
                deferred.reject(err);
            });
        }
        catch (error) {
            deferred.reject(error);
        }
        return deferred.promise;
    }
    indUserByUsernameAndPhone(username, phone) {
        let deferred = Q.defer();
        let uti = new utility.utility();
        let db = uti.create_db('taskmanageruser');
        console.log("finding : " + username + " phone:" + phone);
        db.then(re => {
            re.view(this.__design_view, 'findByUsernameAndPhone', {
                include_docs: true, key: [username + '', phone + '']
            }, (err, res) => {
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
        }).catch(err => {
            deferred.reject(new Error(err));
        });
        return deferred.promise;
    }
    forgotPassword(req, res) {
        let client = req.body;
        this.reset_password(client).then(re => {
            client.data.message = re;
            res.send(client);
        }).catch(err => {
            client.data.message = err.message;
            client.data.errormessage = err;
            res.send(client);
        });
    }
    addNewUserManual(req, res) {
        let deferred = Q.defer();
        let client = req.body;
        let uti = new utility.utility();
        let u = {};
        //u = this.cloneObj(client.data.user, u);
        u = client.data.user;
        if (client.data.user.system === undefined) {
            client.data.user.system = [];
        }
        client.data.user.system.push('default');
        client.data.user.system.push('gij');
        this.addSubUser(client.data.user).then((res) => {
            client.data.message = 'OK added a new user';
            deferred.resolve(client);
        }).catch((err) => {
            console.log(err);
            client.data.message = err;
            deferred.reject(client);
        });
        return deferred.promise;
    }
    update_sub_userinfo(client) {
        let deferred = Q.defer();
        try {
            this.findUserByGUI(client.auth.gui).then(res => {
                let p = res;
                this.findUserByGUI(client.data.user.gui).then(res => {
                    let u = res;
                    if (u.parents.indexOf(p.username) > -1) {
                        u.description = client.data.user.description;
                        u.note = client.data.user.note;
                        u.isactive = client.data.user.isactive;
                        //u.phonenumber=client.data.user.phonenumber;                
                        this.updateUser(u).then(res => {
                            client.data.user = u;
                            client.data.message = 'OK update subuser info';
                            deferred.resolve(client);
                        });
                    }
                    else {
                        throw new Error('ERROR you have are not their parents');
                    }
                });
            }).catch(err => {
                throw err;
            });
        }
        catch (error) {
            client.data.message = error;
            deferred.reject(client);
        }
        return deferred.promise;
    }
    reset_password(client) {
        let deferred = Q.defer();
        let uti = new utility.utility();
        this.findUserByPhone(client.data.user.phonenumber).then((res) => {
            if (res) {
                res.password = "123456";
                this.updateUser(res).then((res) => {
                    deferred.resolve('OK 123456');
                });
            }
            else {
                deferred.reject(new Error('ERROR phone number not found'));
            }
        }).catch((err) => {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    resetSubUserPassword(req, res) {
        let deferred = Q.defer();
        let uti = new utility.utility();
        let client = req.body;
        try {
            this.findUserByGUI(client.auth.gui).then(res => {
                let p = res;
                this.findUserByGUI(client.data.user.gui).then(res => {
                    let u = res;
                    if (u.parents.indexOf(p.username) > -1) {
                        u.password = '123456';
                        this.updateUser(u).then(res => {
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
            }).catch(err => {
                throw err;
            });
        }
        catch (error) {
            client.data.message = error;
            deferred.reject(client);
        }
        return deferred.promise;
    }
    findUserByPhone(phone) {
        let deferred = Q.defer();
        let uti = new utility.utility();
        let db = uti.create_db('taskmanageruser');
        db.then(re => {
            re.view(this.__design_view, 'findByPhone', {
                include_docs: true, key: phone + ''
            }, (err, res) => {
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
        }).catch(err => {
            deferred.reject(err);
        });
        return deferred.promise;
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map