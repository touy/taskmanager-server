"use strict";
exports.__esModule = true;
var UserController_1 = require("../controllers/UserController");
var UserAccessController_1 = require("../controllers/UserAccessController");
var Routes = /** @class */ (function () {
    function Routes() {
        this.userController = new UserController_1.UserController();
    }
    Routes.prototype.routes = function (app) {
        app.route('/showUserModel')
            .get(this.userController.showUserModel);
        app.route('/testUserValidator')
            .get(this.userController.testUserValidator);
        app.route('/')
            .get(function (req, res) {
            // show first page or index page 
            res.status(200).send({
                message: 'GET request successfulll!!!!'
            });
        });
        // Contact 
        app.route('/contact')
            // GET endpoint 
            .get(function (req, res) {
            // Get all contacts            
            res.status(200).send({
                message: 'GET request successfulll!!!!'
            });
        })
            // POST endpoint
            .post(function (req, res) {
            // Create new contact         
            res.status(200).send({
                message: 'POST request successfulll!!!!'
            });
        });
        // Contact detail
        app.route('/contact/:contactId')
            // get specific contact
            .get(function (req, res) {
            // Get a single contact detail            
            res.status(200).send({
                message: 'GET request successfulll!!!!'
            });
        })
            .put(function (req, res) {
            // Update a contact           
            res.status(200).send({
                message: 'PUT request successfulll!!!!'
            });
        })["delete"](function (req, res) {
            // Delete a contact     
            res.status(200).send({
                message: 'DELETE request successfulll!!!!'
            });
        });
        app.route('/user')
            .post(function (req, res) {
            var client = req.body;
            // let userc=new UserController();
            var usera = new UserAccessController_1.userAccessController();
            var userc = new UserController_1.UserController();
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
            .post(function (req, res) {
            var client = req.body;
            var command = client.data.command;
            // check admin authorize
            // check command 
            var client = req.body;
            // let userc=new UserController();
            var usera = new UserAccessController_1.userAccessController();
            var userc = new UserController_1.UserController();
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
    };
    return Routes;
}());
exports.Routes = Routes;
