const Koa = require("koa");
const Route = require("koa-route"); // 引错了，先这样吧
const router = require("koa-router")();
const KoaBody = require("koa-body");
const path = require("path");
const staticServer = require("koa-static");
const compose = require("koa-compose");

const app = new Koa();
// app.use(apiRouter.routes());
// app.use(apiRouter.allowedMethods());
// app.use(
//   KoaBody({
//     multipart: true, // 支持文件上传
//     // encoding: "gzip",
//     // formidable: {
//     //   uploadDir: path.join(__dirname, "public/upload/"), // 设置文件上传目录
//     //   keepExtensions: true, // 保持文件的后缀
//     //   maxFieldsSize: 2 * 1024 * 1024, // 文件上传大小
//     //   onFileBegin: (name, file) => {},
//     // },
//   })
// );

// 接口
router.get("/index", ctx => {
  console.log(ctx.query);
  console.log(ctx.querystring);
  console.log(ctx.request.query.name);
  console.log(ctx.request.querystring);
});

router.post("/users", ctx => {
  const body = ctx.request.body;
  console.log("body", body);
  if (!body.name) ctx.throw(400, ".name required");
  ctx.body = { name: body.name };
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
// app.use(one);
// app.use(two);
// app.use(three);
// app.use(logger);
// app.use(compose([handlerError, one, two, three, logger])); // 错误处理的要放在最开头

app.use(compose([handlerError, one, two, three, logger]));
app.use(KoaBody()); // 此处顺序不可以变。
app.use(router.routes());
// 静态资源, 直接下载？
// const static = staticServer(path.join(__dirname));

// app.use(Route.get("/", Index));
// app.use(Route.get("/about", About));
// app.use(static);

app.listen(3000);
