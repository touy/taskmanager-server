import * as Nano from 'nano';
import * as Ajv from 'ajv';
import * as userModel from '../models/UserModel';
import { Request, Response } from 'express';
import * as uuidv from 'uuid';

export class UserController {

    public addNewUser(req: Request, res: Response) {
        let id = uuidv();
        let ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
        let js = req.body;
        let usr = js.data.user;
        let validate = ajv.compile(userModel);
        let valid = validate(usr);
        if (!valid) {
            console.log(validate.errors);
            js.data.user = {};
            js.data.error = validate.errors;
            js.data.message = 'Error validate add new user';
            res.send(js);
        } else {
            js.data.user = {};
            js.data.error = {};
            js.data.message = 'add new user success fully ' + usr.userName;
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
        let ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
        let validate = ajv.compile(userModel);
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
        console.log(userModel);
        res.send(userModel);
    }
}
