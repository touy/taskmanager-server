import { Request, Response } from "express";
import * as express from "express";
import { UserController } from "../controllers/UserController";
import { userAccessController } from "../controllers/UserAccessController";
export class Routes {
    public userController: UserController = new UserController();
    public routes(app: express.Application): void {

        app.route('/showUserModel')
            .get(this.userController.showUserModel);
        app.route('/testUserValidator')
            .get(this.userController.testUserValidator);


        app.route('/')
            .get((req: Request, res: Response) => {
                // show first page or index page 
                res.status(200).send({
                    message: 'GET request successfulll!!!!'
                });
            });



        // Contact 
        app.route('/contact')
            // GET endpoint 
            .get((req: Request, res: Response) => {
                // Get all contacts            
                res.status(200).send({
                    message: 'GET request successfulll!!!!'
                });
            })
            // POST endpoint
            .post((req: Request, res: Response) => {
                // Create new contact         
                res.status(200).send({
                    message: 'POST request successfulll!!!!'
                });
            });

        // Contact detail
        app.route('/contact/:contactId')
            // get specific contact
            .get((req: Request, res: Response) => {
                // Get a single contact detail            
                res.status(200).send({
                    message: 'GET request successfulll!!!!'
                });
            })
            .put((req: Request, res: Response) => {
                // Update a contact           
                res.status(200).send({
                    message: 'PUT request successfulll!!!!'
                });
            })
            .delete((req: Request, res: Response) => {
                // Delete a contact     
                res.status(200).send({
                    message: 'DELETE request successfulll!!!!'
                });
            });



        app.route('/user')
            .post((req: Request, res: Response) => {
                var client = req.body;
                // let userc=new UserController();
                let usera = new userAccessController();
                let userc = new UserController();
                // return req.body;
                var command = client.data.command;
                switch (command) {
                    case "login":
                        usera.authentication(req, res);
                        break;
                    case "forgotpassword":
                        userc.forgotPassword(req, res);
                        break;
                    case "forgotusernamegin":
                        break;
                    case "profile":
                        userc.userDetails(req, res);
                        break;
                    case "createuser":

                        break;
                    case "updateuser":

                        break;
                    case "verticalusersline":

                        break;
                    case "verticalusersline":

                        break;
                    // createdoc
                    // updatedoc
                    // createjob
                    // updatejob
                    // doclist
                    // joblist 
                    // approvaluserlist
                    // pendingapprovelist
                    // 


                    default:
                        break;
                }
                res.status(200).send({
                    message: 'GET request successfulll!!!!'
                });
            });

        app.route('/admin')
            .post((req: Request, res: Response) => {
                var client = req.body;
                var command = client.data.command;

                // check admin authorize

                // check command 
                var client = req.body;
                // let userc=new UserController();
                let usera = new userAccessController();
                let userc = new UserController();
                // return req.body;
                var command = client.data.command;
                switch (command) {
                    case "reset-sub-user-password":
                        userc.resetSubUserPassword(req, res);
                        break;
                    case "reset-sub-user-password":
                        userc.addNewUserManual(req, res);
                        break;
                    default:
                        break;
                }
                res.status(200).send({
                    message: 'GET request successfulll!!!!'
                });
            });


    }
}