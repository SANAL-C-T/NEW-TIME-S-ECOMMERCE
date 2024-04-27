const express = require("express");
const server = express();
const bodyparser = require("body-parser");
const path = require('path');
const session = require('express-session');
const uuid = require('uuid');
const secrettt = uuid.v4();
const cookie = require("cookie-parser")



server.use(express.static('assets'));
server.use(express.static('upload'));// upload is the root folder, i dont need to specify the folder in any path.were the item is required from this folder.
server.use(express.static('uploadBanner'));
// configeration file should be in server.
server.set("view engine", "ejs")
server.engine("html", require("ejs").renderFile)
server.set("views", "views");

server.use(
    session({
        secret: secrettt,
        resave: false,
        saveUninitialized: true,
     
    })
);

server.use(bodyparser.json());
server.use(bodyparser.urlencoded({ extended: true }))



server.use(cookie())

const userRoute = require("./router/userroute")
const adminRoute = require("./router/adminroute");
const cookieParser = require("cookie-parser");


//router middleware
server.use("/admin", adminRoute.adminUrlRouter)//this order is to maintained otherwise wild route will caise error.
server.use("/", userRoute.userUrlRouter)//wild route is inside here.

server.listen(3000)