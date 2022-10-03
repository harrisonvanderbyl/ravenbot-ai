import body from "body-parser";
import config from "./../../../config.json";
import { createServer } from "https";
import debug from "../../../offline.json";
import express from "express";
import { readFileSync } from "fs";
export const app = express();

app.use(body.text({ limit: "50mb" }));
app.use(body.json({ limit: "50mb" }));
console.log("Starting load of server");

// Certificate for Domain 1

// httpsServer.addContext('<domain3.com>', credentials3); if you have the thrid domain.
// httpsServer.addContext('<domain4.com>', credentials4); if you have the fourth domain.

//..
console.log("Exporting starts");

export const start = async () => {
  // certs for https
  if (!debug.debug) {
    const privateKey1 = readFileSync(
      "/etc/letsencrypt/live/" + config.serverUrl + "/privkey.pem",
      "utf8"
    );
    console.log(privateKey1);
    const certificate1 = readFileSync(
      "/etc/letsencrypt/live/" + config.serverUrl + "/cert.pem",
      "utf8"
    );
    const ca1 = readFileSync(
      "/etc/letsencrypt/live/" + config.serverUrl + "/chain.pem",
      "utf8"
    );
    const credentials1 = {
      key: privateKey1,
      cert: certificate1,
      ca: ca1,
    };
    console.log("Ending load of certs");
    // Certificate for Domain 3
    // ... (just like line 22-29)
    // Certificate for Domain 4
    // ... (just like line 22-29)
    // Starting both http & https servers
    //const httpServer = http.createServer(app);
    const httpsServer = createServer(credentials1, app);
    console.log("Starting server");
    httpsServer.listen(443, () => {
      console.log("HTTPS Server running on port 443");
    });
  }
};
