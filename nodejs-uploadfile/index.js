const Koa = require("koa");
const Route = require("koa-route"); // 引错了，先这样吧
const router = require("koa-router")();
const KoaBody = require("koa-body");
const path = require("path");
const staticServer = require("koa-static");
const compose = require("koa-compose");
const cors = require("koa2-cors");
const fs = require("fs");

const app = new Koa();
const UPLOAD_DIR = path.join(__dirname, "./uploads");

// 接口
router.get("/index", ctx => {
  console.log(ctx.query);
  console.log(ctx.querystring);
  console.log(ctx.request.query.name);
  console.log(ctx.request.querystring);
});

router.post("/users", async ctx => {
  console.log(ctx.request.body);
  ctx.body = { message: "上传成功" };
});

router.post("/upload", async ctx => {
  // console.log(ctx.request.body);
  const files = ctx.request.files || {};
  const filePaths = [];
  for (const key in files) {
    const file = files[key];
    const filePath = path.join(UPLOAD_DIR, file.name);
    const reader = fs.createReadStream(file.path);
    const write = fs.createWriteStream(filePath);
    reader.pipe(write);
    filePaths.push(filePath);
  }
  ctx.body = filePaths;
});

// 页面
const Index = ctx => {
  const body = ctx.request.body;
  if (!body.name) ctx.throw(400, ".name required");
  console.log(body.name);
  ctx.response.body = { name: body.name };
};

const About = ctx => {
  ctx.response.body = '<a href="/">Index Page</a>';
};

// logger 中间件
// 在request和response之间执行
const logger = (ctx, next) => {
  console.log(`${Date.now()} ${ctx.request.method} ${ctx.request.url}`);
  next();
};

const one = (ctx, next) => {
  console.log(">> one");
  next();
  console.log("<< one");
};

// 如果某个中间件没有next,则不会执行下面的中间件，控制权返回给上一个。同时不会有返回
// TODO:如果使用return中会怎样
const two = (ctx, next) => {
  console.log(">> two");
  next();
  console.log("<< two");
};

const three = (ctx, next) => {
  console.log(">> three");
  next();
  console.log("<< three");
  // ctx.throw(500);
};

// 错误处理中间件
const handlerError = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.response.status = err.statusCode || err.status || 500;
    ctx.response.body = {
      message: err.message,
    };
  }
};

// 跨域中间件
// const cors = async (ctx, next) => {
//   ctx.set("Access-Control-Allow-Origin", "*");
//   ctx.set("Access-Control-Allow-Headers", "*");
//   ctx.set("Access-Control-Allow-Methods", "*");
//   if (ctx.method == "OPTIONS") {
//     ctx.body = 200;
//   } else {
//     await next();
//   }
// };

// app.use(one);
// app.use(two);
// app.use(three);
// app.use(logger);
// 错误处理的要放在最开头, 在使用中间件的时候最好加上async await否则后面的post等请求可以接收到数据，但是返回给前段是404
// https://juejin.cn/post/6945640015816982564
// app.use(compose([handlerError, one, two, three, logger]));
app.use(cors());
app.use(
  KoaBody({
    multipart: true,
  })
); // 此处顺序不可以变。
app.use(router.routes());
// app.use(cors);
// 静态资源, 直接下载？
// const static = staticServer(path.join(__dirname));

// app.use(Route.get("/", Index));
// app.use(Route.get("/about", About));
// app.use(static);

app.listen(3000, () => "run in 3000");
