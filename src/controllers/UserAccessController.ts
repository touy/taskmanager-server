import * as Nano from 'nano';
import * as Ajv from 'ajv';
import * as loginModel from '../models/LoginModel';
import * as utility from '../scripts/utility';
import { Request, Response } from 'express';
import { NextFunction } from 'connect';


export class userAccessController {

    public authentication(req: Request, res: Response) {
        let uti=new utility.utility();
        let js =req.body;
        (!js.data || js.data === undefined) ? js.data = {} : js.data;
        let usr = js.data.user;
        let db=uti.createDB('taskmanageruser');
        db.then((res)=>{
            res.view();
            res.send(loginModel);
        }).catch((err)=>{
            res.send(js)
        });
        res.send(loginModel);
    }
    public accessControl(req: Request, res: Response,next: NextFunction) {
        let uti=new utility.utility();
        let js =req.body;
        (!js.data || js.data === undefined) ? js.data = {} : js.data;
        let usr = js.data.user;
        let db=uti.createDB('taskmanageruser');
        db.then((res)=>{
            res.view();
            res.send(loginModel);
        }).catch((err)=>{
            res.send(js)
        });
        res.send(loginModel);
    }
}
