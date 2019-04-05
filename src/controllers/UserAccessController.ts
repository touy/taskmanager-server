import * as Nano from 'nano';
import * as Ajv from 'ajv';
import * as loginModel from '../models/LoginModel';
import * as utility from '../scripts/utility';
import { Request, Response } from 'express';
import { NextFunction } from 'connect';

var __design_view = "objectList";

export class userAccessController {
    
    public authentication(req: Request, res: Response) {
        let uti=new utility.utility();
        let js =req.body;
        (!js.data || js.data === undefined) ? js.data = {} : js.data;
        let usr = js.data.user;
        let db=uti.create_db('taskmanageruser');
        // CHECK ACCESS TOKEN & IP 
        // AUTHENTICATION
        db.then((re)=>{
            re.view('_designObject', 'authentication', {
                'keys': ['username', 'password']
              }).then((body) => {
                if(body.rows.length){
                    js.client.logintoken="";
                    js.client.logintime=new Date();
                    js.client.data.user={};
                    js.client.message="OK LOGIN";
                    res.send(js);
                }else{
                    js.client.logintoken="";
                    js.client.logintime="";
                    js.client.data.user={};
                    js.client.message="ERROR WRONG USERNAME OR PASSWORD";
                    res.send(js);
                }
              });
        }).catch((err)=>{
            res.send(js)
        });
    }
    public accessControl(req: Request, res: Response,next: NextFunction) {
        let uti=new utility.utility();
        let js =req.body;
        (!js.data || js.data === undefined) ? js.data = {} : js.data;
        let usr = js.data.user;
        // CHECK ACCESS TOKEN & IP 
        // CHECK LOGIN TOKEN ( AUTHORIZATION )
        // PASS IF LOGIN OK
        // GO TO LOGIN IF LOGIN ERROR
        
    }
}
