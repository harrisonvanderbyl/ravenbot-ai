import { readFileSync } from "fs";
import { app } from "../../webserver/express";
import { compileNetworkStats } from "../sdhelpers";
export const startWebUi = ()=>{
app.get("/webui/",(req,res)=>{
    res.send(readFileSync(__dirname+"/webui.html"));
})
app.get("/webui/ping", (req, res) => {
    res.send(compileNetworkStats(req.query.job))
})
}
