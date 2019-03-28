import * as Nano from 'nano';
import * as Ajv from 'ajv';
import * as userModel from '../models/UserModel';
import { Request, Response } from 'express';
import * as utility from '../scripts/utility';

export class UserController {

    public addNewUser(req: Request, res: Response) {
        let ajv = new Ajv({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
        let js = req.body;
        (!js.data || js.data === undefined) ? js.data = {} : js.data;
        let usr = js.data.user;
        try {
            if(!usr || usr === undefined){
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
}
