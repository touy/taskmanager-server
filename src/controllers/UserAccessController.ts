import * as Nano from 'nano';
import * as Ajv from 'ajv';
import * as userModel from '../models/UserModel';
import * as loginModel from '../models/LoginModel';
import { Request, Response } from 'express';
import { NextFunction } from 'connect';


export class userAccessController {

    public authentication(req: Request, res: Response) {
        console.log(userModel);
        res.send(userModel);
    }
    public accessControl(req: Request, res: Response,next: NextFunction) {
        console.log(userModel);
        res.send(userModel);
    }
}
