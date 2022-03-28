const fs = require("fs");

exports.editSelf = (data, callback) => {
  console.log(data);
  const img = fs.createReadStream(data.image.path);
  const nono = fs.createWriteStream("../upload/asas.jpg");
  img.pipe(nono); //这一步就是管道流传输
  //读取文件发生错误事件
  img.on("error", err => {
    console.log("发生异常:", err);
  });
  //已打开要读取的文件事件
  img.on("open", fd => {
    console.log("文件已打开:", fd);
  });
  //文件已经就位，可用于读取事件
  img.on("ready", () => {
    console.log("文件已准备好..");
  });

  //文件读取中事件·····
  img.on("data", chunk => {
    console.log("读取文件数据:", chunk);
  });

  //文件读取完成事件
  img.on("end", () => {
    console.log("读取已完成..");
  });

  //文件已关闭事件
  img.on("close", () => {
    console.log("文件已关闭！");
  });
};
