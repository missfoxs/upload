import { useState } from "react";
import "./App.css";
import { getData, merge, upload } from "./service";
import { baseURL } from "./utils";
const SIZE = 1 * 1204 * 1024;

function App() {
  const [fileName, setFileName] = useState();

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

  const createUploadPromise = (fileList, name) => {
    return fileList.map((file, idx) => {
      const formData = new FormData();
      formData.append("chunk", file);
      formData.append("idx", idx);
      formData.append("chunkName", name + "---" + idx);
      formData.append("fileName", name);
      return fetch(`${baseURL}/upload`, {
        method: "POST",
        body: formData,
      });
    });
  };

  // 发送合并请求
  const mergeRequest = async () => {
    const res = await merge(fileName);
    if (res.code === 0) {
      alert("合并成功");
    }
  };

  const handleUpload = async e => {
    const {
      target: { files },
    } = e;

    Array.from(files).forEach(file => {
      setFileName(file.name); // set后不能立马获取到
      const fileChunks = sliceFile(file);
      console.log(fileChunks);
      Promise.all(createUploadPromise(fileChunks, file.name)).then(res => {
        console.log(res);
        // 发送合并请求
        // mergeRequest();
      });
    });
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
      <div
        onClick={async () => {
          // const res = await merge({ fileName: "openresty-1.15.8.1-win64.zip" });
          const res = await merge({ fileName: "微信图片_20220414212958.png", size: SIZE });
        }}
      >
        merge
      </div>
    </>
  );
}

export default App;
