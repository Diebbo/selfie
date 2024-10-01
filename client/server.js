import { createApp } from './src/app.js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createDataBase } from './src/database.js';
import { fork } from 'child_process';
import next from 'next';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await nextApp.prepare();

        const db = await createDataBase();
        console.log('server.js: connected to database');

        // Start the notification worker
        const notificationWorker = fork(path.join(__dirname, 'notificationWorker.js'));
        notificationWorker.send({ message: 'Notification worker started' });
        notificationWorker.on('message', (message) => {
            console.log('Notification Worker:', message);
        });

        console.log('server.js: createApp');
        const app = createApp({
            dirpath: __dirname,
            database: db,
        });

        // Add Next.js request handler
        app.all('*', (req, res) => {
            return handle(req, res);
        });

        app.listen(PORT, (err) => {
            if (err) throw err;
            console.log(`> Ready on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

startServer();
