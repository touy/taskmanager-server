import * as uuidv from 'uuid';
import * as Nano from "nano";
import * as async from 'async';
import * as Q from 'q';
import * as redis from 'redis';
import * as loginModel from '../models/LoginModel';

let nano = Nano('http://localhost:5984');
let r_client =redis.createClient();
let _current_system="tastmanagement";
export class utility {
    public isJSON(str: any) {
        try {
            return (JSON.parse(str) && !!str);
        }
        catch (e) {
            return false;
        }
    }
    public genUUID(){
        return uuidv();
    }
    public async create_db(dbname:string):Promise<Nano.DocumentScope<any>>{
        nano.db.create(dbname, (err, body) => {
            // specify the database we are going to use    
            if (!err) {
                console.log('database ' + dbname + ' created!');
            } else
                console.log(dbname + " could not be created!");
        });
        return nano.use(dbname);
      }
    public async initDB(dbname:string,design:any):Promise<any>{
        // create a new database
        var db:any;
        async.eachSeries([
            db = this.create_db(dbname),
            db = nano.use(dbname),
            db.insert(design, (err, res) => {
                if (err) {
                    //console.log(design);
                    //console.log(err);
                    db.get('_design/objectList', (err, res) => {
                        if (err) {
                            console.log(dbname);
                            console.log(design);
                            console.log('could not find design ' + err);
                        } else {
                            if (res) {
                                var d = res;
                                //console.log("d:"+JSON.stringify(d));
                                db.destroy('_design/objectList', d._rev, (err, res) => {
                                    if (err) console.log(err);
                                    else {
                                        //console.log(res);
                                        db.insert(design, "_design/objectList", (err, res) => {
                                            if (err) console.log('err insert new design ' + dbname + err);
                                            else {
                                                //console.log('insert design completed ' + dbname);
                                            }
                                        });
                                    }
                                });
                            } else {
                                db.insert(design, "_design/objectList", (err, res) => {
                                    if (err) console.log('err insert new design ' + dbname + err);
                                    else {
                                        //console.log('insert design completed ' + dbname);
                                    }
                                });
                                // console.log("could not find design");
                            }
                        }
                    });
                } else {
                    console.log('created design ' + dbname);
                }

            })
        ], (err) => {
            console.log('exist ' + dbname);
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
            if (except.indexOf(js.client.data.command) > -1) {
                js.client.data.message = 'OK';
                deferred.resolve(js);
            } else {
                r_client.get(_current_system + '_login_' + js.client.logintoken, (err, r) => {
                    if (err) {
                        js.client.data.message = err;
                        deferred.reject(js);
                    } else {
                        if (r) {
                            let res = JSON.parse(r) as loginObj;
                            if (res.client.logintoken !== undefined) {
                                js.client.data.message = 'OK';
                                r_client.get(_current_system + '_usergui_' + js.client.logintoken, (err, r) => {
                                    if (err) {
                                        js.client.data.message = err;
                                        deferred.reject(js);
                                    } else {
                                        let res = JSON.parse(r) as guiObj;
                                        if (res.gui) {
                                            js.client.data.message = 'OK authorized'
                                            js.client.auth = {};
                                            js.client.auth.gui = res.gui;
                                            deferred.resolve(js);
                                        } else {
                                            js.client.data.message = new Error('ERROR empty login');
                                            deferred.resolve(js);
                                        }
                                    }
                                });
                            } else {
                                js.client.data.message = new Error('ERROR empty login');
                                deferred.resolve(js);
                            }
                        }
                        else {
                            js.client.data.message = new Error('ERROR empty login');
                            deferred.resolve(js);
                        }
                    }
                });
            }

        } catch (error) {
            js.client.data.message = error;
            deferred.reject(js);
        }
        return deferred.promise;
    }
}
export interface guiObj {
    command: string;
    gui: string;
}
export interface loginObj {
    command: string;
    client: any;
}
export interface client {
    gui: '',
    username: '',
    logintoken: '',
    logintime: '',
    loginip: '',
    data: any,
    auth: any
};
export interface phoneObj {
    command: string;
    secret: string;
}
export interface onlineObj {
    command: string;
    client: {
        username: string;
        onlinetime: Date;
        system: string;
        login: Array<any>;
    }
}
export interface photoObj {
    name: string;
    arraybuffer: string;
    type: string;
    url: string;
}