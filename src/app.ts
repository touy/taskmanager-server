import * as Nano from "nano";
let nano = Nano('http://localhost:5984');
import * as fs from 'fs';
import * as path from 'path';
import * as express from "express";
import * as bodyParser from "body-parser";
import { Routes } from "./routes/Routes";
class App {

  public app: express.Application;
  public routePrv: Routes = new Routes();

  constructor() {
      this.app = express();
      this.config();      
      this.routePrv.routes(this.app);      
  }
  private config(): void{
      // support application/json type post data
      this.app.use(bodyParser.json());
      //support application/x-www-form-urlencoded post data
      this.app.use(bodyParser.urlencoded({ extended: false }));
  }

}

export default new App().app;