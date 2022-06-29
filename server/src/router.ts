// @ts-nocheck
import express from "express";
import http from "http";
import socketio from "socket.io";
import cors from "cors";
import users from "./users";

const bp = require("body-parser");
const port = process.env.PORT || 8000;
const app = express();
const httpServer = http.createServer(app);
const io = new socketio.Server(httpServer);

export class Router {
  constructor() {
    httpServer.listen(port, () => {
      //console.log("server listening on port", port);
    });
    app.use(cors());
    app.use(bp.json());
    app.use(bp.urlencoded({ extended: true }));

    app.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      next();
    });

    app.use("/users", users);

    io.on("connect", (socket: any) => {
      //console.log("connected");

      socket.on("disconnect", () => {
        //console.log("disconnect");
      });
    });
  }
}
