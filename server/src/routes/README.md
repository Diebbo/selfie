# How to add a router
1. Create a new file in the `routers` directory.
2. Add the following code to the file:
```javascript
import express from 'express';
import cookieJwtAuth from './middleware/cookieJwtAuth.js';

//creo calendario 
function createExampleRouter(db) {
    const router = express.Router();
    router.use(cookieJwtAuth);
    
    router.get('/example', async (req, res) => {
        res.send('Hello World!');
    });
    
    return router;
    }
}
export default createExampleRouter;
```
3. Import the router in `index.js` and add it to the app:
```javascript
import createExampleRouter from './routers/example.js';
...
console.log("createApp.js: initialize routes");
app.use('/api/examplecollection', createExampleRouter(db));
...
```
4. add useful db functions in `db.js`:
```javascript
import { noteSchema } from "./models/note-model.js";
export async function createDataBase() {
...
  const noteModel = mongoose.model("note", noteSchema);
...
  const createNote = async (note) => {
    const res = await noteModel.create({ note: note });
    return res;
  }

  return { login, register, changeDateTime, createEvent, createNote };
}
```
> remember to import the schema and initialize the model in the router file
5. Add the schema to `models` directory
```javascript
import mongoose from 'mongoose';
export const noteSchema = new mongoose.Schema({
    note: String,
    date: { type: Date, default: Date.now }
});
```
