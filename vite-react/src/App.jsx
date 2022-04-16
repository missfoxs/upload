import { useRef, useState } from "react";
import "./App.css";
import { getData, merge, upload, verify } from "./service";
import { baseURL } from "./utils";
const SIZE = 1 * 1204 * 1024;

function App() {
  const [fileName, setFileName] = useState();
  const [percentage, setPercentage] = useState(0);
  const [hash, setHash] = useState();
  const hashRef = useRef(hash);
  // 进度
  const handleProgress = e => {
    console.log(e);
  };

  const request = data => {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = handleProgress;
      xhr.open("POST", `${baseURL}/upload`);
      xhr.send(data);
      xhr.onload = res => {
        resolve({ data: res.target.response });
      };
    });
  };

  // 文件切片
  const sliceFile = (file, step = SIZE) => {
    let current = 0;
    const { size } = file;
    const chunks = [];
    while (current <= size) {
      const chunk = file.slice(current, current + step);
      chunks.push(chunk);
      current += step;
    }
    return chunks;
  };

  const generateUploadRequest = (fileList, name) => {
    return fileList.map((file, idx) => {
      const formData = new FormData();
      formData.append("chunk", file);
      formData.append("idx", idx);
      formData.append("hash", hashRef.current?.hash);
      formData.append("chunkName", name + "---" + idx);
      formData.append("fileName", name);
      return request(formData);
    });
  };

  // 计算hash值
  const calculateHash = fileChunks => {
    return new Promise(resolve => {
      const worker = new Worker("/hash.js");
      console.time("samplehash"); // 开始计算hash
      worker.postMessage({ fileChunkList: fileChunks });
      worker.onmessage = res => {
        const {
          data: { hash, percentage },
        } = res;
        if (hash) {
          resolve(hash);
        }
        setPercentage(percentage);
      };
    });
  };

  // 发送合并请求
  const mergeRequest = async fileName => {
    const res = await merge({ fileName, size: SIZE });
    if (res.code === 0) {
      console.log("合并成功");
    }
  };

  const handleUpload = async e => {
    const {
      target: { files },
    } = e;
    const [file] = files;
    if (!file) {
      alert("请上传文件");
      return;
    }
    setFileName(file.name); // set后不能立马获取到
    const fileChunks = sliceFile(file);
    const _hash = await calculateHash(fileChunks);
    // setHash(_hash);
    hashRef.current = _hash;
    console.log("hash", _hash);
    // return;
    Promise.all(generateUploadRequest(fileChunks, file.name)).then(res => {
      console.log(res);
      // 发送合并请求
      mergeRequest(file.name);
    });
  };

  const verifyShouleUpload = async () => {
    const res = await verify({ fileName: "dist.zip", hash: "111" });
    const { shouleUpload } = res;
    if (!shouleUpload) {
      console.log("上传成功");
    }
  };

  return (
    <>
      <div
        onClick={async () => {
          const res = await getData({ name: "JACK" });
        }}
      >
        POST
      </div>
      <input type="file" onChange={handleUpload} />
      {!!percentage && <div>{percentage}%</div>}
      <div
        onClick={async () => {
          // const res = await merge({ fileName: "openresty-1.15.8.1-win64.zip" });
          const res = await merge({
            fileName: "微信图片_20220414212958.png",
            size: SIZE,
          });
        }}
      >
        merge
      </div>
      <div onClick={verifyShouleUpload}>秒传</div>
    </>
  );
}

export default App;
