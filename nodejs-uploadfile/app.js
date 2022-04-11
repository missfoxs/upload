var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
// const multipart = require("connect-multiparty");
// const multipartMiddleware = multipart(); // 处理文件上传
const multipart = require("multiparty");
const fse = require("fs-extra");
const util = require("./utils/index");

const UPLOAD_DIR = path.resolve(__dirname, "..", "target");

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

// 上传文件
// app.post("/api/uploadFile", multipartMiddleware, (req, res, next) => {
//   const { files, body } = req;
//   console.log(files, body);
//   // util.editSelf(files, response => {
//   //   next(response);
//   // });
//   res.send({ message: "上传成功！" });
// });

app.post("/api/uploadFile", (req, res) => {
  const form = new multipart.Form();
  form.parse(req, async (err, fields, file) => {
    console.log(fields);
    const { filename, hash } = fields;
    const { chunk } = file;
    // console.log("filename", filename, "hash", hash, chunk);

    const chunkDir = path.resolve(UPLOAD_DIR, filename[0]); // 为啥传过来是个数组

    // 创建目录
    if (!fse.existsSync(chunkDir)) {
      await fse.mkdirs(chunkDir);
    }

    await fse.move(chunk[0].path, `${chunkDir}/${hash[0]}`);
  });
  res.end("received!!");
});

// 处理post请求携带的流式数据
const resolvePost = req => {
  return new Promise(resolve => {
    let chunk = "";
    req.on("data", data => {
      chunk += data;
    });
    req.on("end", () => {
      resolve(JSON.parse(chunk));
    });
  });
};

const pipeStream = (path, writeStream) => {
  new Promise(resolve => {
    const readStream = fse.createReadStream(path);
    readStream.on("end", () => {
      fse.unlinkSync(path);
      resolve();
    });
    readStream.pipe(writeStream);
  });
};

const mergeChunk = async (filePath, filename, size) => {
  const chunkDir = path.resolve(UPLOAD_DIR, filename);
  const chunkPaths = await fse.readdir(chunkDir);
  chunkPaths.sort((a, b) => a.split("-")[1] - b.split("-")[1]);
  await Promise.all(
    chunkPaths.map((chunkPath, index) => {
      return pipeStream(
        path.resolve(chunkDir, chunkPath),
        fse.createWriteStream(filePath, {
          start: index * size,
          end: (index + 1) * size,
        })
      );
    })
  ).then(res => {
    console.log(res, "复制完成");
  });
};

app.post("/api/merge", async (req, res) => {
  const { filename, size = 1024 } = await resolvePost(req);
  // console.log(filename);
  const filePath = path.resolve(UPLOAD_DIR, filename);
  console.log(filePath);
  debugger
  await mergeChunk(filePath, filename, size);
  res.send({ message: "已合并" });
});

debugger
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
