var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

const surveysRouter = require("./routes/api/survey");

var app = express();

app.set("view engine", "html");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/survey", surveysRouter);

// LIMESURVEY API TEST
var request = require("request");
const lime_user = "admin";
const lime_password = "password";

//******GLOBAL***************
var SESSIONKEY = "";
var limeAPI = {
  url:
    "http://localhost:80/limesurvey/LimeSurvey/index.php/admin/remotecontrol",
  method: "POST",
  headers: {
    host: "localhost:80",
    path: "/limesurvey/LimeSurvey/index.php/admin/remotecontrol",
    connection: "keep-alive",
    "content-type": "application/json"
  }
};

limeAPI.body = JSON.stringify({
  method: "get_session_key",
  params: [lime_user, lime_password],
  id: 2
});

request(limeAPI, (error, response, body) => {
  if (!error && response.statusCode == 200) {
    body = JSON.parse(body);

    //*********KEEP THE KEY*********
    if (SESSIONKEY === "") {
      console.log("NEW KEY -->" + body.result);
      SESSIONKEY = body.result;

      //    List surveys
      limeAPI.body = JSON.stringify({
        method: "list_surveys",
        params: [SESSIONKEY, lime_user],
        id: 1
      });

      request(limeAPI, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          body = JSON.parse(body);
          console.log(body.result);
        } else console.log("ERROR -->" + error);
      });

      //    List questions from survey ID
      limeAPI.body = JSON.stringify({
        method: "list_questions",
        params: [SESSIONKEY, 243417],
        id: 1
      });

      request(limeAPI, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          body = JSON.parse(body);
          console.log(body);
        } else console.log("ERROR -->" + error);
      });

      //    Save responses
      const fakeResponse = {
        "243417X3X170": "A1",
        "243417X3X171SQ001": "A1",
        "243417X3X171SQ002": "A1"
      };

      limeAPI.body = JSON.stringify({
        method: "add_response",
        params: [SESSIONKEY, 243417, fakeResponse],
        id: 1
      });

      request(limeAPI, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          body = JSON.parse(body);
        } else console.log("ERROR -->" + error + response + body);
      });
    }
  } else console.log("ERROR -->" + error);
});

module.exports = app;
