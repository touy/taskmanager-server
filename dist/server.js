"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
app_1.default.set("port", process.env.PORT || 3000);
const server = app_1.default.listen(app_1.default.get("port"), () => {
    console.log("App is running on http://localhost:%d in %s mode", app_1.default.get("port"), app_1.default.get("env"));
});
exports.default = server;
