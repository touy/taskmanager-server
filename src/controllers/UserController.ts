import * as Nano from 'nano';
import * as Ajv from 'ajv';
import * as userModel from '../models/UserModel';
import { Request, Response } from 'express';
import * as utility from '../scripts/utility';
import * as moment from 'moment-timezone';
import * as Q from 'q';

export class UserController {
    private __design_view: string = "objectList";
    public addNewUser(req: Request, res: Response) {
        let ajv = new Ajv({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
        let js = req.body;
        let ut = new utility.utility();
        let db = ut.create_db('taskmanageruser');
        (!js.data || js.data === undefined) ? js.data = {} : js.data;
        let usr = js.data.user;
        try {
            if (!usr || usr === undefined) {
                throw Error('Error user data is empty or undefined');
            };
            let validate = ajv.compile(userModel.UserSchema);
            let valid = validate(usr);
            if (!valid) {
                console.log(validate.errors);
                js.data.user = {};
                js.data.error = validate.errors;
                js.data.message = 'Error validate add new user';
                res.send(js);
            } else {
                // ADD TO DATABASE HERE
                db.then(re=>{
                    
                });
                js.data.user = {};
                js.data.error = {};
                js.data.message = 'add new user success fully ' + usr.userName;
                res.send(js);
            }
        } catch (error) {
            console.log(error);
            js.data.user = {};
            js.data.error = error;
            js.data.message = "Error adding a new user";
            res.send(js)
        }

    }
    public userDetails(req: Request, res: Response) {

        let ajv = new Ajv({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
        let js = req.body;
        (!js.data || js.data === undefined) ? js.data = {} : js.data;
        let usr = js.data.user;
        let validate = ajv.compile(userModel.UserSchema);
        let valid = validate(usr);
        if (!valid) {
            console.log(validate.errors);
            js.data.user = {};
            js.data.error = validate.errors;
            js.data.message = 'Error validate user details';
            res.send(js);
        } else {
            // QUERY FROM DATA BASE HERE

            js.data.user = {};
            js.data.error = {};
            js.data.message = 'OK User details ' + usr.userName;
            res.send(js)
        }
    }
    public testUserValidator(req: Request, res: Response) {
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
        } else {
            res.send("sample is valid");
        }
    }
    public showUserModel(req: Request, res: Response) {
        console.log(userModel.UserSchema);
        res.send(userModel.UserSchema);
    }
    addSubUser(userinfo) {
        let deferred = Q.defer();
        let uti=new utility.utility();
        let db = uti.create_db('gijusers') as any;
        let parents = [];
        if (userinfo.parents === undefined) {
            userinfo.parents = ['default'];
        }
        else parents = userinfo.parents;
        console.log(userinfo.confirmpassword + "  -  " + userinfo.password);
        if (userinfo.confirmpassword != userinfo.password) {
            deferred.reject(new Error('ERROR wrong confirmed password'));
        }
        else {
            console.log('find sub username ');
            console.log(userinfo);
            this.findUserByUsername(userinfo.username).then((res) => {                
                let p = res as utility.gijuser[];
                if (p.length) {
                    deferred.reject(new Error('ERROR this user exist'));
                } else {
                    console.log('find exist USER');
                    this.findUserByUsername(parents).then((res) => {
                        console.log('find parent');
                        let p = res as utility.gijuser[];
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
                                if (err) deferred.reject(err);
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
        let uti=new utility.utility();
        let db = uti.create_db('gijusers') as any;
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
                if (err) deferred.reject(err);
                else {
                    //console.log(res);
                    console.log('find users');
                    // console.log(res.rows[0].doc);
                    if (res.rows.length == 1) {
                        deferred.resolve([res.rows[0].doc]);
                    } else if (res.rows.length > 1) {
                        let arr = [];
                        for (let index = 0; index < res.rows.length; index++) {
                            const element = res.rows[index].doc;
                            arr.push(element);
                        }

                        deferred.resolve(arr);
                    } else {
                        deferred.resolve([]);
                    }
                }
            });
        } catch (error) {
            deferred.reject(error);
        }

        return deferred.promise;
    }

    addUser(userinfo) {
        let deferred = Q.defer();
        let uti=new utility.utility();
        let db = uti.create_db('gijusers') as any;
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
                let p = res as utility.gijuser[];
                if (p.length) {
                    deferred.reject(new Error('ERROR you could not use this phonenumber'));
                } else {

                    this.findUserByUsername(userinfo.username).then((res) => {
                        let p = res as utility.gijuser[];
                        if (p.length) {
                            deferred.reject(new Error('ERROR this user exist'));
                        } else {
                            this.findUserByUsername(parents[0]).then((res) => {
                                let p = res as utility.gijuser[];
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
                                        if (err) deferred.reject(err);
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

    
}
