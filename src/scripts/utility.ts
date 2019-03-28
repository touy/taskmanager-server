import * as uuidv from 'uuid';
import * as Nano from "nano";
let nano = Nano('http://localhost:5984');
export class utility {
    public isJSON(str: any) {
        try {
            return (JSON.parse(str) && !!str);
        }
        catch (e) {
            return false;
        }
    }
    public genUUID(){
        return uuidv();
    }
    public async createDB(dbname:string):Promise<any>{
        //await nano.db.destroy(dbname)
        await nano.db.create(dbname);
        return nano.use(dbname);
      }
}
