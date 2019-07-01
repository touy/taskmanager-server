"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utility = require("../scripts/utility");
class userAccessController {
    constructor() {
        this.__design_view = "objectList";
    }
    authentication(req, res) {
        let uti = new utility.utility();
        let js = req.body;
        (!js.data || js.data === undefined) ? js.data = {} : js.data;
        let db = uti.create_db('taskmanageruser');
        // CHECK ACCESS TOKEN & IP 
        let usr = js.data.user;
        // AUTHENTICATION
        db.then((re) => {
            re.view(this.__design_view, 'authentication', {
                'keys': [usr.username, usr.password]
            }).then((body) => {
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
        }).catch((err) => {
            res.send(js);
        });
    }
    accessControl(req, res, next) {
        let uti = new utility.utility();
        let js = req.body;
        (!js.data || js.data === undefined) ? js.data = {} : js.data;
        let login = js.logintoken;
        // CHECK ACCESS TOKEN & IP 
        // CHECK LOGIN TOKEN ( AUTHORIZATION )
        // PASS IF LOGIN OK
        // GO TO LOGIN IF LOGIN ERROR
    }
    authenticationSuper(req, res) {
        let uti = new utility.utility();
        let js = req.body;
        (!js.data || js.data === undefined) ? js.data = {} : js.data;
        let db = uti.create_db('taskmanageruser');
        // CHECK ACCESS TOKEN & IP 
        let usr = js.data.user;
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
    }
}
exports.userAccessController = userAccessController;
//# sourceMappingURL=UserAccessController.js.map