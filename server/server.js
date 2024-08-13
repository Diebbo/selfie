import { createApp } from './src/app.js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createDataBase } from './src/database.js';

// db Models
import { userSchema } from "./src/models/login-model.js";
import { timeSchema } from "./src/models/time-model.js";

config();

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const PORT = process.env.PORT || 3000;

// connect to the database
console.log('server.js: createDataBase');
try{
    var db = await createDataBase({userSchema, timeSchema})
}catch(err){
    console.log(err);
}

console.log('server.js: createApp');
const app = createApp({
    dirpath: __dirname,
    database: db,
});

app.listen(PORT, function () {
    console.log(`Server listening on port ${PORT}`);
});

