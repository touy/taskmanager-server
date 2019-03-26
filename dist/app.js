"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
// Our Express APP config
const app = express();
// API Endpoints
app.get("/", (req, res) => {
    res.send("Hi");
});
// export our app
exports.default = app;
