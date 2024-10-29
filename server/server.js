// Modified server.js
import { createApp } from "./src/app.js";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createDataBase } from "./src/database.js";
import { Server } from "socket.io";
import { createServer } from "http";
import { createWebSocket } from "./src/socket.js";
import { waitForDebugger } from "inspector";
import createNotificationWorker from "./src/pushNotificationWorker.js";

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 8000;

async function startServer() {
  try {
    // Connect to database
    const db = await createDataBase();
    console.log("server.js: connected to database");

    const sendNotification = createNotificationWorker(db);

    // Create Express app
    const app = createApp({
      dirpath: __dirname,
      database: db,
      sendNotification: sendNotification,
    });

    // Create HTTP server
    const httpServer = createServer(app);

    // Create WebSocket server
    const io = new Server(httpServer, {
      cors: {
        origin: "*", // Add your client URLs
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Initialize WebSocket with database access
    const ws = createWebSocket(io, db);

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
