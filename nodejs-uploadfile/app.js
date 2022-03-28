var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart(); // 处理文件上传
const util = require("./utils/index");

var routes = require("./routes/index");
var users = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", routes);
app.use("/users", users);

// get方法
app.get("/api/user", (req, res) => {
  // res.status(201).end();
  res.json({ name: "xiaoming", age: 19 });
});

// post方法
app.post("/api/user", (req, res) => {
  console.log(req.body);
  // res.status(201).end();
  res.send({ message: "保存成功" });
});

// 获取文件
app.get("/api/file", (req, res) => {
  res.download("./uploads/git.zip", err => {
    if (err) {
      console.log(err);
    } else {
      console.log("发送成功");
    }
  });
});

// 获取图片
app.get("/api/img", (req, res) => {
  res.download("./uploads/FLOWER.JPG", err => {
    if (err) {
      console.log(err);
    } else {
      console.log("发送成功");
    }
  });
});

app.post("/api/uploadFile", multipartMiddleware, (req, res, next) => {
  const { files, body } = req;
  console.log(files, body);
  util.editSelf(files, response => {
    next(response);
  });
  res.send({ message: 0 });
});

// console.log(editSelf)
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {},
  });
});

module.exports = app;
