import { readFileSync } from "fs";
import { app } from "../../webserver/express";
import { compileNetworkStats } from "../sdhelpers";
export const startWebUi = ()=>{
app.get("/webui/",(req,res)=>{
    // set to html
    res.setHeader("Content-Type","text/html");
    res.send(readFileSync(__dirname+"/web.html"));
})
app.get("/webui/ping", (req, res) => {
    res.send(compileNetworkStats(req.query.job))
})
}
