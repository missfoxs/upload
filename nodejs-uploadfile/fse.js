const fse = require("fs-extra");
const fs = require("fs");
const path = require("path");

const UPLOAD_DIR = path.join(__dirname, "./targets");

const BASE_URL = path.join(__dirname, "targets");

const fileDir = path.join(BASE_URL, "file1", "file2");

// if (!fse.existsSync(fileDir)) {
//   fse.mkdirs(fileDir);
// }

// console.log(111);

const name = "FLOWER.JPG";
// const name = "nginx.conf";
// const readStream = fs.createReadStream(path.join(BASE_URL, name));
// const writeStream = fs.createWriteStream(name);
// readStream.pipe(writeStream);

// readStream.on("end", () => {
//   console.log("end");
// });

const pipeStream = (path, writeStream) =>
  new Promise(resolve => {
    const readStream = fse.createReadStream(path);
    readStream.on("end", () => {
      // fse.unlinkSync(path);
      resolve(1);
    });
    readStream.pipe(writeStream);
  });

const mergeChunk = async (chunkDir, fileName, size) => {
  let chunkPaths = await fse.readdir(chunkDir);
  chunkPaths.sort((a, b) => a.split("---")[1] - b.split("---")[1]);
  chunkPaths = chunkPaths.map(cp => path.join(UPLOAD_DIR, fileName, cp));
  const writePath = path.resolve(UPLOAD_DIR, "generate", fileName);
  // console.log(chunkPaths, writePath);
  // return

  const res = await Promise.all(
    chunkPaths.map((chunkPath, index) => {
      const data = {
        start: index * size,
        end: (index + 1) * size,
      };
      console.log(data, chunkPath, writePath);
      return pipeStream(chunkPath, fse.createWriteStream(writePath, data));
    })
  );
  console.log("res", res);
};

mergeChunk(path.resolve(UPLOAD_DIR, "RR.jpg"), "RR.jpg", 1232896);
