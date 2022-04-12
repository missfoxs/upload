const fs = require("fs");

const reader = fs.createReadStream("package.json"); // 读取流
// const write = fs.createWriteStream("output.txt"); // 写入流
const write = fs.createWriteStream("pipeoutput.txt"); // 写入流
let data = "";

// 读取之后再写入，嵌套代码，看起来不直观
// reader.on("data", chunk => {
//   data += chunk;
// });

// reader.on("end", () => {
//   console.log("end", data);
//   write.write(data, "utf-8");
//   write.end();
// });

// write.on("finish", () => {
//   console.log("写入完成");
// });

// 使用管道读取后写入
reader.pipe(write);
