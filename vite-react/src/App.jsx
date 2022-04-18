import { useRef, useState } from "react";
import "./App.css";
import { getData, merge, upload, verify } from "./service";
import { baseURL } from "./utils";
const SIZE = 1 * 1204 * 1024;

function App() {
  const [percentage, setPercentage] = useState(0);
  // const [fileName, setFileName] = useState();
  // const [hash, setHash] = useState();
  const hashRef = useRef("");
  const fileNameRef = useRef("");
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

  const generateUploadRequest = fileList => {
    return fileList.map((file, idx) => {
      const formData = new FormData();
      formData.append("chunk", file);
      formData.append("idx", idx);
      formData.append("hash", hashRef.current);
      formData.append("chunkName", hashRef.current + "---" + idx);
      formData.append("fileName", fileNameRef.current);
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
    // setFileName(file.name); // set后不能立马获取到
    fileNameRef.current = file.name;
    const fileChunks = sliceFile(file);
    const _hash = await calculateHash(fileChunks);
    // setHash(_hash);
    hashRef.current = _hash;
    console.log("hash", _hash);
    // return;
    const res = await Promise.all(generateUploadRequest(fileChunks));
    console.log(res);
    // 发送合并请求
    mergeRequest(file.name);
  };

  const verifyShouleUpload = async () => {
    const res = await verify({
      fileName: fileNameRef.current,
      hash: hashRef.current,
    });
    const { shouleUpload } = res;
    if (!shouleUpload) {
      console.log("上传成功");
      alert("miao chuan~~");
    }
  };

  return (
    <>
      <div
        onClick={async () => {
          const res = await getData({ name: "JACK" });
        }}
      >
        post
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
          s;
        }}
      >
        merge
      </div>
      <div onClick={verifyShouleUpload}>miao chuan</div>
    </>
  );
}

export default App;
