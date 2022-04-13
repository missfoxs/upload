import { useState } from "react";
import "./App.css";
import { getData, upload } from "./service";
import { baseURL } from "./utils";

function App() {
  const handleUpload = async e => {
    const {
      target: { files },
    } = e;
    // Array.from(files).map(async file => {
    //   const formData = new FormData();
    //   formData.append("file", file);
    //   formData.append("user", "xiaoming");
    //   const res = await upload(formData);
    //   console.log(res);
    // });
    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("user", "xiaoming");
    fetch(`${baseURL}/upload`, {
      method: "POST",
      body: formData,
    });
  };

  return (
    <>
      <button
        onClick={async () => {
          const res = await getData({ name: "JACK" });
        }}
      >
        POST
      </button>
      <input type="file" onChange={handleUpload} />
    </>
  );
}

export default App;
