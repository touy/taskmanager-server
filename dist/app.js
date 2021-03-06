"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Nano = require("nano");
let nano = Nano('http://localhost:5984');
const express = require("express");
const bodyParser = require("body-parser");
const Routes_1 = require("./routes/Routes");
class App {
    constructor() {
        this.routePrv = new Routes_1.Routes();
        this.app = express();
        this.config();
        this.routePrv.routes(this.app);
    }
    config() {
        // support application/json type post data
        this.app.use(bodyParser.json());
        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }
}
exports.default = new App().app;
//# sourceMappingURL=app.js.map