"use strict";
exports.__esModule = true;
var utility = require("../scripts/utility");
var userAccessController = /** @class */ (function () {
    function userAccessController() {
        this.__design_view = "objectList";
    }
    userAccessController.prototype.authentication = function (req, res) {
        var _this = this;
        var uti = new utility.utility();
        var js = req.body;
        (!js.data || js.data === undefined) ? js.data = {} : js.data;
        var db = uti.create_db('taskmanageruser');
        // CHECK ACCESS TOKEN & IP 
        var usr = js.data.user;
        // AUTHENTICATION
        db.then(function (re) {
            re.view(_this.__design_view, 'authentication', {
                'keys': [usr.username, usr.password]
            }).then(function (body) {
                if (body.rows.length) {
                    js.client.logintoken = uti.genUUID();
                    js.client.logintime = new Date();
                    js.client.data.user = {};
                    js.client.message = "OK LOGIN";
                    res.send(js);
                }
                else {
                    js.client.logintoken = "";
                    js.client.logintime = "";
                    js.client.data.user = {};
                    js.client.message = "ERROR WRONG USERNAME OR PASSWORD";
                    res.send(js);
                }
            });
        })["catch"](function (err) {
            res.send(js);
        });
    };
    userAccessController.prototype.accessControl = function (req, res, next) {
        var uti = new utility.utility();
        var js = req.body;
        (!js.data || js.data === undefined) ? js.data = {} : js.data;
        var login = js.logintoken;
        // CHECK ACCESS TOKEN & IP 
        // CHECK LOGIN TOKEN ( AUTHORIZATION )
        // PASS IF LOGIN OK
        // GO TO LOGIN IF LOGIN ERROR
    };
    userAccessController.prototype.authenticationSuper = function (req, res) {
        var uti = new utility.utility();
        var js = req.body;
        (!js.data || js.data === undefined) ? js.data = {} : js.data;
        var db = uti.create_db('taskmanageruser');
        // CHECK ACCESS TOKEN & IP 
        var usr = js.data.user;
        // AUTHENTICATION SUPER admin
        if (usr.username === "superadmin" && usr.password === "123456@!!!") {
            js.username = "superadmin";
            js.logintime = new Date();
            js.loginip = "";
            js.logintoken = uti.genUUID();
            js.data.user.password = "";
            js.data.user.username = "";
            res.send(js);
        }
    };
    return userAccessController;
}());
exports.userAccessController = userAccessController;
