//并发控制
function createLimitPromise(limitNum, promiseListRaw) {
  let resArr = [];
  let handling = 0;
  let resolvedNum = 0;
  let promiseList = [...promiseListRaw];
  let runTime = promiseListRaw.length;

  return new Promise(resolve => {
    //并发执行limitNum 次
    for (let i = 1; i <= limitNum; i++) {
      run();
    }

    function run() {
      if (!promiseList.length) return;
      handling += 1;
      console.log("cur handling:" + handling);
      handle(promiseList.shift())
        .then(res => {
          resArr.push(res);
        })
        .catch(e => {
          //ignore
          console.log("catch error");
        })
        .finally(() => {
          handling -= 1;
          resolvedNum += 1;
          console.log(`resolvedNum : ${resolvedNum}`);
          if (resolvedNum === runTime) {
            resolve(resArr);
          }
          run();
        });
    }
    function handle(promise) {
      return new Promise((resolve, reject) => {
        promise.then(res => resolve(res)).catch(e => reject(e));
      });
    }
  });
}

//获取HTML 中的file对象
function getElFile(selector) {
  return document.querySelector(selector).files[0];
}

//切片数组 封装成 http 请求
// function createChunkPromiseList(chunkList, name, TOKEN) {
//   return chunkList
//     .map((chunk, index) => {
//       console.log(chunk);
//       let formdata = new FormData();
//       formdata.append("type", "upload");
//       formdata.append("name", name);
//       formdata.append("token", TOKEN);
//       formdata.append("chunk", chunk);
//       formdata.append("index", index);
//       return formdata;
//     })
//     .map(formdata => {
//       console.log(formdata.get("type"));
//       return axios.post(UPLOAD_URL, formdata, axiosConfig);
//     });
// }

// 切分文件
export function sliceFile(file, chunkSize) {
  const chunkList = [];
  let start = 0;
  let end = chunkSize;
  while (true) {
    const chunk = file.slice(start, end);
    if (!chunk.size) break;
    chunkList.push(chunk);
    start += chunkSize;
    end = start + chunkSize;
  }
  return chunkList;
}

const UPLOAD_URL = "http://localhost:3002/api/uploadFile";

// 为每个chunk生成上传函数
export function generateFetchList(blobs, name, TOKEN) {
  return blobs.map((blob, index) => {
    const formdata = new FormData();
    formdata.append("type", "upload");
    formdata.append("name", name);
    formdata.append("token", TOKEN);
    formdata.append("chunk", blob);
    formdata.append("index", index);
    return fetch("http://localhost:3002/api/uploadFile", {
      method: "POST",
      body: formdata,
    });
  });
}


