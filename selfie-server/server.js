import { createApp } from './src/app.js';
import indexRouter from './src/routes/index.js';
import authRouter from './src/routes/auth.js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

config();

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const PORT = process.env.PORT || 3000;

console.log('server.js: createApp');
const app = createApp({
    indexRouter,
    authRouter,
    dirpath: __dirname
});

app.listen(PORT, function () {
    console.log(`Server listening on port ${PORT}`);
});

