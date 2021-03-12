"use strict";

require("dotenv").config();

var express = require("express");

var path = require("path");

var logger = require("morgan");

var cors = require("cors");

var bodyParser = require("body-parser"); // dependencies injection


var session = require("express-session"); //sessions make data persist between http calls


var _require = require("http-proxy-middleware"),
    createProxyMiddleware = _require.createProxyMiddleware;

var app = express();
app.use(logger("dev"));
var apiProxy = createProxyMiddleware("/api/aggregator", {
  target: "https://aggregator-api.mission-climat.io",
  pathRewrite: {
    "^/api/aggregator": ""
  },
  secure: false,
  // onProxyReq: (proxy, req, res) => {},
  headers: {
    Authorization: "Token ".concat(process.env.AGGREGATOR_API_TOKEN),
    "Content-Type": "application/json"
  },
  changeOrigin: true
});
app.use(apiProxy);
app.use(express.json());
app.use(express.urlencoded({
  extended: false
})); // app.use(cookieParser());

var allowedOrigins = [process.env.FRONTEND_URI, process.env.FRONTEND_URL_SECURE];
var corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express["static"](path.join(__dirname, "/public")));
app.use(session({
  cookie: {
    secure: false,
    maxAge: 4 * 60 * 60 * 1000
  },
  // 4 hours
  resave: true,
  saveUninitialized: true,
  secret: process.env.SECRET_SESSION
})); // app.use(function (req, res, next) {
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//        res.setHeader('Access-Control-Allow-Origin', origin);
//   }
//   // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.use("/api/sheet", require("./routes/gsheet"));
app.use("*", function (req, res, next) {
  console.log("here");
  res.sendFile(path.join(__dirname, "/public/index.html"));
});
module.exports = app;