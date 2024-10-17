import { createApp } from "./src/app.js";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createDataBase } from "./src/database.js";
import { fork } from "child_process";
import next from "next";

const result = config();
if (result.error) {
  config({ path: "/webapp/.env" });
}

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV === "production") {
  const dev = false;
  const nextApp = next({ dev, dir: "/webapp", distDir: "nextbuild" });
  const handle = nextApp.getRequestHandler();
  try {
    await nextApp.prepare();
  } catch (error) {
    console.log("Error starting next.js:", error);
    exit(1);
  }
}

// connect to the database
try {
  var db = await createDataBase();
  console.log("server.js: connected to database");
} catch (err) {
  console.log(err);
  exit(1);
}

// start the notification worker
/*try {
  const notificationWorker = fork(
    path.join(__dirname, "notificationWorker.js"),
  );
  notificationWorker.send({ message: "Notification worker started" });
  notificationWorker.on("message", (message) => {
    console.log("Notification Worker:", message);
  });
} catch (error) {
  console.log("Error starting notification worker:", error);
  exit(1);
}
*/
console.log("server.js: createApp");
const app = createApp({
  dirpath: __dirname,
  database: db,
});

app.listen(PORT, function () {
  console.log(`Server listening on port ${PORT}`);
});
